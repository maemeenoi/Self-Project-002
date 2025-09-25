// app/api/data/jira/route.js
import { SqliteRepository } from "../../../../src/lib/ingest/base/providers/SqliteRepository.js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const repository = new SqliteRepository({
      file: process.env.SQLITE_DB_PATH || ".data/finops.db",
    })

    // Get all Jira issues from the ingested data
    const db = await repository._ensureDb()
    const stmt = db.prepare(`
      SELECT 
        issue_key,
        summary,
        status,
        assignee,
        reporter,
        project,
        priority,
        created_at,
        updated_at,
        ingested_at
      FROM operational_jira_issue 
      ORDER BY updated_at DESC
      LIMIT 100
    `)

    const jiraIssues = stmt.all()

    // Map the database fields to match component expectations
    const formattedIssues = jiraIssues.map((issue) => ({
      id: issue.issue_key,
      key: issue.issue_key,
      summary: issue.summary,
      status: issue.status || "unknown", // Ensure status is always defined
      assignee: issue.assignee,
      reporter: issue.reporter,
      project: issue.project,
      priority: issue.priority,
      created: issue.created_at,
      updated: issue.updated_at,
    }))

    return NextResponse.json({
      success: true,
      data: formattedIssues,
      count: formattedIssues.length,
    })
  } catch (error) {
    console.error("Error fetching Jira data:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
