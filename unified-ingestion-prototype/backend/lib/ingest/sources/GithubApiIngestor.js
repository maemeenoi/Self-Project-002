// src/lib/ingest/sources/GithubApiIngestor.js
import { BaseIngestor } from "../base/BaseIngestor.js"
import { mapGithubPullRequest } from "../mappers/github.js"

export class GithubApiIngestor extends BaseIngestor {
  async load(input) {
    const { org, repo, token, sinceIso, dataType = "pulls" } = this.config

    if (!token) {
      throw new Error("GitHub token is required")
    }

    if (!org || !repo) {
      throw new Error("GitHub org and repo are required")
    }

    let url
    switch (dataType) {
      case "pulls":
        url = `https://api.github.com/repos/${org}/${repo}/pulls?state=all&per_page=100&sort=updated&direction=desc`
        break
      case "issues":
        url = `https://api.github.com/repos/${org}/${repo}/issues?state=all&per_page=100&sort=updated&direction=desc`
        break
      case "commits":
        url = `https://api.github.com/repos/${org}/${repo}/commits?per_page=100`
        break
      default:
        throw new Error(`Unsupported GitHub data type: ${dataType}`)
    }

    if (sinceIso && dataType !== "commits") {
      url += `&since=${sinceIso}`
    }

    this.logger.info({
      runId: this.runId,
      source: this.source,
      message: `Fetching ${dataType} from GitHub`,
      url: url.replace(token, "***"),
      org,
      repo,
    })

    const headers = {
      Authorization: `Bearer ${token}`,
      "User-Agent": "MSG-FinOps-Ingestion/1.0",
      Accept: "application/vnd.github.v3+json",
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GitHub API ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    this.logger.info({
      runId: this.runId,
      source: this.source,
      message: `Successfully fetched ${data.length} ${dataType} from GitHub`,
    })

    return data
  }

  async validate(data) {
    if (!Array.isArray(data)) {
      throw new Error("GitHub API response must be an array")
    }

    if (data.length === 0) {
      this.logger.warn({
        runId: this.runId,
        source: this.source,
        message: "No data returned from GitHub API",
      })
    }

    // Basic validation for pull requests
    if (this.config.dataType === "pulls" || !this.config.dataType) {
      for (const item of data.slice(0, 5)) {
        // Validate first 5 items
        if (!item.number || !item.base?.repo?.full_name) {
          throw new Error("Invalid pull request data structure")
        }
      }
    }
  }

  async transform(data) {
    const { dataType = "pulls" } = this.config

    switch (dataType) {
      case "pulls":
        return data.map(mapGithubPullRequest)
      case "issues":
        // TODO: Implement GitHub issues mapping
        throw new Error("GitHub issues mapping not yet implemented")
      case "commits":
        // TODO: Implement GitHub commits mapping
        throw new Error("GitHub commits mapping not yet implemented")
      default:
        throw new Error(`Unsupported GitHub data type: ${dataType}`)
    }
  }

  async upsert(rows) {
    if (rows.length === 0) {
      return { rows_read: 0, rows_upserted: 0, rows_skipped: 0 }
    }

    const { dataType = "pulls" } = this.config

    switch (dataType) {
      case "pulls":
        return await this.repo.upsertBatch(
          "operational_github_pull_request",
          rows,
          ["repo_full_name", "number"]
        )
      case "issues":
        return await this.repo.upsertBatch("operational_github_issue", rows, [
          "repo_full_name",
          "number",
        ])
      case "commits":
        return await this.repo.upsertBatch("operational_github_commit", rows, [
          "repo_full_name",
          "sha",
        ])
      default:
        throw new Error(`Unsupported GitHub data type: ${dataType}`)
    }
  }

  async persistArtifacts({ raw, rows, stats }) {
    const { dataType = "pulls" } = this.config
    const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD

    // Save to bronze layer (raw API response)
    await this.storage.saveJson(
      `bronze/operational/github/${timestamp}/${dataType}_${this.runId}.json`,
      raw
    )

    // Save to silver layer (processed data)
    await this.storage.saveJson(
      `silver/operational/github/${dataType}_${this.runId}.json`,
      { data: rows, metadata: { runId: this.runId, stats, timestamp } }
    )
  }
}
