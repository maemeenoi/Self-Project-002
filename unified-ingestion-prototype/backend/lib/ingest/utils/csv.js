// src/lib/ingest/utils/csv.js
import { parse } from "csv-parse/sync"

export function parseCsv(text, options = {}) {
  const defaultOptions = {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    ...options,
  }

  try {
    return parse(text, defaultOptions)
  } catch (error) {
    throw new Error(`CSV parsing failed: ${error.message}`)
  }
}

export function stringifyCsv(data, options = {}) {
  // For future use when we need to write CSV files
  throw new Error("CSV stringify not yet implemented")
}
