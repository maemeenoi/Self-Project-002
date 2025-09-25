// src/lib/ingest/utils/hashing.js
import { createHash } from "crypto"

export function generateRunId() {
  return createHash("sha256")
    .update(Date.now().toString() + Math.random().toString())
    .digest("hex")
    .substring(0, 16)
}

export function hashObject(obj) {
  const str = JSON.stringify(obj, Object.keys(obj).sort())
  return createHash("sha256").update(str).digest("hex")
}

export function generateUniqueId(prefix = "") {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}${timestamp}_${random}`
}
