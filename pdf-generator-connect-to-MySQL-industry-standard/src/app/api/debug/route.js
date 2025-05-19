import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "../../../lib/db"

export async function GET() {
  try {
    // Get the session cookie - use await with cookies()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")
    let sessionData = null

    if (sessionCookie) {
      try {
        sessionData = JSON.parse(sessionCookie.value)
      } catch (e) {
        console.error("Error parsing session cookie:", e)
      }
    }

    // Check DB connectivity
    let dbStatus = "unknown"
    let users = []
    let questions = []

    try {
      users = await query("SELECT UserID, Email FROM Users LIMIT 5")
      questions = await query(
        "SELECT QuestionID, QuestionText, Category FROM Question LIMIT 5"
      )
      dbStatus = "connected"
    } catch (error) {
      dbStatus = `error: ${error.message}`
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      hasSession: !!sessionCookie,
      sessionData,
      cookies: Object.fromEntries(
        (await cookieStore.getAll()).map((cookie) => [
          cookie.name,
          "[content hidden]",
        ])
      ),
      dbStatus,
      sampleUsers: users.map((u) => ({ id: u.UserID, email: u.Email })),
      sampleQuestion: questions,
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
