// app/api/auth/session/route.js
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "../[...nextauth]/route"

export async function GET() {
  try {
    // Try to get the Next-Auth session
    const session = await getServerSession(authOptions)

    // If Next-Auth session exists, format it to match your custom auth format
    if (session && session.user) {
      return NextResponse.json({
        isLoggedIn: true,
        user: {
          userId: session.user.clientId || session.user.id,
          clientId: session.user.clientId,
          clientName: session.user.clientName || session.user.name,
          email: session.user.email,
          // Add any other required fields
        },
      })
    }

    // If no Next-Auth session, return not logged in
    return NextResponse.json({
      isLoggedIn: false,
      user: null,
    })
  } catch (error) {
    console.error("Session API error:", error)

    // Clear any invalid session and return not logged in
    return NextResponse.json(
      {
        isLoggedIn: false,
        user: null,
        error: "Session error",
      },
      { status: 500 }
    )
  }
}
