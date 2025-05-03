// src/app/api/auth/logout/route.js
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Clear session cookie
    const cookieStore = cookies()
    cookieStore.delete("session")

    // Redirect to login page
    return NextResponse.redirect(new URL("/login", request.url))
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}
