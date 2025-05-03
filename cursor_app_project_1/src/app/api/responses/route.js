import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { verify } from "jsonwebtoken"

// Middleware to verify JWT token
const authenticateRequest = (request) => {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided")
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key")
    return decoded
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export async function POST(request) {
  try {
    // Authenticate user
    const decoded = authenticateRequest(request)
    const clientId = decoded.clientId

    const { answers, step } = await request.json()

    // Save responses to database
    const [result] = await pool.query(
      "INSERT INTO responses (client_id, answers, step) VALUES (?, ?, ?)",
      [clientId, JSON.stringify(answers), step]
    )

    // If this is the final step, update client's LastLoginDate
    if (step === 2) {
      // Assuming 3 steps (0, 1, 2)
      await pool.query(
        "UPDATE Clients SET LastLoginDate = NOW() WHERE ClientID = ?",
        [clientId]
      )
    }

    return NextResponse.json(
      {
        id: result.insertId,
        message: "Responses saved successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error saving responses:", error)

    if (
      error.message === "No token provided" ||
      error.message === "Invalid token"
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
