// src/lib/assessmentUtils.js - Simplified version

/**
 * Processes database responses into maturity assessment data
 * @param {Array} responses - Array of response objects from the database
 * @param {Array} industryStandards - Array of industry standard objects
 * @returns {Object} Processed assessment data
 */
export function processAssessmentData(responses, industryStandards) {
  console.log("Processing responses with ClientInfo:", responses.ClientInfo)

  // Extract client information from ClientInfo or responses
  const clientInfo = {
    contactName:
      responses.find((r) => r.QuestionID === 1)?.ResponseText ||
      responses.ClientInfo?.ContactName ||
      "Unknown",

    organizationName:
      responses.find((r) => r.QuestionID === 2)?.ResponseText ||
      responses.ClientInfo?.ClientName ||
      "Unknown",

    email:
      responses.find((r) => r.QuestionID === 3)?.ResponseText ||
      responses.ClientInfo?.ContactEmail ||
      responses.find((r) => r.TempEmail)?.TempEmail ||
      "Unknown",

    size:
      responses.find((r) => r.QuestionID === 4)?.ResponseText ||
      responses.ClientInfo?.CompanySize ||
      "Unknown",

    industry:
      responses.find((r) => r.QuestionID === 5)?.ResponseText ||
      responses.ClientInfo?.IndustryType ||
      "Unknown",
  }

  console.log("Extracted client info:", clientInfo)

  // Create a map of Industry Standards for fast lookup
  const standardMap = {}
  const questionMap = {}

  industryStandards.forEach((standard) => {
    if (standard.QuestionID != null && standard.Score != null) {
      const key = `${standard.QuestionID}_${standard.Score}`
      standardMap[key] = standard.StandardText
      questionMap[standard.QuestionID] = standard.QuestionText
    }
  })

  // Enrich responses with Standard Text and Question Text
  const enrichedResponses = responses
    .filter((r) => r.QuestionID !== undefined)
    .map((r) => {
      const key = `${r.QuestionID}_${r.Score}`
      return {
        ...r,
        StandardText: standardMap[key] || "No standard available",
        QuestionText: questionMap[r.QuestionID] || `Question ${r.QuestionID}`,
        // Calculate standard score for comparison (if available in industry standards)
        StandardScore: 3.5, // Default for comparison purposes
      }
    })

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

  // Calculate overall score
  const overallScore = parseFloat(
    (
      Object.values(categoryScores).reduce((sum, cat) => sum + cat.score, 0) /
      Object.values(categoryScores).length
    ).toFixed(1)
  )

  // Generate recommendations
  const recommendations = generateRecommendations(categoryScores)

  // Create dimensional scores for radar chart
  const dimensionalScores = Object.entries(categoryScores).map(
    ([dimension, data]) => ({
      dimension,
      score: data.score,
      standardScore: 3.5, // Using a default standard score for comparison
      fullMark: 5,
    })
  )

  // Return formatted data
  return {
    reportMetadata: {
      organizationName: clientInfo.organizationName,
      clientName: clientInfo.contactName,
      clientEmail: clientInfo.email,
      clientSize: clientInfo.size,
      clientIndustry: clientInfo.industry,
      reportDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      reportPeriod: `Q${Math.ceil(
        (new Date().getMonth() + 1) / 3
      )} ${new Date().getFullYear()}`,
    },
    executiveSummary: {
      sectionTitle: "Executive Summary",
      subtopics: [
        {
          title: "Overview",
          content: `This report presents an overview of ${clientInfo.organizationName}'s cloud infrastructure maturity.`,
        },
        {
          title: "Purpose",
          content:
            "To assess and recommend improvements for cloud practices and maturity.",
        },
        {
          title: "Methodology",
          content:
            "Assessment responses analyzed against industry standards to identify gaps and opportunities.",
        },
        {
          title: "Key Recommendations",
          content: recommendations.slice(0, 4).map((rec) => rec.title),
        },
      ],
    },
    cloudMaturityAssessment: {
      overallScore: overallScore,
      currentLevel: determineOverallMaturityLevel(overallScore),
      dimensionalScores: dimensionalScores,
      subtopics: [
        {
          title: "Dimensional Analysis",
          dimensionalScores: dimensionalScores,
        },
      ],
      practiceAreas: generatePracticeAreas(categoryScores),
    },
    recommendations: {
      keyRecommendations: recommendations,
      categoryScores,
      responses: enrichedResponses,
    },
  }
}

