// src/app/api/auth/set-password/route.js
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "../../../../lib/db"
import bcrypt from "bcryptjs"

export async function POST(request) {
  try {
    // Get session from cookie
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "You must be logged in to set a password" },
        { status: 401 }
      )
    }

    // Parse session data
    const session = JSON.parse(sessionCookie.value)

    if (!session.isAuthenticated || !session.clientId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Get password from request
    const { password } = await request.json()

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Update client record with password
    await query("UPDATE Client SET PasswordHash = ? WHERE ClientID = ?", [
      hashedPassword,
      session.clientId,
    ])

    // Update session to include password login method
    session.loginMethod = "password"

    // Update cookie
    cookieStore.set({
      name: "session",
      value: JSON.stringify(session),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Set password error:", error)
    return NextResponse.json(
      { error: "Failed to set password" },
      { status: 500 }
    )
  }
}
