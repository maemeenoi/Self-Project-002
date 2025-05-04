// src/app/api/auth/session/route.js
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Get the session cookie - with await
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({
        isLoggedIn: false,
        user: null,
      })
    }

    // Parse the session data
    const session = JSON.parse(sessionCookie.value)

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        userId: session.userId,
        clientId: session.clientId,
        clientName: session.clientName,
        contactName: session.contactName || "", // Include contact name
        email: session.email,
      },
    })
  } catch (error) {
    console.error("Session parsing error:", error)

    // Clear the invalid session cookie
    const cookieStore = await cookies()
    cookieStore.delete("session")

    return NextResponse.json({
      isLoggedIn: false,
      user: null,
    })
  }
}
