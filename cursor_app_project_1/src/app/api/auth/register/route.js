import { NextResponse } from "next/server"
import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Fallback secret key for development
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production"

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // Replace with your actual password
}

export async function POST(request) {
  try {
    const { name, email, password, phone, responses } = await request.json()

    // Create database connection
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "", // Replace with your actual password
    })

    // Explicitly select the database
    await connection.query(`USE assessment_dev`)

    try {
      // Start transaction
      await connection.beginTransaction()

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Insert client data
      const [clientResult] = await connection.execute(
        "INSERT INTO Clients (ClientName, ContactEmail, ContactPhone, PasswordHash) VALUES (?, ?, ?, ?)",
        [name, email, phone, hashedPassword]
      )

      const clientId = clientResult.insertId

      // Create assessment record
      const [assessmentResult] = await connection.execute(
        "INSERT INTO Assessments (ClientID, Status) VALUES (?, 'Pending')",
        [clientId]
      )

      const assessmentId = assessmentResult.insertId

      // Insert responses
      for (const [questionId, response] of Object.entries(responses)) {
        const isScore = typeof response === "number"
        await connection.execute(
          "INSERT INTO Responses (ClientID, QuestionID, ResponseText, Score) VALUES (?, ?, ?, ?)",
          [
            clientId,
            questionId,
            isScore ? null : response,
            isScore ? response : null,
          ]
        )
      }

      // Commit transaction
      await connection.commit()

      // Generate JWT token
      const token = jwt.sign(
        {
          clientId,
          name,
          email,
          role: "user",
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      )

      // Create response with token
      const response = NextResponse.json({
        message: "Registration successful",
        clientId,
        assessmentId,
      })

      // Set token in cookie
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 86400, // 1 day
      })

      return response
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback()
      throw error
    } finally {
      // Close connection
      await connection.end()
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Registration failed", error: error.message },
      { status: 500 }
    )
  }
}
