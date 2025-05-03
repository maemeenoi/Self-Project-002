import { NextResponse } from "next/server"
import { query, getConnection } from "../../../../lib/db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function POST(request) {
  let connection
  try {
    const { email, password, name, businessName, industry, size } =
      await request.json()

    // Input validation
    if (!email || !password || !name || !businessName || !industry || !size) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await query("SELECT * FROM Users WHERE Email = ?", [
      email,
    ])
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Get a connection from the pool
    connection = await getConnection()

    // Start transaction
    await connection.beginTransaction()

    try {
      // Insert the user
      const [userResult] = await connection.execute(
        "INSERT INTO Users (Email, Password, CreatedDate) VALUES (?, ?, NOW())",
        [email, hashedPassword]
      )

      const userId = userResult.insertId

      // Insert the client
      const [clientResult] = await connection.execute(
        "INSERT INTO Clients (ClientName, ContactEmail, ContactPhone, UserID) VALUES (?, ?, ?, ?)",
        [businessName, email, "", userId]
      )

      const clientId = clientResult.insertId

      // Commit the transaction
      await connection.commit()

      // Set session cookie - using await cookies()
      const cookieStore = await cookies()
      cookieStore.set({
        name: "session",
        value: JSON.stringify({
          userId,
          clientId,
          clientName: name,
          email,
        }),
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })

      return NextResponse.json({
        userId,
        clientId,
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
