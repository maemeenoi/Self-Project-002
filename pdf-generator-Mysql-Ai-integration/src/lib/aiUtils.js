// src/lib/aiUtils.js - Modified for consolidated analysis

import OpenAI from "openai"
import crypto from "crypto"
import { query } from "./db"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Current model version - update this when you change prompt structure or model
const CURRENT_MODEL_VERSION = "gpt-3.5-turbo"

/**
 * Generate a consolidated AI analysis for all pillars of a client's assessment
 * @param {number} clientId - The client ID
 * @param {Object} assessmentData - The complete processed assessment data
 * @returns {Object} Consolidated AI analysis
 */
export async function generateConsolidatedAnalysis(clientId, assessmentData) {
  console.log(`Generating consolidated analysis for client ${clientId}`)

  // Check if analysis already exists for this client
  const existingAnalysis = await getConsolidatedAnalysis(clientId)

  // If we have a current analysis, return it
  if (
    existingAnalysis &&
    existingAnalysis.modelVersion === CURRENT_MODEL_VERSION
  ) {
    console.log(`Using existing consolidated analysis for client ${clientId}`)
    return existingAnalysis
  }

  try {
    // Generate new analysis
    console.log("Generating new consolidated analysis")
    const analysis = await createConsolidatedAnalysis(clientId, assessmentData)
    return analysis
  } catch (error) {
    console.error("Error generating consolidated analysis:", error)

    // Return placeholder for failed analysis
    return {
      analysisId: crypto.randomUUID(),
      clientId,
      error: true,
      modelVersion: CURRENT_MODEL_VERSION,
      analysis: {
        executiveSummary:
          "Failed to generate analysis. The system will retry automatically.",
        overallFindings: "Analysis generation failed.",
        strengths: [],
        improvementAreas: [],
        recommendations: [],
        timelineSteps: {},
      },
    }
  }
}

/**
 * Create a consolidated analysis for all pillars
 * @param {number} clientId - The client ID
 * @param {Object} assessmentData - Complete assessment data
 * @returns {Object} The consolidated analysis
 */
