// app/api/data/focus/route.js
import { SqliteRepository } from "../../../../../backend/lib/ingest/base/providers/SqliteRepository.js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const repository = new SqliteRepository({
      file: process.env.SQLITE_DB_PATH || "data/finops.db",
    })

    // Get FOCUS cost data from the ingested data
    const db = await repository._ensureDb()
    const stmt = db.prepare(`
      SELECT 
        provider,
        billing_period,
        usage_start,
        usage_end,
        resource_id,
        sku,
        meter,
        region,
        currency,
        quantity,
        unit,
        public_cost,
        effective_cost,
        created_at
      FROM focus_cost_line_item 
      ORDER BY usage_start DESC
      LIMIT 100
    `)

    const costData = stmt.all()

    return NextResponse.json({
      success: true,
      data: costData,
      count: costData.length,
    })
  } catch (error) {
    console.error("Error fetching FOCUS data:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
