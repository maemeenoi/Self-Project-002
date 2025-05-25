// src/app/api/questionnaire/submit/route.js - AZURE SQL VERSION
import { NextResponse } from "next/server"
import { query, getConnection } from "@/lib/db"
import { createMagicLinkToken } from "@/lib/tokenUtils"
import { sendMagicLinkEmail, sendAssessmentReportEmail } from "@/lib/emailUtils"

export async function POST(request) {
  try {
    const data = await request.json()
    const {
      answers,
      email,
      organizationName,
      companySize,
      authMethod = "magic_link",
      generateReport = false,
    } = data

    console.log("Submission data:", {
      answersCount: answers?.length,
      email,
      organizationName,
      companySize,
      authMethod,
      generateReport,
    })

    if (!answers || !email) {
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
    const existingClient = await query(
      "SELECT * FROM Client WHERE ContactEmail = ?",
      [email]
    )

    let clientId

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
          AuthMethod = CASE WHEN ? = 'google' THEN 'google' ELSE AuthMethod END,
          LastLoginDate = GETDATE()
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
        authMethod,
        clientId,
      ]

      console.log("Updating client with ID:", clientId)
      await query(updateSql, updateParams)
    } else {
      // Create a new client record with all details
      const insertSql = `
        INSERT INTO Client (
          ClientName, 
          OrganizationName, 
          ContactEmail, 
          CompanySize,
          IndustryType, 
          AuthMethod,
          CreatedDate,
          LastLoginDate
        ) OUTPUT INSERTED.ClientID VALUES (?, ?, ?, ?, ?, ?, GETDATE(), GETDATE())
      `

      // Use email username as fallback if name not provided
      const username = clientName || email.split("@")[0]

      const insertParams = [
        username,
        clientOrgName || username,
        email,
        clientCompanySize || null,
        industry || null,
        authMethod,
      ]

      console.log("Creating new client with name:", username)
      const insertResult = await query(insertSql, insertParams)
      clientId = insertResult[0].ClientID
    }

    console.log("Using client ID:", clientId)

    // Delete existing responses for this client to avoid duplicates
    await query("DELETE FROM Response WHERE ClientID = ?", [clientId])

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
             VALUES (?, ?, ?, GETDATE())`,
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
             VALUES (?, ?, ?, GETDATE())`,
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
             VALUES (?, ?, ?, GETDATE())`,
            [clientId, questionId, responseText]
          )
          console.log("Saved feedback response for question", questionId)
        } catch (error) {
          console.error("Error saving feedback response:", error)
        }
      }
    }

    // If this is a Google authentication flow with generateReport=true
    if (authMethod === "google" && generateReport) {
      console.log(
        "Google auth flow - generating AI analysis and sending comprehensive report"
      )

      // Get the stored responses to build assessment data
      const responseResults = await query(
        `SELECT r.ResponseID, r.ClientID, r.QuestionID, r.ResponseText, r.Score, r.ResponseDate,
                q.QuestionText, q.Category, q.StandardText
         FROM Response r
         LEFT JOIN Question q ON r.QuestionID = q.QuestionID
         WHERE r.ClientID = ?
         ORDER BY r.QuestionID`,
        [clientId]
      )

      // Get updated client info
      const clientResults = await query(
        `SELECT ClientID, ClientName, OrganizationName, ContactEmail, CompanySize, IndustryType
         FROM Client WHERE ClientID = ?`,
        [clientId]
      )

      const clientInfo = clientResults[0]

      // Try to generate AI analysis (don't fail if this doesn't work)
      let aiAnalysis = null
      try {
        console.log("Attempting to generate AI analysis...")

        // Trigger AI analysis generation
        const aiResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/api/consolidated-analysis/${clientId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              triggerGeneration: true,
              assessmentData: {
                reportMetadata: {
                  clientName: clientInfo.ClientName,
                  organizationName: clientInfo.OrganizationName,
                  industryType: clientInfo.IndustryType,
                  Clientize: clientInfo.CompanySize,
                },
                responses: responseResults,
              },
            }),
          }
        )

        if (aiResponse.ok) {
          const aiData = await aiResponse.json()
          aiAnalysis = aiData.analysis
          console.log("AI analysis generated successfully")
        } else {
          console.log("AI analysis generation failed, continuing without it")
        }
      } catch (aiError) {
        console.log("AI generation error (continuing):", aiError.message)
      }

      // Send comprehensive assessment report email
      try {
        console.log("Sending comprehensive assessment report...")
        await sendAssessmentReportEmail({
          email,
          clientInfo,
          responses: responseResults,
          aiAnalysis,
          dashboardLink: `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/dashboard`,
          includeReport: true,
        })
        console.log("Comprehensive assessment report sent successfully")
      } catch (emailError) {
        console.log("Email sending error (continuing):", emailError.message)
      }

      return NextResponse.json({
        success: true,
        clientId: clientId,
        message: "Assessment submitted and comprehensive report sent",
        emailSent: true,
        hasAI: !!aiAnalysis,
      })
    } else {
      // Traditional magic link flow
      console.log("Traditional magic link flow")

      // Generate a magic link token
      const token = await createMagicLinkToken(email, clientId)

      // Create the magic link URL
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      const magicLink = `${baseUrl}/api/auth/magic-link?token=${token}`

      console.log("Generated magic link for email:", email)

      // Send the email with the magic link
      const emailResult = await sendMagicLinkEmail(email, magicLink)

      // Return appropriate response based on email sending success
      if (emailResult && emailResult.success) {
        return NextResponse.json({
          success: true,
          clientId: clientId,
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
          clientId: clientId,
          message:
            "Assessment submitted successfully, but there was an issue sending the email.",
          emailSent: false,
          emailError: emailResult ? emailResult.error : "Unknown error",
        })
      }
    }
  } catch (error) {
    console.error("Questionnaire submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit questionnaire. Please try again." },
      { status: 500 }
    )
  }
}
