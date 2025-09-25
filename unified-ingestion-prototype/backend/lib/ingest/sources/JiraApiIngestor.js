// src/lib/ingest/sources/JiraApiIngestor.js
import { BaseIngestor } from "../base/BaseIngestor.js"
import { mapJiraApiIssue } from "../mappers/jira.js"

export class JiraApiIngestor extends BaseIngestor {
  async load(input) {
    const {
      baseUrl,
      jql = "updated >= -30d",
      token,
      email,
      maxResults = 100,
    } = this.config

    if (!baseUrl || !token || !email) {
      throw new Error("Jira baseUrl, token, and email are required")
    }

    this.logger.info({
      runId: this.runId,
      source: this.source,
      message: "Fetching issues from Jira API",
      baseUrl,
      jql,
      maxResults,
    })

    const url = `${baseUrl}/rest/api/3/search?jql=${encodeURIComponent(
      jql
    )}&maxResults=${maxResults}&expand=changelog`

    const auth = Buffer.from(`${email}:${token}`).toString("base64")
    const headers = {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }

    let allIssues = []
    let startAt = 0
    let total = 0

    do {
      const pageUrl = `${url}&startAt=${startAt}`
      const response = await fetch(pageUrl, { headers })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Jira API ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (total === 0) {
        total = data.total
        this.logger.info({
          runId: this.runId,
          source: this.source,
          message: `Found ${total} total issues matching JQL`,
          jql,
        })
      }

      allIssues = allIssues.concat(data.issues)
      startAt += maxResults

      this.logger.debug({
        runId: this.runId,
        source: this.source,
        message: `Fetched ${allIssues.length}/${total} issues`,
      })
    } while (allIssues.length < total && startAt < total)

    this.logger.info({
      runId: this.runId,
      source: this.source,
      message: `Successfully fetched ${allIssues.length} issues from Jira API`,
    })

    return allIssues
  }

  async validate(issues) {
    if (!Array.isArray(issues)) {
      throw new Error("Jira API response must contain an issues array")
    }

    if (issues.length === 0) {
      this.logger.warn({
        runId: this.runId,
        source: this.source,
        message: "No issues returned from Jira API",
      })
      return
    }

    // Validate first few issues have required structure
    for (const issue of issues.slice(0, 5)) {
      if (!issue.key || !issue.fields) {
        throw new Error("Invalid Jira issue structure: missing key or fields")
      }
    }

    this.logger.info({
      runId: this.runId,
      source: this.source,
      message: "Jira API validation passed",
      issueCount: issues.length,
    })
  }

  async transform(issues) {
    const transformedIssues = []
    const errors = []

    for (let i = 0; i < issues.length; i++) {
      try {
        const transformed = mapJiraApiIssue(issues[i])
        transformedIssues.push(transformed)
      } catch (error) {
        errors.push({
          issueIndex: i,
          issueKey: issues[i]?.key,
          error: error.message,
          data: issues[i],
        })
      }
    }

    if (errors.length > 0) {
      this.logger.warn({
        runId: this.runId,
        source: this.source,
        message: `Failed to transform ${errors.length} issues`,
        errors: errors.slice(0, 5), // Log first 5 errors
      })

      // Save errors for investigation
      await this.storage.saveJson(
        `errors/jira_api/${this.runId}/transformation_errors.json`,
        errors
      )
    }

    return transformedIssues
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

    // Save raw API response to bronze layer
    await this.storage.saveJson(
      `bronze/operational/jira/${timestamp}/api_${this.runId}.json`,
      raw
    )

    // Save processed data to silver layer
    await this.storage.saveJson(
      `silver/operational/jira/issues_${this.runId}.json`,
      { data: rows, metadata: { runId: this.runId, stats, timestamp } }
    )
  }
}
