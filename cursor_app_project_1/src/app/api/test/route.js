import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    // Test database connection
    const [result] = await pool.query("SELECT 1")
    return NextResponse.json({
      message: "Database connection successful",
      result,
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        message: "Database connection failed",
        error: error.message,
      },
      { status: 500 }
    )
  }
}
