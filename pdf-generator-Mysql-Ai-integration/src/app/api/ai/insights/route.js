// src/app/api/ai/insights/route.js
import { NextResponse } from "next/server"
import {
  generateCloudAssessmentInsights,
  generateFinOpsRecommendations,
} from "../../../../lib/aiUtils"

export async function POST(request) {
  try {
    const assessmentData = await request.json()

    // Validate required data
    if (!assessmentData || !assessmentData.cloudMaturityAssessment) {
      return NextResponse.json(
        { error: "Assessment data is required" },
        { status: 400 }
      )
    }

    // Generate AI insights
    console.log(
      "Generating AI insights for:",
      assessmentData.reportMetadata?.organizationName
    )

    const insights = await generateCloudAssessmentInsights(assessmentData)
    const recommendations = await generateFinOpsRecommendations(assessmentData)

    if (!insights) {
      throw new Error("Failed to generate AI insights")
    }

    return NextResponse.json({
      success: true,
      insights,
      recommendations,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("AI insights generation error:", error)

    return NextResponse.json(
      {
        error: "Failed to generate AI insights",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
