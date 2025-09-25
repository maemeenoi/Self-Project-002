// src/lib/ingest/base/Repository.js
// Base repository interface - will be implemented by specific providers
export class Repository {
  async begin() {
    throw new Error("begin() not implemented")
  }

  async commit() {
    throw new Error("commit() not implemented")
  }

  async rollback() {
    throw new Error("rollback() not implemented")
  }

  async upsertBatch(table, rows, pkFields) {
    throw new Error("upsertBatch() not implemented")
  }

  async insert(table, rows) {
    throw new Error("insert() not implemented")
  }

  // Ingestion run tracking methods
  async recordRunStart(runId, source) {
    throw new Error("recordRunStart() not implemented")
  }

  async recordRunCompletion(runId, stats, status) {
    throw new Error("recordRunCompletion() not implemented")
  }

  async recordRunError(runId, errorMessage, artifactPath = null) {
    throw new Error("recordRunError() not implemented")
  }

  async getRecentRuns(limit = 10) {
    throw new Error("getRecentRuns() not implemented")
  }

  async getRunErrors(runId = null, limit = 50) {
    throw new Error("getRunErrors() not implemented")
  }
}
