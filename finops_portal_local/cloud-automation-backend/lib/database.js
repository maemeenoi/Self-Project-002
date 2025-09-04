const sqlite3 = require('sqlite3').verbose();

// Database will live in memory by default unless DB_FILE env var provided
const DB_FILE = process.env.DB_FILE || './finops.db';

const db = new sqlite3.Database(DB_FILE);

/**
 * Initialize database tables if they do not exist.  This function creates
 * tables for Users, CostUploads and NormalizedCost.  It uses SQLite which
 * stores data in a file on disk.  When using Azure SQL in production,
 * this logic should be replaced with appropriate migration scripts.
 */
function initDb() {
  db.serialize(() => {
    // Users table
    db.run(
      `CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
      )`,
    );

    // CostUploads table
    db.run(
      `CREATE TABLE IF NOT EXISTS CostUploads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES Users(id)
      )`,
    );

    // NormalizedCost table
    db.run(
      `CREATE TABLE IF NOT EXISTS NormalizedCost (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        upload_id INTEGER NOT NULL,
        service TEXT NOT NULL,
        cost REAL NOT NULL,
        time_period TEXT NOT NULL,
        category TEXT,
        tags TEXT,
        metadata TEXT,
        FOREIGN KEY(upload_id) REFERENCES CostUploads(id)
      )`,
    );
  });
}

module.exports = {
  db,
  initDb,
};