async function createConsolidatedAnalysis(clientId, assessmentData) {
  const analysisId = crypto.randomUUID()
  const { reportMetadata, finOpsPillars, overallFinOpsMaturity } =
    assessmentData

  try {
    // Build a comprehensive prompt with all pillar data
    const prompt = `
You are a FinOps and cloud maturity expert. Analyze this organization's complete cloud assessment and provide strategic recommendations.

Organization Profile:
- Name: ${reportMetadata.organizationName}
- Industry: ${reportMetadata.industryType}
- Size: ${reportMetadata.clientSize}

Overall FinOps Maturity: ${overallFinOpsMaturity.percentage}% (${
      overallFinOpsMaturity.level
    })

Detailed Assessment Results:
${finOpsPillars
  .map(
    (pillar) =>
      `${pillar.name}: ${pillar.percentage}% (${pillar.maturityLevel})
   - Description: ${pillar.maturityDescription}
   - Max Score: ${pillar.score}/${pillar.maxScore} points
   
   User's Responses for ${pillar.name}:
   ${
     pillar.userAnswers
       ? pillar.userAnswers
           .map(
             (answer) =>
               `   - Question: ${answer.questionText}
      - Selected Answer: ${answer.selectedAnswer}
      - Score: ${answer.score}/5`
           )
           .join("\n")
       : "No responses available"
   }
  `
  )
  .join("\n\n")}

Reference industry benchmarks for ${reportMetadata.industryType} companies of ${
      reportMetadata.clientSize
    } size. Compare the organization's answers against the FinOps Framework standards in your knowledge base only. For each recommendation, reference the specific FinOps Framework standard

Please provide a comprehensive analysis with:
1. Executive Summary (2 paragraphs on overall maturity and key findings)
2. Overall Findings (1 paragraph summarizing the main insights)
3. Key Strengths (3-4 bullet points across all pillars)
4. Key Improvement Areas (6 bullet points across all pillars)
5. Strategic Recommendations (6 actionable items with description and timeline)
6. Implementation Timeline (30/60/90 day priorities)

Format the response as JSON with this structure:
{
  "executiveSummary": "string",
  "overallFindings": "string",
  "strengths": ["string", "string", "string", "string"],
  "improvementAreas": ["string", "string", "string", "string"],
  "recommendations": [
    {"title": "string", "description": "string", "pillar": "string", "priority": "string"},
    ...
  ],
  "timelineSteps": {
    "30day": ["string", ...],
    "60day": ["string", ...],
    "90day": ["string", ...],
    "Beyond 90 Days": ["string", ...]
  }
}
`.trim()

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: CURRENT_MODEL_VERSION,
      messages: [
        {
          role: "system",
          content:
            "You are a FinOps and cloud maturity specialist providing analysis based on assessment data.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    })

    // Extract and parse the JSON response
    const analysisContent = response.choices[0].message.content
    let analysisJson

    try {
      analysisJson = JSON.parse(analysisContent)
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError)
      console.log("Raw response:", analysisContent)

      // Fallback structure
      analysisJson = {
        executiveSummary: "Error parsing AI response. Please try again later.",
        overallFindings: "Analysis parsing failed.",
        strengths: [],
        improvementAreas: [],
        recommendations: [],
        timelineSteps: {},
      }
    }

    // Save to database
    await saveConsolidatedAnalysisToDb(analysisId, clientId, analysisJson)

    return {
      analysisId,
      clientId,
      modelVersion: CURRENT_MODEL_VERSION,
      analysis: analysisJson,
    }
  } catch (error) {
    console.error("Error generating consolidated analysis:", error)
    throw error
  }
}

/**
 * Save consolidated analysis to database
 */
async function saveConsolidatedAnalysisToDb(
  analysisId,
  clientId,
  analysisContent
) {
  try {
    // First delete any existing consolidated analysis for this client
    await query(
      "DELETE FROM AIAnalysis WHERE ClientID = ? AND PillarID = 'consolidated'",
      [clientId]
    )

    // Insert the new analysis
    await query(
      `INSERT INTO AIAnalysis 
       (AnalysisID, ClientID, PillarID, PillarName, Content, ModelVersion, CreatedAt) 
       VALUES (?, ?, 'consolidated', 'Consolidated Analysis', ?, ?, NOW())`,
      [
        analysisId,
        clientId,
        JSON.stringify(analysisContent),
        CURRENT_MODEL_VERSION,
      ]
    )

    console.log(
      `Consolidated analysis saved to database for client ${clientId}`
    )
  } catch (dbError) {
    console.error("Failed to save consolidated analysis to database:", dbError)
    // Continue execution even if DB save fails
  }
}

/**
 * Get consolidated analysis for a client
 * @param {number} clientId - The client ID
 * @returns {Object|null} The analysis or null if not found
 */
export async function getConsolidatedAnalysis(clientId) {
  try {
    const results = await query(
      "SELECT * FROM AIAnalysis WHERE ClientID = ? AND PillarID = 'consolidated'",
      [clientId]
    )

    if (results.length === 0) {
      return null
    }

    const row = results[0]
    return {
      analysisId: row.AnalysisID,
      clientId: row.ClientID,
      modelVersion: row.ModelVersion,
      createdAt: row.CreatedAt,
      analysis: JSON.parse(row.Content),
    }
  } catch (error) {
    console.error(
      "Error retrieving consolidated analysis from database:",
      error
    )
    return null
  }
}

// Delete this function or replace with the consolidated version
export async function generateClientAnalyses(clientId, pillars, aiPrompts) {
  console.log("DEPRECATED: Using generateConsolidatedAnalysis instead")
  return []
}

// Delete this function or replace with the consolidated version
export async function getClientAnalyses(clientId) {
  console.log("DEPRECATED: Using getConsolidatedAnalysis instead")
  return []
}
