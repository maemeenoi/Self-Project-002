import { NextRequest, NextResponse } from "next/server"
import { GitHubActionsAdapter } from "@/ingestion/github/GitHubActionsAdapter"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const adapter = new GitHubActionsAdapter()
    const input = {
      repos: body.repos,
      demo: !!body.demo,
    }

    const { records, meta } = await adapter.pull(input)

    return NextResponse.json({
      data: records,
      meta: { ...meta, recordCount: records.length },
    })
  } catch (error) {
    console.error("Error fetching GitHub Actions:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch GitHub Actions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
