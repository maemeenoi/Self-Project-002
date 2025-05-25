// src/app/api/auth/logout/route.js - AZURE SQL VERSION
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request) {
  try {
    // Clear session cookie - use await with cookies()
    const cookieStore = await cookies()
    cookieStore.delete("session")

    // Redirect to login page - use the request parameter that's passed to the function
    return NextResponse.redirect(new URL("/login", request.url))
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}
