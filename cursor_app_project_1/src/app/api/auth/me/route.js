import { NextResponse } from "next/server"
import pool from "@/lib/db"
import jwt from "jsonwebtoken"

// Fallback secret key for development
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production"

export async function GET(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)
    const { clientId } = decoded

    // Get client details
    const [clients] = await pool.query(
      "SELECT ClientID, ClientName, ContactEmail, Role, LastLoginDate FROM Clients WHERE ClientID = ?",
      [clientId]
    )

    if (clients.length === 0) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 })
    }

    const client = clients[0]

    return NextResponse.json({
      id: client.ClientID,
      name: client.ClientName,
      email: client.ContactEmail,
      role: client.Role || "user",
      lastLoginDate: client.LastLoginDate,
    })
  } catch (error) {
    console.error("Get client error:", error)
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    )
  }
}
