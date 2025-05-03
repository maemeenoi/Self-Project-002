// src/app/api/questions/route.js
import { NextResponse } from "next/server"
import { query } from "../../../lib/db"

export async function GET() {
  try {
    const questions = await query("SELECT * FROM Questions")
    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
