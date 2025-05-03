// src/app/api/auth/magic-link/route.js
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateToken } from "../../../../lib/tokenUtils"
import { query } from "../../../../lib/db"

export async function GET(request) {
  try {
    // Extract token from URL
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=missing_token", request.url)
      )
    }

    // Validate token
    const tokenData = await validateToken(token)

    if (!tokenData) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", request.url)
      )
    }

    // Check if client exists
    let clientId = tokenData.ClientID
    let clientName = tokenData.ClientName
    let email = tokenData.Email

    // Create client if it doesn't exist
    if (!clientId) {
      const newClient = await query(
        "INSERT INTO Clients (ClientName, ContactEmail) VALUES (?, ?)",
        [email.split("@")[0], email]
      )

      clientId = newClient.insertId
      clientName = email.split("@")[0]

      // Update the magic link record with the new client ID
      await query("UPDATE MagicLinks SET ClientID = ? WHERE TokenID = ?", [
        clientId,
        tokenData.TokenID,
      ])
    }

    // Create session
    const session = {
      userId: tokenData.TokenID,
      clientId: clientId,
      clientName: clientName,
      email: email,
      isAuthenticated: true,
      loginMethod: "magic_link",
    }

    // Store session in cookie
    const cookieStore = cookies()
    cookieStore.set({
      name: "session",
      value: JSON.stringify(session),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Magic link authentication error:", error)
    return NextResponse.redirect(
      new URL("/login?error=server_error", request.url)
    )
  }
}
