// src/app/api/industry-standards/route.js
import { NextResponse } from "next/server"
import { query } from "../../../lib/db"

export async function GET() {
  try {
    const industryStandards = await query("SELECT * FROM IndustryStandards")
    return NextResponse.json(industryStandards)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
