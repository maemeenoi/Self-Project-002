// src/lib/ingest/sources/FocusCsvIngestor.js
import { BaseIngestor } from "../base/BaseIngestor.js"
import { parseCsv } from "../utils/csv.js"
import { mapFocusRow } from "../mappers/focus.js"

export class FocusCsvIngestor extends BaseIngestor {
  async load(input) {
    const { filePath } = input

    if (!filePath) {
      throw new Error("File path is required for FOCUS CSV ingestion")
    }

    this.logger.info({
      runId: this.runId,
      source: this.source,
      message: "Loading FOCUS CSV file",
      filePath,
    })

    const csvContent = await this.storage.readText(filePath)

    // Parse with specific options for large CSV files
    const rows = parseCsv(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relaxColumnCount: true, // Handle inconsistent column counts
      maxRecordSize: 1048576, // 1MB max record size for large cost files
    })

    this.logger.info({
      runId: this.runId,
      source: this.source,
      message: `Successfully parsed FOCUS CSV with ${rows.length} rows`,
      filePath,
    })

    return rows
  }

  async validate(rows) {
    if (!Array.isArray(rows)) {
      throw new Error("CSV parsing must return an array")
    }

    if (rows.length === 0) {
      throw new Error("FOCUS CSV file is empty")
    }

    const firstRow = rows[0]
    const columns = Object.keys(firstRow)

    // Try to detect if this looks like a FOCUS-compatible file
    const hasAwsColumns = columns.some(
      (col) => col.startsWith("bill/") || col.startsWith("lineItem/")
    )
    const hasAzureColumns = columns.some((col) =>
      ["BillingAccountId", "MeterId", "CostInBillingCurrency"].includes(col)
    )
    const hasGcpColumns = columns.some((col) =>
      ["billing_account_id", "project.id", "cost"].includes(col)
    )

    if (!hasAwsColumns && !hasAzureColumns && !hasGcpColumns) {
      this.logger.warn({
        runId: this.runId,
        source: this.source,
        message: "CSV does not appear to be a recognized cloud billing format",
        availableColumns: columns.slice(0, 10), // Show first 10 columns for debugging
      })
    }

    // Sample validation on first few rows
    const sampleSize = Math.min(10, rows.length)
    for (let i = 0; i < sampleSize; i++) {
      const row = rows[i]
      if (!row || typeof row !== "object") {
        throw new Error(`Invalid row structure at index ${i}`)
      }
    }

    this.logger.info({
      runId: this.runId,
      source: this.source,
      message: "FOCUS CSV validation passed",
      rowCount: rows.length,
      detectedFormat: hasAwsColumns
        ? "AWS"
        : hasAzureColumns
        ? "Azure"
        : hasGcpColumns
        ? "GCP"
        : "Unknown",
      columns: columns.slice(0, 10), // Log first 10 columns
    })
  }

  async transform(rows) {
    const transformedRows = []
    const errors = []
    const batchSize = 1000 // Process in batches for large files

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)

      for (let j = 0; j < batch.length; j++) {
        const rowIndex = i + j
        try {
          const transformed = mapFocusRow(batch[j])

          // Basic data quality checks
          if (!transformed.provider || transformed.provider === "unknown") {
            this.logger.debug({
              runId: this.runId,
              source: this.source,
              message: `Unknown provider detected at row ${rowIndex + 1}`,
              availableColumns: Object.keys(batch[j]).slice(0, 5),
            })
          }

          transformedRows.push(transformed)
        } catch (error) {
          errors.push({
            rowIndex: rowIndex + 1,
            error: error.message,
            data: batch[j],
          })

          // Stop processing if too many errors
          if (errors.length > 100) {
            throw new Error(
              `Too many transformation errors (${errors.length}). Please check the CSV format.`
            )
          }
        }
      }

      // Log progress for large files
      if (rows.length > 10000 && i % 10000 === 0) {
        this.logger.info({
          runId: this.runId,
          source: this.source,
          message: `Processed ${i + batch.length}/${rows.length} rows`,
        })
      }
    }

    if (errors.length > 0) {
      this.logger.warn({
        runId: this.runId,
        source: this.source,
        message: `Failed to transform ${errors.length} rows out of ${rows.length}`,
        errorRate: `${((errors.length / rows.length) * 100).toFixed(2)}%`,
      })

      // Save errors for investigation
      await this.storage.saveJson(
        `errors/focus_csv/${this.runId}/transformation_errors.json`,
        {
          summary: {
            totalRows: rows.length,
            errorCount: errors.length,
            errorRate: (errors.length / rows.length) * 100,
          },
          errors: errors.slice(0, 50), // Save first 50 errors
        }
      )
    }

    return transformedRows
  }

  async upsert(rows) {
    if (rows.length === 0) {
      return { rows_read: 0, rows_upserted: 0, rows_skipped: 0 }
    }

    // For large datasets, process in batches
    const batchSize = 5000
    let totalStats = {
      rows_read: rows.length,
      rows_upserted: 0,
      rows_skipped: 0,
    }

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)

      this.logger.debug({
        runId: this.runId,
        source: this.source,
        message: `Upserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          rows.length / batchSize
        )}`,
        batchSize: batch.length,
      })

      const batchStats = await this.repo.upsertBatch(
        "focus_cost_line_item",
        batch,
        [
          "provider",
          "billing_period",
          "usage_start",
          "usage_end",
          "resource_id",
          "sku",
          "meter",
        ]
      )

      totalStats.rows_upserted += batchStats.rows_upserted
      totalStats.rows_skipped += batchStats.rows_skipped
    }

    return totalStats
  }

  async persistArtifacts({ raw, rows, stats }) {
    const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD
    const provider = rows.length > 0 ? rows[0].provider : "unknown"

    // Save raw CSV data to bronze layer with provider context
    await this.storage.saveJson(
      `bronze/focus/${provider}/${timestamp}/csv_${this.runId}.json`,
      {
        metadata: {
          originalRowCount: raw.length,
          processedRowCount: rows.length,
          provider,
          timestamp,
        },
        sample: raw.slice(0, 10), // Save first 10 rows as sample
      }
    )

    // Save processed data to silver layer
    await this.storage.saveJson(`silver/focus/cost_lines_${this.runId}.json`, {
      data: rows.slice(0, 1000), // Save first 1000 processed rows as sample
      metadata: {
        runId: this.runId,
        stats,
        timestamp,
        provider,
        totalProcessedRows: rows.length,
      },
    })
  }
}
