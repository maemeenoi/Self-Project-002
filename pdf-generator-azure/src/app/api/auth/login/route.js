import { NextResponse } from "next/server"
import { query } from "../../../../lib/db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find the user by email
    const users = await query(
      "SELECT Users.*, Clients.ClientID, Clients.ClientName FROM Users LEFT JOIN Clients ON Users.UserID = Clients.UserID WHERE Users.Email = ?",
      [email]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    const user = users[0]

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.Password)
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Set session cookie
    cookies().set({
      name: "session",
      value: JSON.stringify({
        userId: user.UserID,
        clientId: user.ClientID,
        clientName: user.ClientName,
        email: user.Email,
      }),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    // Return user info (excluding password)
    return NextResponse.json({
      userId: user.UserID,
      clientId: user.ClientID,
      clientName: user.ClientName,
      email: user.Email,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
