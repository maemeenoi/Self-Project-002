// src/app/api/questionnaire/submit/route.js
import { NextResponse } from "next/server"
import { query } from "../../../../lib/db"
import { createMagicLinkToken } from "../../../../lib/tokenUtils"
import { sendMagicLinkEmail } from "../../../../lib/emailUtils"

export async function POST(request) {
  try {
    const data = await request.json()
    const { answers, email } = data

    if (!answers || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if this email already has a client record
    const existingClients = await query(
      "SELECT * FROM Clients WHERE ContactEmail = ?",
      [email]
    )

    let clientId

    if (existingClients.length > 0) {
      // Use existing client
      clientId = existingClients[0].ClientID
    } else {
      // Create a new client record
      // Use the email username as the ClientName
      const username = email.split("@")[0]
      const insertResult = await query(
        "INSERT INTO Clients (ClientName, ContactEmail) VALUES (?, ?)",
        [username, email]
      )

      clientId = insertResult.insertId
    }

    // Now we have a valid clientId, store responses
    for (const answer of answers) {
      // Make sure all parameters are properly defined, using null for undefined values
      const questionId = answer.questionId || null
      const responseText = answer.responseText || null
      const score = answer.score !== undefined ? answer.score : null

      // Only proceed if we have at least a questionId
      if (questionId !== null) {
        await query(
          `INSERT INTO Responses 
           (ClientID, QuestionID, ResponseText, Score, TempEmail) 
           VALUES (?, ?, ?, ?, ?)`,
          [clientId, questionId, responseText, score, email]
        )
      }
    }

    // Generate a magic link token
    const token = await createMagicLinkToken(email, clientId)

    // Create the magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const magicLink = `${baseUrl}/api/auth/magic-link?token=${token}`

    // Send the email with the magic link
    const emailResult = await sendMagicLinkEmail(email, magicLink)

    // Return appropriate response based on email sending success
    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message:
          "Assessment submitted successfully. Check your email for results.",
        emailSent: true,
      })
    } else {
      console.error("Email sending failed:", emailResult.error)
      // Return success for the submission but flag the email failure
      return NextResponse.json({
        success: true,
        message:
          "Assessment submitted successfully, but there was an issue sending the email.",
        emailSent: false,
        emailError: emailResult.error,
      })
    }
  } catch (error) {
    console.error("Questionnaire submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit questionnaire. Please try again." },
      { status: 500 }
    )
  }
}
