// src/lib/ingest/base/storage/LocalFsStorage.js
import { promises as fs } from "fs"
import path from "path"

export class LocalFsStorage {
  constructor({ root }) {
    this.root = root
  }

  async _ensureDir(filePath) {
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
  }

  _getFullPath(relativePath) {
    return path.join(this.root, relativePath)
  }

  async saveJson(relativePath, data) {
    const fullPath = this._getFullPath(relativePath)
    await this._ensureDir(fullPath)
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), "utf-8")
    return fullPath
  }

  async readText(relativePath) {
    const fullPath = this._getFullPath(relativePath)
    return await fs.readFile(fullPath, "utf-8")
  }

  async readJson(relativePath) {
    const text = await this.readText(relativePath)
    return JSON.parse(text)
  }

  async exists(relativePath) {
    try {
      const fullPath = this._getFullPath(relativePath)
      await fs.access(fullPath)
      return true
    } catch {
      return false
    }
  }

  async list(relativePath) {
    try {
      const fullPath = this._getFullPath(relativePath)
      return await fs.readdir(fullPath)
    } catch {
      return []
    }
  }

  async saveBuffer(relativePath, buffer) {
    const fullPath = this._getFullPath(relativePath)
    await this._ensureDir(fullPath)
    await fs.writeFile(fullPath, buffer)
    return fullPath
  }

  async readBuffer(relativePath) {
    const fullPath = this._getFullPath(relativePath)
    return await fs.readFile(fullPath)
  }
}
