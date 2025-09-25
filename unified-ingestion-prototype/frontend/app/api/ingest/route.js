// app/api/ingest/route.js
import { randomUUID } from "crypto"
import { GithubApiIngestor } from "../../../../backend/lib/ingest/sources/GithubApiIngestor.js"
import { JiraCsvIngestor } from "../../../../backend/lib/ingest/sources/JiraCsvIngestor.js"
import { JiraApiIngestor } from "../../../../backend/lib/ingest/sources/JiraApiIngestor.js"
import { FocusCsvIngestor } from "../../../../backend/lib/ingest/sources/FocusCsvIngestor.js"
import { Logger } from "../../../../backend/lib/ingest/base/Logger.js"
import { LocalFsStorage } from "../../../../backend/lib/ingest/base/storage/LocalFsStorage.js"
import { SqliteRepository } from "../../../../backend/lib/ingest/base/providers/SqliteRepository.js"
import { NextResponse } from "next/server"

const INGESTOR_MAP = {
  github: GithubApiIngestor,
  jira_csv: JiraCsvIngestor,
  jira_api: JiraApiIngestor,
  focus_csv: FocusCsvIngestor,
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { source, input = {}, config = {} } = body

    // Validate request
    if (!source || !INGESTOR_MAP[source]) {
      return NextResponse.json(
        {
          ok: false,
          error: `Unknown or unsupported source: ${source}. Supported sources: ${Object.keys(
            INGESTOR_MAP
          ).join(", ")}`,
        },
        { status: 400 }
      )
    }

    const runId = randomUUID()

    // Initialize dependencies
    const logger = new Logger({
      context: { runId, source },
    })

    const storage = new LocalFsStorage({
      root: process.env.DATA_ROOT || "data",
    })

    const repo = new SqliteRepository({
      file: process.env.SQLITE_DB_PATH || "data/finops.db",
    })

    logger.info({
      message: "Starting ingestion request",
      source,
      hasInput: Object.keys(input).length > 0,
      hasConfig: Object.keys(config).length > 0,
    })

    // Create and run ingestor
    const IngestorClass = INGESTOR_MAP[source]
    const ingestor = new IngestorClass({
      source,
      runId,
      logger,
      storage,
      repo,
      config,
    })

    const result = await ingestor.ingest(input)

    const response = {
      runId,
      source,
      result,
      timestamp: new Date().toISOString(),
    }

    logger.info({
      message: "Ingestion request completed",
      success: result.ok,
      duration: result.duration,
      stats: result.ok
        ? {
            rows_read: result.rows_read,
            rows_upserted: result.rows_upserted,
            rows_skipped: result.rows_skipped,
          }
        : null,
    })

    return NextResponse.json(response, {
      status: result.ok ? 200 : 500,
    })
  } catch (error) {
    console.error("Ingestion API error:", error)

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

export async function GET() {
  // Return available ingestors and their requirements
  return NextResponse.json({
    available_sources: Object.keys(INGESTOR_MAP),
    source_requirements: {
      github: {
        config_required: ["token", "org", "repo"],
        config_optional: ["dataType", "sinceIso"],
        description: "Ingest GitHub pull requests, issues, or commits via API",
      },
      jira_csv: {
        input_required: ["filePath"],
        description: "Ingest Jira issues from CSV export",
      },
      jira_api: {
        config_required: ["baseUrl", "token", "email"],
        config_optional: ["jql", "maxResults"],
        description: "Ingest Jira issues via REST API",
      },
      focus_csv: {
        input_required: ["filePath"],
        description:
          "Ingest cloud billing data from FOCUS-compatible CSV (AWS, Azure, GCP)",
      },
    },
    example_requests: {
      github: {
        source: "github",
        config: {
          token: "ghp_xxxxxxxxxxxx",
          org: "your-org",
          repo: "your-repo",
          dataType: "pulls",
        },
      },
      jira_csv: {
        source: "jira_csv",
        input: {
          filePath: "bronze/jira/export.csv",
        },
      },
      jira_api: {
        source: "jira_api",
        config: {
          baseUrl: "https://your-domain.atlassian.net",
          email: "your-email@company.com",
          token: "your-api-token",
          jql: "updated >= -30d",
        },
      },
      focus_csv: {
        source: "focus_csv",
        input: {
          filePath: "bronze/focus/aws/2025/01/billing.csv",
        },
      },
    },
  })
}
