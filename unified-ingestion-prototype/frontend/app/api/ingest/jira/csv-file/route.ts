import { NextRequest, NextResponse } from "next/server"
import { JiraCsvAdapter } from "@/ingestion/jira/JiraCsvAdapter"
import { writeIssues } from "@/ingestion/pipeline/IngestionCoordinator"
import { readFileSync } from "fs"
import { join } from "path"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const filename = body.filename || "Jira (2).csv"

    // Read the CSV file from the public/sample directory
    const filePath = join(process.cwd(), "public", "sample", filename)
    const csvBuffer = readFileSync(filePath)

    const adapter = new JiraCsvAdapter()
    const { records, meta } = await adapter.pull({
      csvBuffer,
      projectKey: body.projectKey,
    })

    if (!body.demo) {
      await writeIssues(records)
    }

    return NextResponse.json({
      data: records,
      meta: { ...meta, filename, recordCount: records.length },
    })
  } catch (error) {
    console.error("Error processing Jira CSV:", error)
    return NextResponse.json(
      {
        error: "Failed to process CSV file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
