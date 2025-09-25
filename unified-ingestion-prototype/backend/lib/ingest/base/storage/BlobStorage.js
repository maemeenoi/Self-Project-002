// src/lib/ingest/base/storage/BlobStorage.js
// Future implementation for Azure Blob Storage
export class BlobStorage {
  constructor({ connectionString, containerName }) {
    this.connectionString = connectionString
    this.containerName = containerName
    // TODO: Initialize @azure/storage-blob client
  }

  async saveJson(relativePath, data) {
    // TODO: Upload JSON to Azure Blob Storage
    throw new Error(
      "BlobStorage not yet implemented - use LocalFsStorage for now"
    )
  }

  async readText(relativePath) {
    // TODO: Download text from Azure Blob Storage
    throw new Error(
      "BlobStorage not yet implemented - use LocalFsStorage for now"
    )
  }

  async readJson(relativePath) {
    const text = await this.readText(relativePath)
    return JSON.parse(text)
  }

  async exists(relativePath) {
    // TODO: Check if blob exists
    throw new Error(
      "BlobStorage not yet implemented - use LocalFsStorage for now"
    )
  }

  async list(relativePath) {
    // TODO: List blobs with prefix
    throw new Error(
      "BlobStorage not yet implemented - use LocalFsStorage for now"
    )
  }

  async saveBuffer(relativePath, buffer) {
    // TODO: Upload buffer to Azure Blob Storage
    throw new Error(
      "BlobStorage not yet implemented - use LocalFsStorage for now"
    )
  }

  async readBuffer(relativePath) {
    // TODO: Download buffer from Azure Blob Storage
    throw new Error(
      "BlobStorage not yet implemented - use LocalFsStorage for now"
    )
  }
}
