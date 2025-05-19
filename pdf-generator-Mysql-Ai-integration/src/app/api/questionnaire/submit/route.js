// src/app/api/questionnaire/submit/route.js - Update the POST handler
import { NextResponse } from "next/server"
import { query } from "../../../../lib/db"
import { createMagicLinkToken } from "../../../../lib/tokenUtils"
import { sendMagicLinkEmail } from "../../../../lib/emailUtils"

export async function POST(request) {
  try {
    const data = await request.json()
    const { answers, email, organizationName, companySize, authMethod } = data

    console.log("Submission data:", {
      answersCount: answers?.length,
      email,
      organizationName,
      companySize,
      authMethod,
    })

    if (!answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // If authMethod is 'google', email might come from the authenticated session
    if (!email && authMethod !== "google") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Extract key client information from the form responses
    let clientName = ""
    let industry = ""
    let clientCompanySize = companySize || ""
    let clientOrgName = organizationName || ""

    // Extract client info from answers
    answers.forEach((answer) => {
      if (answer.questionId === 1 && answer.text) {
        clientName = answer.text
      } else if (answer.questionId === 2 && answer.text) {
        clientOrgName = answer.text || clientOrgName
      } else if (answer.questionId === 4 && answer.text) {
        clientCompanySize = answer.text || clientCompanySize
      } else if (answer.questionId === 5 && answer.text) {
        industry = answer.text
      }
    })

    // Check if this email already has a client record
    let clientId = null

    if (email) {
      const existingClient = await query(
        "SELECT * FROM Client WHERE ContactEmail = ?",
        [email]
      )

      if (existingClient.length > 0) {
        // Use existing client but update details from the form
        clientId = existingClient[0].ClientID

        // Build the update SQL with all the fields we want to update
        const updateSql = `
          UPDATE Client 
          SET 
            ClientName = CASE WHEN ? != '' THEN ? ELSE ClientName END,
            OrganizationName = CASE WHEN ? != '' THEN ? ELSE OrganizationName END,
            CompanySize = CASE WHEN ? != '' THEN ? ELSE CompanySize END,
            IndustryType = CASE WHEN ? != '' THEN ? ELSE IndustryType END,
            LastLoginDate = NOW()
          WHERE ClientID = ?
        `
        const updateParams = [
          clientName,
          clientName,
          clientOrgName,
          clientOrgName,
          clientCompanySize,
          clientCompanySize,
          industry,
          industry,
          clientId,
        ]

        console.log("Updating client with ID:", clientId)
        await query(updateSql, updateParams)
      } else if (email) {
        // Create a new client record with all details
        const insertSql = `
          INSERT INTO Client (
            ClientName, 
            OrganizationName, 
            ContactEmail, 
            CompanySize,
            IndustryType, 
            AuthMethod,
            CreatedDate
          ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        `

        // Use email username as fallback if name not provided
        const username = clientName || email.split("@")[0]
        const authMethodValue =
          authMethod === "google" ? "google" : "magic_link"

        const insertParams = [
          username,
          clientOrgName || username,
          email,
          clientCompanySize || null,
          industry || null,
          authMethodValue,
        ]

        console.log("Creating new client with name:", username)
        const insertResult = await query(insertSql, insertParams)
        clientId = insertResult.insertId
      }
    }

    console.log("Using client ID:", clientId)

    // Only continue if we have a valid clientId
    if (!clientId) {
      return NextResponse.json(
        { error: "Failed to find or create client record" },
        { status: 500 }
      )
    }

    // Now we have a valid clientId, store responses
    for (const answer of answers) {
      // Make sure all parameters are properly defined
      const questionId = answer.questionId || null
      const responseText = answer.text || null
      const score = answer.score !== undefined ? answer.score : null

      console.log("Processing answer:", { questionId, responseText, score })

      if (questionId === null) {
        console.warn("Skipping answer with null questionId")
        continue
      }

      // For client info questions (1-5)
      if (questionId <= 5) {
        console.log("Handling client info question:", questionId)
        // Save client info questions directly - they use ResponseText
        try {
          await query(
            `INSERT INTO Response 
             (ClientID, QuestionID, ResponseText, ResponseDate) 
             VALUES (?, ?, ?, NOW())`,
            [clientId, questionId, responseText]
          )
          console.log("Saved client info response for question", questionId)
        } catch (error) {
          console.error("Error saving client response:", error)
        }
      }
      // For assessment questions with scores (6-19)
      else if (questionId >= 6 && questionId <= 19 && score !== null) {
        console.log("Handling assessment question:", questionId)
        // Save assessment responses with Score
        try {
          await query(
            `INSERT INTO Response 
             (ClientID, QuestionID, Score, ResponseDate) 
             VALUES (?, ?, ?, NOW())`,
            [clientId, questionId, score]
          )
          console.log("Saved assessment response for question", questionId)
        } catch (error) {
          console.error("Error saving assessment response:", error)
        }
      }
      // For question 20 (feedback) - text only
      else if (questionId === 20) {
        console.log("Handling feedback question:", questionId)
        // Save feedback response
        try {
          await query(
            `INSERT INTO Response 
             (ClientID, QuestionID, ResponseText, ResponseDate) 
             VALUES (?, ?, ?, NOW())`,
            [clientId, questionId, responseText]
          )
          console.log("Saved feedback response for question", questionId)
        } catch (error) {
          console.error("Error saving feedback response:", error)
        }
      }
    }

    // If using Google auth, we don't need to send a magic link
    if (authMethod === "google") {
      return NextResponse.json({
        success: true,
        message:
          "Assessment submitted successfully with Google authentication.",
      })
    }

    // Otherwise, generate a magic link token
    const token = await createMagicLinkToken(email, clientId)

    // Create the magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const magicLink = `${baseUrl}/api/auth/magic-link?token=${token}`

    console.log("Generated magic link for email:", email)

    // Send the email with the magic link
    const emailResult = await sendMagicLinkEmail(email, magicLink)

    // Return appropriate response based on email sending success
    if (emailResult && emailResult.success) {
      return NextResponse.json({
        success: true,
        message:
          "Assessment submitted successfully. Check your email for results.",
        emailSent: true,
      })
    } else {
      console.error(
        "Email sending failed:",
        emailResult ? emailResult.error : "Unknown error"
      )
      // Return success for the submission but flag the email failure
      return NextResponse.json({
        success: true,
        message:
          "Assessment submitted successfully, but there was an issue sending the email.",
        emailSent: false,
        emailError: emailResult ? emailResult.error : "Unknown error",
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
