// app/api/data/github/route.js
import { SqliteRepository } from "../../../../../backend/lib/ingest/base/providers/SqliteRepository.js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const repository = new SqliteRepository({
      file: process.env.SQLITE_DB_PATH || "data/finops.db",
    })

    // Get all GitHub PRs from the ingested data
    const db = await repository._ensureDb()
    const stmt = db.prepare(`
      SELECT 
        repo_full_name,
        number,
        title,
        state,
        author_login,
        created_at,
        updated_at,
        merged_at,
        additions,
        deletions,
        changed_files,
        ingested_at
      FROM operational_github_pull_request 
      ORDER BY updated_at DESC
      LIMIT 100
    `)

    const pullRequests = stmt.all()

    // Map the database fields to match component expectations
    const formattedPRs = pullRequests.map((pr) => ({
      id: pr.number,
      title: pr.title,
      status: pr.state, // Map state to status for component compatibility
      author: pr.author_login,
      reviewers: "[]", // Default empty array as string
      assignees: "[]", // Default empty array as string
      changedFiles: pr.changed_files || 0,
      url: `https://github.com/${pr.repo_full_name}/pull/${pr.number}`,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      merged_at: pr.merged_at,
      additions: pr.additions,
      deletions: pr.deletions,
    }))

    return NextResponse.json({
      success: true,
      data: formattedPRs,
      count: formattedPRs.length,
    })
  } catch (error) {
    console.error("Error fetching GitHub data:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
