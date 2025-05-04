// src/app/api/auth/login/route.js
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "../../../../lib/db"
import bcrypt from "bcryptjs"

export async function POST(request) {
  try {
    // Get login credentials
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find client by email
    const clients = await query(
      "SELECT ClientID, ClientName, ContactName, ContactEmail, PasswordHash FROM Clients WHERE ContactEmail = ?",
      [email]
    )

    if (clients.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const client = clients[0]

    // Check if client has a password
    if (!client.PasswordHash) {
      return NextResponse.json(
        { error: "No password set. Please use magic link login." },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, client.PasswordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Update last login date
    await query("UPDATE Clients SET LastLoginDate = NOW() WHERE ClientID = ?", [
      client.ClientID,
    ])

    // Create session
    const session = {
      userId: client.ClientID,
      clientId: client.ClientID,
      clientName: client.ClientName,
      contactName: client.ContactName || "", // Include contact name
      email: client.ContactEmail,
      isAuthenticated: true,
      loginMethod: "password",
    }

    // Store session in cookie
    const cookieStore = cookies()
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
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 })
  }
}
