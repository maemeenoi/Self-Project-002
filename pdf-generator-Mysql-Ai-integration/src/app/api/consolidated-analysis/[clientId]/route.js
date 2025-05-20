// src/api/consolidated-analysis/[clientId]/route.js
import { NextResponse } from "next/server"
import {
  generateConsolidatedAnalysis,
  getConsolidatedAnalysis,
} from "../../../../lib/aiUtils"

/**
 * GET handler to retrieve AI analysis for a client
 * @param {Object} request - The request object
 * @param {Object} params - Route parameters
 * @returns {Promise<NextResponse>} The response with analysis data
 */
export async function GET(request, { params }) {
  try {
    const { clientId } = await params

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      )
    }

    console.log(`Fetching consolidated analysis for client ${clientId}`)

    // Get analysis from database
    const analysis = await getConsolidatedAnalysis(clientId)

    if (!analysis) {
      return NextResponse.json(
        { message: "No analysis found. Send a POST request to generate one." },
        { status: 404 }
      )
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error fetching consolidated analysis:", error)
    return NextResponse.json(
      { error: "Failed to fetch analysis", details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST handler to generate new AI analysis for a client
 * @param {Object} request - The request object
 * @param {Object} params - Route parameters
 * @returns {Promise<NextResponse>} The response with generated analysis data
 */
export async function POST(request, { params }) {
  try {
    const { clientId } = await params

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      )
    }

    // Get the assessment data from the request body
    const { assessmentData } = await request.json()

    if (!assessmentData) {
      return NextResponse.json(
        { error: "Assessment data is required" },
        { status: 400 }
      )
    }

    console.log(`Generating new consolidated analysis for client ${clientId}`)

    // Generate the analysis
    const analysis = await generateConsolidatedAnalysis(
      clientId,
      assessmentData
    )

    if (!analysis) {
      return NextResponse.json(
        { error: "Failed to generate analysis" },
        { status: 500 }
      )
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error generating consolidated analysis:", error)
    return NextResponse.json(
      { error: "Failed to generate analysis", details: error.message },
      { status: 500 }
    )
  }
}
