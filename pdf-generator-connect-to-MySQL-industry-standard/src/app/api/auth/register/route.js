// src/app/api/auth/register/route.js
import { NextResponse } from "next/server"
import { query, getConnection } from "../../../../lib/db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function POST(request) {
  let connection
  try {
    const { email, password, contactName, businessName, industry, size } =
      await request.json()

    // Input validation
    if (
      !email ||
      !password ||
      !contactName ||
      !businessName ||
      !industry ||
      !size
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    // Check if client already exists
    const existingClient = await query(
      "SELECT * FROM Client WHERE ContactEmail = ?",
      [email]
    )

    if (existingClient.length > 0) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Get a connection for transaction
    connection = await getConnection()
    await connection.beginTransaction()

    try {
      // Insert directly into Client table with all info
      // Note that:
      // - businessName goes into ClientName
      // - contactName goes into ContactName
      const [clientResult] = await connection.execute(
        `INSERT INTO Client 
         (ClientName, ContactName, ContactEmail, PasswordHash, AuthMethod, IndustryType, CompanySize, LastLoginDate) 
         VALUES (?, ?, ?, ?, 'password', ?, ?, NOW())`,
        [businessName, contactName, email, hashedPassword, industry, size]
      )

      const clientId = clientResult.insertId

      // Commit the transaction
      await connection.commit()

      // Set session cookie
      const cookieStore = cookies()
      cookieStore.set({
        name: "session",
        value: JSON.stringify({
          userId: clientId,
          clientId: clientId,
          clientName: businessName,
          contactName: contactName,
          email: email,
          isAuthenticated: true,
          loginMethod: "password",
        }),
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })

      return NextResponse.json({
        clientId: clientId,
        message: "Registration successful",
      })
    } catch (error) {
      // Rollback the transaction in case of error
      if (connection) await connection.rollback()
      throw error
    } finally {
      // Release the connection back to the pool
      if (connection) connection.release()
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
