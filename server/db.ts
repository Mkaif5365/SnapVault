import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { events, photos } from '../shared/schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

// Get the current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize SQLite database
const sqlite = new Database(resolve(__dirname, '../sqlite.db'));
export const db = drizzle(sqlite);

// Initialize database with migrations
export function initializeDatabase() {
  try {
    // Run migrations
    migrate(db, { migrationsFolder: resolve(__dirname, '../migrations') });
    console.log('Database migrations applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
    throw error;
  }
} 