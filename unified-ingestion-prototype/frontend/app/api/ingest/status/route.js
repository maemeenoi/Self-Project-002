// app/api/ingest/status/route.js
import { SqliteRepository } from "../../../../src/lib/ingest/base/providers/SqliteRepository.js"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const runId = searchParams.get("runId")

    const repo = new SqliteRepository({
      file: process.env.SQLITE_DB_PATH || ".data/finops.db",
    })

    let runs, errors

    if (runId) {
      // Get specific run details
      runs = await repo.getRecentRuns(100) // Get more runs to find the specific one
      runs = runs.filter((r) => r.run_id === runId)
      errors = await repo.getRunErrors(runId)
    } else {
      // Get recent runs
      runs = await repo.getRecentRuns(limit)
      errors = await repo.getRunErrors(null, 20) // Get recent errors
    }

    // Calculate some statistics
    const stats = {
      total_runs: runs.length,
      successful_runs: runs.filter((r) => r.status === "success").length,
      failed_runs: runs.filter((r) => r.status === "failed").length,
      running_runs: runs.filter((r) => r.status === "running").length,
      total_errors: errors.length,
    }

    // Add duration for completed runs
    const enrichedRuns = runs.map((run) => {
      if (run.finished_at && run.started_at) {
        const start = new Date(run.started_at)
        const end = new Date(run.finished_at)
        return {
          ...run,
          duration_ms: end - start,
          duration_seconds: Math.round((end - start) / 1000),
        }
      }
      return run
    })

    return NextResponse.json({
      stats,
      runs: enrichedRuns,
      errors: errors.slice(0, 10), // Limit errors in response
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Status API error:", error)

    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action !== "clear_old_runs") {
      return NextResponse.json(
        { error: "Only clear_old_runs action is supported" },
        { status: 400 }
      )
    }

    const repo = new SqliteRepository({
      file: process.env.SQLITE_DB_PATH || ".data/finops.db",
    })

    // This would require implementing a cleanup method in the repository
    // For now, return a placeholder response
    return NextResponse.json({
      message: "Cleanup functionality not yet implemented",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Status cleanup error:", error)

    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
