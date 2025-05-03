// src/app/api/auth/logout/route.js
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Clear the session cookie
    cookies().delete("session")

    // Redirect to login page
    return NextResponse.redirect(
      new URL(
        "/login",
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      )
    )
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.redirect(
      new URL(
        "/login",
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      )
    )
  }
}