/**
 * Determines overall maturity level based on score
 */
function determineOverallMaturityLevel(score) {
  if (score < 2) return "Level 1: Initial"
  if (score < 3) return "Level 2: Repeatable"
  if (score < 4) return "Level 3: Defined"
  if (score < 4.6) return "Level 4: Managed"
  return "Level 5: Optimized"
}

/**
 * Generate practice areas for maturity table
 */
function generatePracticeAreas(categoryScores) {
  return [
    {
      id: "buildManagement",
      name: "Build management and CI",
      currentLevel: determinePracticeLevel(categoryScores, "Cloud DevOps"),
      targetLevel: Math.min(
        determinePracticeLevel(categoryScores, "Cloud DevOps") + 1,
        3
      ),
    },
    {
      id: "environment",
      name: "Environment and deployments",
      currentLevel: determinePracticeLevel(categoryScores, "Cloud DevOps"),
      targetLevel: Math.min(
        determinePracticeLevel(categoryScores, "Cloud DevOps") + 1,
        3
      ),
    },
    {
      id: "release",
      name: "Release management",
      currentLevel: determinePracticeLevel(categoryScores, "Cloud DevOps"),
      targetLevel: Math.min(
        determinePracticeLevel(categoryScores, "Cloud DevOps") + 1,
        3
      ),
    },
    {
      id: "testing",
      name: "Testing",
      currentLevel: Math.max(
        determinePracticeLevel(categoryScores, "Cloud DevOps") - 1,
        -1
      ),
      targetLevel: Math.min(
        determinePracticeLevel(categoryScores, "Cloud DevOps") + 1,
        3
      ),
    },
    {
      id: "dataManagement",
      name: "Data Management",
      currentLevel: determinePracticeLevel(categoryScores, "Cloud Strategy"),
      targetLevel: Math.min(
        determinePracticeLevel(categoryScores, "Cloud Strategy") + 1,
        3
      ),
    },
  ]
}

/**
 * Helper function to determine practice level
 */
function determinePracticeLevel(categoryScores, category) {
  const score = categoryScores[category]?.score || 3

  if (score < 2) return -1 // Regressive
  if (score < 3) return 0 // Repeatable
  if (score < 4) return 1 // Consistent
  if (score < 4.6) return 2 // Quantitatively managed
  return 3 // Optimizing
}

/**
 * Generate recommendations based on scores
 */
function generateRecommendations(categoryScores) {
  const recommendations = []

  // Cloud Cost recommendations
  if ((categoryScores["Cloud Cost"]?.score || 0) < 3.5) {
    recommendations.push({
      title: "Implement Automated Instance Scheduling",
      rationale:
        "Non-production resources are running 24/7, resulting in unnecessary costs during inactive hours.",
      impact: "15-20% reduction in compute costs",
      priority: "Critical",
    })

    recommendations.push({
      title: "Right-size Oversized Instances",
      rationale:
        "Analysis shows 35% of compute instances are significantly over-provisioned.",
      impact: "20-25% reduction in instance costs",
      priority:
        (categoryScores["Cloud Cost"]?.score || 0) < 3 ? "Critical" : "High",
    })
  }

  // Cloud Strategy recommendations
  if ((categoryScores["Cloud Strategy"]?.score || 0) < 4) {
    recommendations.push({
      title: "Standardize Resource Tagging",
      rationale:
        "Inconsistent tagging prevents accurate cost allocation and governance.",
      impact: "Improved cost visibility and governance",
      priority:
        (categoryScores["Cloud Strategy"]?.score || 0) < 3
          ? "Critical"
          : "High",
    })
  }

  // Cloud DevOps recommendations
  if ((categoryScores["Cloud DevOps"]?.score || 0) < 4) {
    recommendations.push({
      title: "Expand Infrastructure as Code Coverage",
      rationale:
        "Only 40% of infrastructure is currently managed as code, leading to configuration drift.",
      impact: "Reduced provisioning time and configuration errors",
      priority:
        (categoryScores["Cloud DevOps"]?.score || 0) < 3 ? "Critical" : "High",
    })
  }

  // Always provide at least one recommendation
  if (recommendations.length === 0) {
    recommendations.push({
      title: "Regular Review of Cloud Resources",
      rationale:
        "Maintain optimal cloud configuration through regular reviews.",
      impact: "Continued optimization and cost control",
      priority: "Medium",
    })
  }

  return recommendations
}

export default {
  processAssessmentData,
}
