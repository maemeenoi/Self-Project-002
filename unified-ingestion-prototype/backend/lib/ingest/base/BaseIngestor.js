// src/lib/ingest/base/BaseIngestor.js
export class BaseIngestor {
  constructor({ source, runId, logger, storage, repo, config }) {
    this.source = source // e.g., 'github', 'jira_csv', 'jira_api', 'focus_csv'
    this.runId = runId // uuid for this run
    this.logger = logger // structured JSON logger
    this.storage = storage // blob/local fs for artifacts
    this.repo = repo // database repository (SQLite now, Azure SQL later)
    this.config = config // per-source config (tokens, URLs, parsing opts)
  }

  async ingest(input) {
    const startedAt = new Date()
    let stats = { rows_read: 0, rows_upserted: 0, rows_skipped: 0 }

    try {
      this.logger.info({
        runId: this.runId,
        source: this.source,
        message: "Starting ingestion",
        startedAt: startedAt.toISOString(),
      })

      await this.beforeAll(input)

      const raw = await this.load(input)
      await this.validate(raw)

      const rows = await this.transform(raw)
      stats = await this.upsert(rows)

      await this.persistArtifacts({ raw, rows, stats })

      const finishedAt = new Date()
      const duration = finishedAt - startedAt

      await this.afterAll({ startedAt, finishedAt, duration, ...stats })

      this.logger.info({
        runId: this.runId,
        source: this.source,
        message: "Ingestion completed successfully",
        duration,
        ...stats,
      })

      return { ok: true, ...stats, duration }
    } catch (err) {
      await this.handleError(err, { startedAt, ...stats })
      return { ok: false, error: err.message, ...stats }
    }
  }

  // hooks (optionally override)
  async beforeAll(input) {
    // Record run start in database
    await this.repo.recordRunStart(this.runId, this.source)
  }

  async afterAll({ startedAt, finishedAt, duration, ...stats }) {
    // Update run completion in database
    await this.repo.recordRunCompletion(this.runId, stats, "success")
  }

  async handleError(err, context) {
    this.logger.error({
      runId: this.runId,
      source: this.source,
      error: err.message,
      stack: err.stack,
      context,
    })

    // Record error in database
    await this.repo.recordRunError(this.runId, err.message)
    await this.repo.recordRunCompletion(this.runId, context, "failed")
  }

  // must implement in subclasses
  async load(input) {
    throw new Error(`load() not implemented for ${this.source}`)
  }

  async validate(raw) {
    throw new Error(`validate() not implemented for ${this.source}`)
  }

  async transform(raw) {
    throw new Error(`transform() not implemented for ${this.source}`)
  }

  async upsert(rows) {
    throw new Error(`upsert() not implemented for ${this.source}`)
  }

  // optional hook
  async persistArtifacts({ raw, rows, stats }) {
    // Save raw data to bronze layer
    await this.storage.saveJson(
      `bronze/${this.source}/${this.runId}/raw.json`,
      raw
    )

    // Save processed data to silver layer
    await this.storage.saveJson(
      `silver/${this.source}/${this.runId}/processed.json`,
      rows
    )

    // Save run metadata
    await this.storage.saveJson(
      `silver/${this.source}/${this.runId}/metadata.json`,
      {
        runId: this.runId,
        source: this.source,
        stats,
        timestamp: new Date().toISOString(),
      }
    )
  }
}
