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
    const redirectPath = searchParams.get("redirect") || "/dashboard"

    if (!token) {
      return NextResponse.redirect(
        new URL("/questionnaire?error=missing_token", request.url)
      )
    }

    // Validate token
    const tokenData = await validateToken(token)

    console.log("Token validation result:", tokenData ? "Valid" : "Invalid")

    if (!tokenData) {
      return NextResponse.redirect(
        new URL("/questionnaire?error=invalid_token", request.url)
      )
    }

    // Check if client exists
    let clientId = tokenData.ClientID
    let clientName
    let email = tokenData.Email

    if (clientId) {
      // Client exists, get their name
      const clients = await query(
        "SELECT ClientName, OrganizationName FROM Clients WHERE ClientID = ?",
        [clientId]
      )

      if (clients.length > 0) {
        clientName = clients[0].ClientName

        // Update last login date
        await query(
          "UPDATE Clients SET LastLoginDate = NOW() WHERE ClientID = ?",
          [clientId]
        )
      } else {
        // Client ID exists in token but not in database
        clientId = null
      }
    }

    // Create client if it doesn't exist
    if (!clientId) {
      const clientNameFromEmail = email.split("@")[0]
      const organizationName = clientNameFromEmail // Default organization name

      const insertResult = await query(
        "INSERT INTO Clients (ClientName, OrganizationName, ContactEmail, AuthMethod, LastLoginDate) VALUES (?, ?, ?, 'magic_link', NOW())",
        [clientNameFromEmail, organizationName, email]
      )

      clientId = insertResult.insertId
      clientName = clientNameFromEmail

      // Update the magic link record with the new client ID
      if (tokenData.TokenID) {
        await query("UPDATE MagicLinks SET ClientID = ? WHERE TokenID = ?", [
          clientId,
          tokenData.TokenID,
        ])
      }
    }

    // Create session
    const session = {
      userId: clientId,
      clientId: clientId,
      clientName: clientName || email.split("@")[0],
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
    return NextResponse.redirect(new URL(redirectPath, request.url))
  } catch (error) {
    console.error("Magic link authentication error:", error)
    return NextResponse.redirect(
      new URL("/questionnaire?error=server_error", request.url)
    )
  }
}
