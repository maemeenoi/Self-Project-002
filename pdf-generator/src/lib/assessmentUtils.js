// src/lib/assessmentUtils.js

/**
 * Processes database responses into maturity assessment data
 * @param {Array} responses - Array of response objects from the database
 * @returns {Object} Processed assessment data
 */
export function processAssessmentData(responses) {
  // Extract client information
  const clientInfo = {
    name: responses.find((r) => r.QuestionID === 1)?.ResponseText || "Unknown",
    business:
      responses.find((r) => r.QuestionID === 2)?.ResponseText || "Unknown",
    email: responses.find((r) => r.QuestionID === 3)?.ResponseText || "Unknown",
    size: responses.find((r) => r.QuestionID === 4)?.ResponseText || "Unknown",
    industry:
      responses.find((r) => r.QuestionID === 5)?.ResponseText || "Unknown",
  }

  // Group questions by category
  const categoryMapping = {
    "Cloud Strategy": [6, 7, 8],
    "Cloud Cost": [9, 10, 11],
    "Cloud Security": [12, 13],
    "Cloud People": [14, 19, 20],
    "Cloud DevOps": [15, 16, 17, 18],
  }

  // Calculate scores for each category
  const categoryScores = {}
  Object.entries(categoryMapping).forEach(([category, questionIds]) => {
    const scores = questionIds
      .map((id) => {
        const response = responses.find((r) => r.QuestionID === id)
        return response?.Score || 0
      })
      .filter((score) => score > 0)

    // Calculate average score if we have valid scores
    if (scores.length > 0) {
      categoryScores[category] = {
        score: parseFloat(
          (
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          ).toFixed(1)
        ),
        responses: scores,
      }
    }
  })

  // Determine maturity levels based on scores
  const maturityLevels = {
    "Cloud Strategy": determineStrategyMaturityLevel(
      categoryScores["Cloud Strategy"]?.score
    ),
    "Cloud Cost": determineCostMaturityLevel(
      categoryScores["Cloud Cost"]?.score
    ),
    "Cloud Security": determineSecurityMaturityLevel(
      categoryScores["Cloud Security"]?.score
    ),
    "Cloud People": determinePeopleMaturityLevel(
      categoryScores["Cloud People"]?.score
    ),
    "Cloud DevOps": determineDevOpsMaturityLevel(
      categoryScores["Cloud DevOps"]?.score
    ),
  }

  // Calculate overall score
  const overallScore = parseFloat(
    (
      Object.values(categoryScores).reduce((sum, cat) => sum + cat.score, 0) /
      Object.values(categoryScores).length
    ).toFixed(1)
  )

  // Format data for the report components
  return formatReportData(
    clientInfo,
    categoryScores,
    maturityLevels,
    overallScore
  )
}

// Helper functions for determining maturity levels
function determineStrategyMaturityLevel(score) {
  if (!score) return { level: 1, name: "Initial" }
  if (score < 2) return { level: 1, name: "Initial" }
  if (score < 3) return { level: 2, name: "Repeatable" }
  if (score < 4) return { level: 3, name: "Defined" }
  if (score < 4.6) return { level: 4, name: "Managed" }
  return { level: 5, name: "Optimized" }
}

// Similar functions for other categories...

// Format the data for use in the report components
function formatReportData(
  clientInfo,
  categoryScores,
  maturityLevels,
  overallScore
) {
  // Create radar chart data from category scores
  const dimensionalScores = Object.entries(categoryScores).map(
    ([dimension, data]) => ({
      dimension,
      score: data.score,
      fullMark: 5,
    })
  )

  // Generate recommendations based on scores and maturity levels
  const recommendations = generateRecommendations(
    categoryScores,
    maturityLevels
  )

  // Return the complete data object expected by your components
  return {
    reportMetadata: {
      organizationName: clientInfo.business,
      reportDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      reportPeriod: `Q${Math.ceil(
        (new Date().getMonth() + 1) / 3
      )} ${new Date().getFullYear()}`,
    },
    cloudMaturityAssessment: {
      sectionTitle: "Cloud Maturity Assessment",
      overallScore: overallScore,
      currentLevel: determineOverallMaturityLevel(overallScore),
      subtopics: [
        {
          title: "Dimensional Analysis",
          dimensionalScores: dimensionalScores,
        },
        // Add other required subtopics for your components
      ],
      // Include other data needed by MVPCloudMaturityAssessment component
    },
    // Include other sections needed by your report components
  }
}

// Generate recommendations based on maturity assessment
function generateRecommendations(categoryScores, maturityLevels) {
  // Implementation of recommendation generation logic
  // This would use the scores and maturity levels to create tailored recommendations
}
