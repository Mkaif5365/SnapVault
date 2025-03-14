import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize SQLite database
const dbPath = resolve(__dirname, '../sqlite.db');
const sqlite = new Database(dbPath);

// Read the migration file
const migrationPath = resolve(__dirname, '../migrations/0001_add_user_columns.sql');
const migration = fs.readFileSync(migrationPath, 'utf8');

// Split the migration into individual statements
const statements = migration.split(';').filter(stmt => stmt.trim());

// Execute each statement
try {
  sqlite.exec('BEGIN TRANSACTION;');
  
  for (const statement of statements) {
    if (statement.trim()) {
      console.log(`Executing: ${statement.trim()}`);
      sqlite.exec(statement.trim());
    }
  }
  
  sqlite.exec('COMMIT;');
  console.log('Migration completed successfully');
} catch (error) {
  sqlite.exec('ROLLBACK;');
  console.error('Error executing migration:', error);
}

// Close the database connection
sqlite.close(); 