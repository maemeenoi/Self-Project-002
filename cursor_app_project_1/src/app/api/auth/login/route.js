import { NextResponse } from "next/server"
import pool from "@/lib/db"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

// Fallback secret key for development
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Get client from database
    const [clients] = await pool.query(
      "SELECT * FROM Clients WHERE ContactEmail = ?",
      [email]
    )

    if (clients.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    const client = clients[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, client.PasswordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Update last login date
    await pool.query(
      "UPDATE Clients SET LastLoginDate = NOW() WHERE ClientID = ?",
      [client.ClientID]
    )

    // Generate JWT token
    const token = jwt.sign({ clientId: client.ClientID }, JWT_SECRET, {
      expiresIn: "1d",
    })

    // Create response with token
    const response = NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: client.ClientID,
          name: client.ClientName,
          email: client.ContactEmail,
          role: client.Role || "user",
          lastLoginDate: client.LastLoginDate,
        },
      },
      { status: 200 }
    )

    // Set token in cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 1 day
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    )
  }
}
