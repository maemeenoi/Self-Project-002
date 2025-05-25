// src/app/api/consolidated-analysis/[clientId]/route.js
import { NextResponse } from "next/server"
import {
  generateConsolidatedAnalysis,
  getConsolidatedAnalysis,
} from "../../../../lib/aiUtils"
import { query } from "../../../../lib/db"

export async function GET(request, { params }) {
  try {
    const { clientId } = await params

    console.log(`Getting consolidated analysis for client ${clientId}`)

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      )
    }

    // Get existing analysis
    const analysis = await getConsolidatedAnalysis(clientId)

    if (!analysis) {
      console.log(`No consolidated analysis found for client ${clientId}`)
      return NextResponse.json({ error: "No analysis found" }, { status: 404 })
    }

    console.log(`Found consolidated analysis for client ${clientId}`)
    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error getting consolidated analysis:", error)
    return NextResponse.json(
      { error: "Failed to get analysis", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { clientId } = await params
    console.log(`Generating consolidated analysis for client ${clientId}`)

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { assessmentData, triggerGeneration } = body

    // If we have assessmentData in the request, use it
    let dataForAnalysis = assessmentData

    // If no assessmentData provided, fetch it from the database
    if (!dataForAnalysis) {
      console.log("No assessment data provided, fetching from database...")

      // Get client info
      const clientResults = await query(
        `SELECT ClientID, ClientName, OrganizationName, ContactEmail, CompanySize, IndustryType
         FROM Client WHERE ClientID = ?`,
        [clientId]
      )

      if (clientResults.length === 0) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 })
      }

      const clientInfo = clientResults[0]

      // Get Response
      const responseResults = await query(
        `SELECT r.ResponseID, r.ClientID, r.QuestionID, r.ResponseText, r.Score, r.ResponseDate,
                q.QuestionText, q.Category, q.StandardText
         FROM Response r
         LEFT JOIN Question q ON r.QuestionID = q.QuestionID
         WHERE r.ClientID = ?
         ORDER BY r.QuestionID`,
        [clientId]
      )

      if (responseResults.length === 0) {
        return NextResponse.json(
          { error: "No assessment Response found for this client" },
          { status: 400 }
        )
      }

      // Process the data using assessmentUtils
      const assessmentUtils = await import("../../../../lib/assessmentUtils")
      const processedData = assessmentUtils.default.processAssessmentData(
        responseResults.map((r) => ({ ...r, ClientInfo: clientInfo })),
        [] // industry standards not needed for AI generation
      )

      if (!processedData) {
        return NextResponse.json(
          { error: "Failed to process assessment data" },
          { status: 400 }
        )
      }

      dataForAnalysis = processedData
    }

    // Validate we have the required data structure
    if (!dataForAnalysis || !dataForAnalysis.finOpsPillars) {
      console.error("Invalid assessment data structure:", dataForAnalysis)
      return NextResponse.json(
        { error: "Invalid assessment data structure" },
        { status: 400 }
      )
    }

    console.log("Generating AI analysis with data:", {
      pillarsCount: dataForAnalysis.finOpsPillars?.length,
      hasMetadata: !!dataForAnalysis.reportMetadata,
      hasOverallMaturity: !!dataForAnalysis.overallFinOpsMaturity,
    })

    // Generate the analysis
    const analysis = await generateConsolidatedAnalysis(
      clientId,
      dataForAnalysis
    )

    if (!analysis) {
      return NextResponse.json(
        { error: "Failed to generate analysis" },
        { status: 500 }
      )
    }

    console.log(
      `Successfully generated consolidated analysis for client ${clientId}`
    )
    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error generating consolidated analysis:", error)
    return NextResponse.json(
      { error: "Failed to generate analysis", details: error.message },
      { status: 500 }
    )
  }
}
