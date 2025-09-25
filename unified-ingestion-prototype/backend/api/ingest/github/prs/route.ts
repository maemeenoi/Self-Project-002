import { NextRequest, NextResponse } from "next/server"
import { GitHubPRAdapter } from "@/ingestion/github/GitHubPRAdapter"
import { writePRs } from "@/ingestion/pipeline/IngestionCoordinator"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const adapter = new GitHubPRAdapter()

  // Use environment variables as default repository instead of hardcoded fallback
  const defaultRepo =
    process.env.GITHUB_OWNER && process.env.GITHUB_REPO
      ? [`${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`]
      : ["octocat/Hello-World"]

  const input = {
    repos: body.repos ?? defaultRepo,
    user: body.user,
    state: body.state ?? "open",
    demo: !!body.demo,
  }
  const { records, meta } = await adapter.pull(input as any)
  if (!body.demo) await writePRs(records)
  return NextResponse.json({ data: records, meta })
}
