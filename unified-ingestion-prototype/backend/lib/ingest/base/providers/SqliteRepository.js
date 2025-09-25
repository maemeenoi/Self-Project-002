// src/lib/ingest/base/providers/SqliteRepository.js
import { Repository } from "../Repository.js"
import Database from "better-sqlite3"
import { randomUUID } from "crypto"

export class SqliteRepository extends Repository {
  constructor({ file }) {
    super()
    this.dbFile = file
    this.db = null
    this.transaction = null
  }

  async _ensureDb() {
    if (!this.db) {
      this.db = new Database(this.dbFile)
      await this._initSchema()
    }
    return this.db
  }

  async _initSchema() {
    // Create schemas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS meta_ingestion_run (
        run_id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        started_at TEXT NOT NULL,
        finished_at TEXT NULL,
        rows_read INTEGER NULL,
        rows_upserted INTEGER NULL,
        rows_skipped INTEGER NULL,
        status TEXT NOT NULL DEFAULT 'running'
      );

      CREATE TABLE IF NOT EXISTS meta_ingestion_error (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id TEXT NOT NULL,
        source TEXT NOT NULL,
        error_text TEXT NOT NULL,
        artifact_path TEXT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS focus_cost_line_item (
        provider TEXT NOT NULL,
        billing_period TEXT NOT NULL,
        usage_start TEXT NOT NULL,
        usage_end TEXT NOT NULL,
        resource_id TEXT NOT NULL DEFAULT '',
        sku TEXT NOT NULL DEFAULT '',
        meter TEXT NOT NULL DEFAULT '',
        region TEXT NULL,
        currency TEXT NULL,
        quantity REAL NOT NULL,
        unit TEXT NULL,
        public_cost REAL NOT NULL,
        effective_cost REAL NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (provider, billing_period, usage_start, usage_end, resource_id, sku, meter)
      );

      CREATE TABLE IF NOT EXISTS operational_github_pull_request (
        repo_full_name TEXT NOT NULL,
        number INTEGER NOT NULL,
        title TEXT NULL,
        state TEXT NULL,
        author_login TEXT NULL,
        created_at TEXT NULL,
        updated_at TEXT NULL,
        merged_at TEXT NULL,
        additions INTEGER NULL,
        deletions INTEGER NULL,
        changed_files INTEGER NULL,
        ingested_at TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (repo_full_name, number)
      );

      CREATE TABLE IF NOT EXISTS operational_jira_issue (
        issue_key TEXT PRIMARY KEY,
        summary TEXT NULL,
        status TEXT NULL,
        assignee TEXT NULL,
        reporter TEXT NULL,
        project TEXT NULL,
        priority TEXT NULL,
        created_at TEXT NULL,
        updated_at TEXT NULL,
        ingested_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `)
  }

  async begin() {
    const db = await this._ensureDb()
    this.transaction = db.transaction(() => {})
    this.transaction.begin()
  }

  async commit() {
    if (this.transaction) {
      this.transaction.commit()
      this.transaction = null
    }
  }

  async rollback() {
    if (this.transaction) {
      this.transaction.rollback()
      this.transaction = null
    }
  }

  async upsertBatch(table, rows, pkFields) {
    const db = await this._ensureDb()

    if (!rows || rows.length === 0) {
      return { rows_read: 0, rows_upserted: 0, rows_skipped: 0 }
    }

    const columns = Object.keys(rows[0])
    const placeholders = columns.map(() => "?").join(", ")

    // For SQLite, we'll use INSERT OR REPLACE (which works with PRIMARY KEY)
    const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(
      ", "
    )}) VALUES (${placeholders})`
    const stmt = db.prepare(sql)

    let upserted = 0
    const transaction = db.transaction((rows) => {
      for (const row of rows) {
        const values = columns.map((col) => row[col])
        stmt.run(values)
        upserted++
      }
    })

    transaction(rows)

    return {
      rows_read: rows.length,
      rows_upserted: upserted,
      rows_skipped: 0,
    }
  }

  async insert(table, rows) {
    const db = await this._ensureDb()

    if (!rows || rows.length === 0) {
      return { rows_inserted: 0 }
    }

    const columns = Object.keys(rows[0])
    const placeholders = columns.map(() => "?").join(", ")
    const sql = `INSERT INTO ${table} (${columns.join(
      ", "
    )}) VALUES (${placeholders})`
    const stmt = db.prepare(sql)

    let inserted = 0
    const transaction = db.transaction((rows) => {
      for (const row of rows) {
        const values = columns.map((col) => row[col])
        stmt.run(values)
        inserted++
      }
    })

    transaction(rows)
    return { rows_inserted: inserted }
  }

  async recordRunStart(runId, source) {
    const db = await this._ensureDb()
    const stmt = db.prepare(`
      INSERT INTO meta_ingestion_run (run_id, source, started_at, status)
      VALUES (?, ?, ?, 'running')
    `)
    stmt.run(runId, source, new Date().toISOString())
  }

  async recordRunCompletion(runId, stats, status) {
    const db = await this._ensureDb()
    const stmt = db.prepare(`
      UPDATE meta_ingestion_run 
      SET finished_at = ?, rows_read = ?, rows_upserted = ?, rows_skipped = ?, status = ?
      WHERE run_id = ?
    `)
    stmt.run(
      new Date().toISOString(),
      stats.rows_read || 0,
      stats.rows_upserted || 0,
      stats.rows_skipped || 0,
      status,
      runId
    )
  }

  async recordRunError(runId, errorMessage, artifactPath = null) {
    const db = await this._ensureDb()
    const stmt = db.prepare(`
      INSERT INTO meta_ingestion_error (run_id, source, error_text, artifact_path)
      SELECT ?, r.source, ?, ?
      FROM meta_ingestion_run r
      WHERE r.run_id = ?
    `)
    stmt.run(runId, errorMessage, artifactPath, runId)
  }

  async getRecentRuns(limit = 10) {
    const db = await this._ensureDb()
    const stmt = db.prepare(`
      SELECT run_id, source, started_at, finished_at, rows_read, rows_upserted, rows_skipped, status
      FROM meta_ingestion_run
      ORDER BY started_at DESC
      LIMIT ?
    `)
    return stmt.all(limit)
  }

  async getRunErrors(runId = null, limit = 50) {
    const db = await this._ensureDb()
    let sql = `
      SELECT e.*, r.source, r.started_at
      FROM meta_ingestion_error e
      JOIN meta_ingestion_run r ON e.run_id = r.run_id
    `
    let params = []

    if (runId) {
      sql += ` WHERE e.run_id = ?`
      params.push(runId)
    }

    sql += ` ORDER BY e.created_at DESC LIMIT ?`
    params.push(limit)

    const stmt = db.prepare(sql)
    return stmt.all(...params)
  }
}
