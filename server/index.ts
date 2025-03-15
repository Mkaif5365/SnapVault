import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./db";
import cors from 'cors';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Database from 'better-sqlite3';
import { SqliteStorage } from './storage';

// Initialize the database
initializeDatabase();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: false }));

// Set up storage
const storage = new SqliteStorage();
app.set("storage", storage);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Function to apply database migrations
async function applyMigrations() {
  try {
    // Get the current file path
    const __dirname = dirname(fileURLToPath(import.meta.url));
    
    // Initialize SQLite database
    const dbPath = resolve(__dirname, '../sqlite.db');
    const sqlite = new Database(dbPath);
    
    // Create a migrations table if it doesn't exist to track applied migrations
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get all migration files
    const migrationsDir = resolve(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations are applied in order
    
    // Get already applied migrations
    const appliedMigrations = sqlite.prepare('SELECT name FROM migrations').all() as { name: string }[];
    const appliedMigrationNames = new Set(appliedMigrations.map(m => m.name));
    
    for (const file of migrationFiles) {
      // Skip if migration was already applied
      if (appliedMigrationNames.has(file)) {
        console.log(`Migration ${file} already applied, skipping`);
        continue;
      }
      
      const migrationPath = resolve(migrationsDir, file);
      const migration = fs.readFileSync(migrationPath, 'utf8');
      
      // Split the migration into individual statements
      const statements = migration.split(';').filter(stmt => stmt.trim());
      
      // Execute each statement
      try {
        sqlite.exec('BEGIN TRANSACTION;');
        
        for (const statement of statements) {
          if (statement.trim()) {
            console.log(`Executing migration ${file}: ${statement.trim().substring(0, 50)}...`);
            try {
              sqlite.exec(statement.trim());
            } catch (err: any) {
              // Ignore common errors that indicate the schema change was already applied
              if (err.code === 'SQLITE_ERROR' && 
                  (err.message.includes('already exists') || 
                   err.message.includes('duplicate column name') ||
                   err.message.includes('no such table'))) {
                console.log(`Schema object already exists or doesn't exist, continuing with migration`);
              } else {
                throw err;
              }
            }
          }
        }
        
        // Record this migration as applied
        sqlite.prepare('INSERT INTO migrations (name) VALUES (?)').run(file);
        
        sqlite.exec('COMMIT;');
        console.log(`Migration ${file} completed successfully`);
      } catch (error) {
        sqlite.exec('ROLLBACK;');
        console.error(`Error executing migration ${file}:`, error);
        throw error;
      }
    }
    
    // Close the database connection
    sqlite.close();
    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
    throw error;
  }
}

(async () => {
  try {
    // Apply database migrations
    await applyMigrations();
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
    
    // Handle graceful shutdown
    const handleShutdown = () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
      
      // Force close after 5 seconds if server doesn't close gracefully
      setTimeout(() => {
        console.log('Forcing server shutdown');
        process.exit(1);
      }, 5000);
    };

    // Listen for termination signals
    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
    process.on('SIGHUP', handleShutdown);
    
    // Handle Windows-specific signals
    if (process.platform === 'win32') {
      process.on('message', (msg) => {
        if (msg === 'shutdown') {
          handleShutdown();
        }
      });
    }
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
})();
