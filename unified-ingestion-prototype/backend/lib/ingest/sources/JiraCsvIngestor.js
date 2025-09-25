// src/lib/ingest/sources/JiraCsvIngestor.js
import { BaseIngestor } from "../base/BaseIngestor.js"
import { parseCsv } from "../utils/csv.js"
import { mapJiraCsvRow } from "../mappers/jira.js"

export class JiraCsvIngestor extends BaseIngestor {
  async load(input) {
    const { filePath } = input

    if (!filePath) {
      throw new Error("File path is required for Jira CSV ingestion")
    }

    this.logger.info({
      runId: this.runId,
      source: this.source,
      message: "Loading Jira CSV file",
      filePath,
    })

    const csvContent = await this.storage.readText(filePath)
    const rows = parseCsv(csvContent)

    this.logger.info({
      runId: this.runId,
      source: this.source,
      message: `Successfully parsed CSV with ${rows.length} rows`,
      filePath,
    })

    return rows
  }

  async validate(rows) {
    if (!Array.isArray(rows)) {
      throw new Error("CSV parsing must return an array")
    }

    if (rows.length === 0) {
      throw new Error("Jira CSV file is empty")
    }

    // Check for required columns
    const firstRow = rows[0]
    const requiredColumns = ["Issue key", "Key", "issue_key"] // Accept variations
    const hasRequiredColumn = requiredColumns.some((col) =>
      firstRow.hasOwnProperty(col)
    )

    if (!hasRequiredColumn) {
      const availableColumns = Object.keys(firstRow)
      throw new Error(
        `Jira CSV missing required column. Expected one of: ${requiredColumns.join(
          ", "
        )}. ` + `Available columns: ${availableColumns.join(", ")}`
      )
    }

    this.logger.info({
      runId: this.runId,
      source: this.source,
      message: "CSV validation passed",
      rowCount: rows.length,
      columns: Object.keys(firstRow),
    })
  }

  async transform(rows) {
    const transformedRows = []
    const errors = []

    for (let i = 0; i < rows.length; i++) {
      try {
        const transformed = mapJiraCsvRow(rows[i])

        // Skip rows without issue key
        if (!transformed.issue_key) {
          this.logger.warn({
            runId: this.runId,
            source: this.source,
            message: `Skipping row ${i + 1}: missing issue key`,
            row: rows[i],
          })
          continue
        }

        transformedRows.push(transformed)
      } catch (error) {
        errors.push({
          rowIndex: i + 1,
          error: error.message,
          data: rows[i],
        })
      }
    }

    if (errors.length > 0) {
      this.logger.warn({
        runId: this.runId,
        source: this.source,
        message: `Failed to transform ${errors.length} rows`,
        errors: errors.slice(0, 5), // Log first 5 errors
      })

      // Save errors for investigation
      await this.storage.saveJson(
        `errors/jira_csv/${this.runId}/transformation_errors.json`,
        errors
      )
    }

    return transformedRows
  }

  async upsert(rows) {
    if (rows.length === 0) {
      return { rows_read: 0, rows_upserted: 0, rows_skipped: 0 }
    }

    return await this.repo.upsertBatch("operational_jira_issue", rows, [
      "issue_key",
    ])
  }

  async persistArtifacts({ raw, rows, stats }) {
    const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD

    // Save raw CSV data to bronze layer
    await this.storage.saveJson(
      `bronze/operational/jira/${timestamp}/csv_${this.runId}.json`,
      raw
    )

    // Save processed data to silver layer
    await this.storage.saveJson(
      `silver/operational/jira/issues_${this.runId}.json`,
      { data: rows, metadata: { runId: this.runId, stats, timestamp } }
    )
  }
}
