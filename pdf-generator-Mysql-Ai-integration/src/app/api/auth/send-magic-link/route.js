// src/app/api/auth/send-magic-link/route.js - AZURE SQL VERSION
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { createMagicLinkToken } from "@/lib/tokenUtils"
import { sendMagicLinkEmail } from "@/lib/emailUtils"

export async function POST(request) {
  try {
    const { email, redirectUrl } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if client exists
    // AZURE SQL: No changes needed for basic SELECT
    const clients = await query(
      "SELECT ClientID FROM Client WHERE ContactEmail = ?",
      [email]
    )

    let clientId = null

    if (clients.length > 0) {
      clientId = clients[0].ClientID
    }

    // Generate magic link token
    const token = await createMagicLinkToken(email, clientId)

    // Create magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    let magicLink = `${baseUrl}/api/auth/magic-link?token=${token}`

    // Add redirect URL if provided
    if (redirectUrl) {
      magicLink += `&redirect=${encodeURIComponent(redirectUrl)}`
    }

    // Send email with magic link
    await sendMagicLinkEmail(email, magicLink)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Send magic link error:", error)
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    )
  }
}
