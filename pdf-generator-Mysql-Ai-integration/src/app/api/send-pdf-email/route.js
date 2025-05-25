// src/app/api/send-pdf-email/route.js - AZURE SQL VERSION
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { sendAssessmentReportEmail } from "@/lib/emailUtils"

export async function POST(request) {
  try {
    const {
      email,
      clientId,
      pdfData,
      clientData,
      includeReport = true,
    } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log(
      `Sending assessment report to ${email}${
        clientId ? ` for client ${clientId}` : ""
      }`
    )

    // Get client information if clientId is provided but clientData is not
    let clientInfo = clientData?.reportMetadata || null

    if (!clientInfo && clientId) {
      const clientResults = await query(
        `SELECT ClientID, ClientName, OrganizationName, ContactEmail, CompanySize, IndustryType
         FROM Client WHERE ClientID = ?`,
        [clientId]
      )

      if (clientResults.length > 0) {
        clientInfo = clientResults[0]
      }
    }

    // If we have clientId but no client info was found, return an error
    if (clientId && !clientInfo) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Get responses for the report if we have clientId but not clientData
    let responseResults = clientData?.responses || null

    if (!responseResults && clientId) {
      responseResults = await query(
        `SELECT r.ResponseID, r.ClientID, r.QuestionID, r.ResponseText, r.Score, r.ResponseDate,
                q.QuestionText, q.Category, q.StandardText
         FROM Response r
         LEFT JOIN Question q ON r.QuestionID = q.QuestionID
         WHERE r.ClientID = ?
         ORDER BY r.QuestionID`,
        [clientId]
      )
    }

    // Get AI analysis from clientData or database
    let aiAnalysis = clientData?.executiveSummary
      ? {
          executiveSummary: clientData.executiveSummary,
          strengths: clientData.strengths || [],
          improvementAreas: clientData.improvementAreas || [],
          recommendations: clientData.recommendations?.keyRecommendations || [],
        }
      : null

    if (!aiAnalysis && clientId) {
      try {
        const aiResults = await query(
          "SELECT * FROM AIAnalysis WHERE ClientID = ? AND PillarID = 'consolidated'",
          [clientId]
        )

        if (aiResults.length > 0) {
          aiAnalysis = JSON.parse(aiResults[0].Content)
        }
      } catch (aiError) {
        console.log("No AI analysis available yet")
      }
    }

    // Create dashboard link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const dashboardLink = `${baseUrl}/dashboard`

    // Send comprehensive assessment report email with PDF if available
    const emailResult = await sendAssessmentReportEmail({
      email,
      clientInfo,
      responses: responseResults,
      aiAnalysis,
      dashboardLink,
      includeReport,
      pdfData, // Pass the PDF data if available
    })

    if (emailResult.success) {
      console.log(`Assessment report email sent successfully to ${email}`)
      return NextResponse.json({
        success: true,
        message: "Assessment report sent successfully",
        emailSent: true,
      })
    } else {
      console.error(
        "Failed to send assessment report email:",
        emailResult.error
      )
      return NextResponse.json({
        success: false,
        message: "Failed to send assessment report email",
        emailSent: false,
        emailError: emailResult.error,
      })
    }
  } catch (error) {
    console.error("Assessment report email error:", error)
    return NextResponse.json(
      { error: "Failed to send assessment report" },
      { status: 500 }
    )
  }
}
