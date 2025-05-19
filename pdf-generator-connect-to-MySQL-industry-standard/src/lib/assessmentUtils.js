// // src/lib/assessmentUtils.js - Simplified version

// /**
//  * Processes database responses into maturity assessment data
//  * @param {Array} responses - Array of response objects from the database
//  * @param {Array} industryStandards - Array of industry standard objects
//  * @returns {Object} Processed assessment data
//  */
// export function processAssessmentData(responses, industryStandards) {
//   console.log("Processing responses with ClientInfo:", responses.ClientInfo)

//   // Extract client information from ClientInfo or responses
//   let clientInfo = {}

//   if (responses.ClientInfo) {
//     clientInfo = {
//       name: responses.ClientInfo.ClientName || "Unknown",
//       business:
//         responses.ClientInfo.OrganizationName ||
//         responses.ClientInfo.ClientName ||
//         "Unknown",
//       email: responses.ClientInfo.ContactEmail || "Unknown",
//       size: responses.ClientInfo.CompanySize || "Unknown",
//       industry: responses.ClientInfo.IndustryType || "Unknown",
//     }
//   } else {
//     // Otherwise extract from responses as before
//     clientInfo = {
//       name:
//         responses.find((r) => r.QuestionID === 1)?.ResponseText || "Unknown",
//       business:
//         responses.find((r) => r.QuestionID === 2)?.ResponseText || "Unknown",
//       email:
//         responses.find((r) => r.QuestionID === 3)?.ResponseText || "Unknown",
//       size:
//         responses.find((r) => r.QuestionID === 4)?.ResponseText || "Unknown",
//       industry:
//         responses.find((r) => r.QuestionID === 5)?.ResponseText || "Unknown",
//     }
//   }

//   console.log("Extracted client info:", clientInfo)

//   // Create a map of Industry Standards for fast lookup
//   const standardMap = {}
//   const questionMap = {}

//   industryStandards.forEach((standard) => {
//     if (standard.QuestionID != null && standard.Score != null) {
//       const key = `${standard.QuestionID}_${standard.Score}`
//       standardMap[key] = standard.StandardText
//       questionMap[standard.QuestionID] = standard.QuestionText
//     }
//   })

//   // Enrich responses with Standard Text and Question Text
//   const enrichedResponse = responses
//     .filter((r) => r.QuestionID !== undefined)
//     .map((r) => {
//       const key = `${r.QuestionID}_${r.Score}`
//       return {
//         ...r,
//         StandardText: r.StandardText || "No standard available",
//         QuestionText: questionMap[r.QuestionID] || `Question ${r.QuestionID}`,
//         // Calculate standard score for comparison (if available in industry standards)
//         StandardScore: 3.5, // Default for comparison purposes
//       }
//     })

//   // Group questions by category
//   const categoryMapping = {
//     "Cloud Strategy": [6, 7, 8],
//     "Cloud Cost": [9, 10, 11],
//     "Cloud Security": [12, 13],
//     "Cloud People": [14, 19, 20],
//     "Cloud DevOps": [15, 16, 17, 18],
//   }

//   // Calculate scores for each category
//   const categoryScores = {}
//   Object.entries(categoryMapping).forEach(([category, questionIds]) => {
//     const scores = questionIds
//       .map((id) => {
//         const response = responses.find((r) => r.QuestionID === id)
//         return response?.Score || 0
//       })
//       .filter((score) => score > 0)

//     // Calculate average score if we have valid scores
//     if (scores.length > 0) {
//       categoryScores[category] = {
//         score: parseFloat(
//           (
//             scores.reduce((sum, score) => sum + score, 0) / scores.length
//           ).toFixed(1)
//         ),
//         responses: scores,
//       }
//     }
//   })

//   // Calculate overall score
//   const overallScore = parseFloat(
//     (
//       Object.values(categoryScores).reduce((sum, cat) => sum + cat.score, 0) /
//       Object.values(categoryScores).length
//     ).toFixed(1)
//   )

//   // Generate recommendations
//   const recommendations = generateRecommendations(categoryScores)

//   // Create dimensional scores for radar chart
//   const dimensionalScores = Object.entries(categoryScores).map(
//     ([dimension, data]) => ({
//       dimension,
//       score: data.score,
//       standardScore: 3.5, // Using a default standard score for comparison
//       fullMark: 5,
//     })
//   )

//   // Return formatted data
//   return {
//     reportMetadata: {
//       organizationName: clientInfo.organizationName,
//       clientName: clientInfo.contactName,
//       clientEmail: clientInfo.email,
//       clientSize: clientInfo.size,
//       clientIndustry: clientInfo.industry,
//       reportDate: new Date().toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       }),
//       reportPeriod: `Q${Math.ceil(
//         (new Date().getMonth() + 1) / 3
//       )} ${new Date().getFullYear()}`,
//     },
//     executiveSummary: {
//       sectionTitle: "Executive Summary",
//       subtopics: [
//         {
//           title: "Overview",
//           content: `This report presents an overview of ${clientInfo.organizationName}'s cloud infrastructure maturity.`,
//         },
//         {
//           title: "Purpose",
//           content:
//             "To assess and recommend improvements for cloud practices and maturity.",
//         },
//         {
//           title: "Methodology",
//           content:
//             "Assessment responses analyzed against industry standards to identify gaps and opportunities.",
//         },
//         {
//           title: "Key Recommendations",
//           content: recommendations.slice(0, 4).map((rec) => rec.title),
//         },
//       ],
//     },
//     cloudMaturityAssessment: {
//       overallScore: overallScore,
//       currentLevel: determineOverallMaturityLevel(overallScore),
//       dimensionalScores: dimensionalScores,
//       subtopics: [
//         {
//           title: "Dimensional Analysis",
//           dimensionalScores: dimensionalScores,
//         },
//       ],
//       practiceAreas: generatePracticeAreas(categoryScores),
//     },
//     recommendations: {
//       keyRecommendations: recommendations,
//       categoryScores,
//       responses: enrichedResponse,
//     },
//   }
// }

// /**
//  * Determines overall maturity level based on score
//  */
// function determineOverallMaturityLevel(score) {
//   if (score < 2) return "Level 1: Initial"
//   if (score < 3) return "Level 2: Repeatable"
//   if (score < 4) return "Level 3: Defined"
//   if (score < 4.6) return "Level 4: Managed"
//   return "Level 5: Optimized"
// }

// /**
//  * Generate practice areas for maturity table
//  */
// function generatePracticeAreas(categoryScores) {
//   return [
//     {
//       id: "buildManagement",
//       name: "Build management and CI",
//       currentLevel: determinePracticeLevel(categoryScores, "Cloud DevOps"),
//       targetLevel: Math.min(
//         determinePracticeLevel(categoryScores, "Cloud DevOps") + 1,
//         3
//       ),
//     },
//     {
//       id: "environment",
//       name: "Environment and deployments",
//       currentLevel: determinePracticeLevel(categoryScores, "Cloud DevOps"),
//       targetLevel: Math.min(
//         determinePracticeLevel(categoryScores, "Cloud DevOps") + 1,
//         3
//       ),
//     },
//     {
//       id: "release",
//       name: "Release management",
//       currentLevel: determinePracticeLevel(categoryScores, "Cloud DevOps"),
//       targetLevel: Math.min(
//         determinePracticeLevel(categoryScores, "Cloud DevOps") + 1,
//         3
//       ),
//     },
//     {
//       id: "testing",
//       name: "Testing",
//       currentLevel: Math.max(
//         determinePracticeLevel(categoryScores, "Cloud DevOps") - 1,
//         -1
//       ),
//       targetLevel: Math.min(
//         determinePracticeLevel(categoryScores, "Cloud DevOps") + 1,
//         3
//       ),
//     },
//     {
//       id: "dataManagement",
//       name: "Data Management",
//       currentLevel: determinePracticeLevel(categoryScores, "Cloud Strategy"),
//       targetLevel: Math.min(
//         determinePracticeLevel(categoryScores, "Cloud Strategy") + 1,
//         3
//       ),
//     },
//   ]
// }

// /**
//  * Helper function to determine practice level
//  */
// function determinePracticeLevel(categoryScores, category) {
//   const score = categoryScores[category]?.score || 3

//   if (score < 2) return -1 // Regressive
//   if (score < 3) return 0 // Repeatable
//   if (score < 4) return 1 // Consistent
//   if (score < 4.6) return 2 // Quantitatively managed
//   return 3 // Optimizing
// }

// /**
//  * Generate recommendations based on scores
//  */
// function generateRecommendations(categoryScores) {
//   const recommendations = []

//   // Cloud Cost recommendations
//   if ((categoryScores["Cloud Cost"]?.score || 0) < 3.5) {
//     recommendations.push({
//       title: "Implement Automated Instance Scheduling",
//       rationale:
//         "Non-production resources are running 24/7, resulting in unnecessary costs during inactive hours.",
//       impact: "15-20% reduction in compute costs",
//       priority: "Critical",
//     })

//     recommendations.push({
//       title: "Right-size Oversized Instances",
//       rationale:
//         "Analysis shows 35% of compute instances are significantly over-provisioned.",
//       impact: "20-25% reduction in instance costs",
//       priority:
//         (categoryScores["Cloud Cost"]?.score || 0) < 3 ? "Critical" : "High",
//     })
//   }

//   // Cloud Strategy recommendations
//   if ((categoryScores["Cloud Strategy"]?.score || 0) < 4) {
//     recommendations.push({
//       title: "Standardize Resource Tagging",
//       rationale:
//         "Inconsistent tagging prevents accurate cost allocation and governance.",
//       impact: "Improved cost visibility and governance",
//       priority:
//         (categoryScores["Cloud Strategy"]?.score || 0) < 3
//           ? "Critical"
//           : "High",
//     })
//   }

//   // Cloud DevOps recommendations
//   if ((categoryScores["Cloud DevOps"]?.score || 0) < 4) {
//     recommendations.push({
//       title: "Expand Infrastructure as Code Coverage",
//       rationale:
//         "Only 40% of infrastructure is currently managed as code, leading to configuration drift.",
//       impact: "Reduced provisioning time and configuration errors",
//       priority:
//         (categoryScores["Cloud DevOps"]?.score || 0) < 3 ? "Critical" : "High",
//     })
//   }

//   // Always provide at least one recommendation
//   if (recommendations.length === 0) {
//     recommendations.push({
//       title: "Regular Review of Cloud Resources",
//       rationale:
//         "Maintain optimal cloud configuration through regular reviews.",
//       impact: "Continued optimization and cost control",
//       priority: "Medium",
//     })
//   }

//   return recommendations
// }

// export default {
//   processAssessmentData,
// }
// src/lib/assessmentUtils.js
// This module processes assessment data for the dashboard

// src/lib/assessmentUtils.js
// This module processes assessment data for the dashboard

// src/lib/assessmentUtils.js
// This module processes assessment data for the dashboard

const assessmentUtils = {
  /**
   * Process assessment data for the dashboard
   * @param {Array} responseData - Assessment responses from the API
   * @param {Array} standardsData - Industry standards for comparison
   * @returns {Object} Processed data for the dashboard
   */
  processAssessmentData: (responseData, standardsData) => {
    console.log("Processing assessment data:", {
      responseCount: responseData?.length,
      standardsCount: standardsData?.length,
    })

    // If no responses, return null
    if (
      !responseData ||
      !Array.isArray(responseData) ||
      responseData.length === 0
    ) {
      console.warn("No response data found")
      return null
    }

    // Check if standardsData is valid
    if (
      !standardsData ||
      !Array.isArray(standardsData) ||
      standardsData.length === 0
    ) {
      console.warn("No standards data provided, will use default values")
    }

    // Extract client info
    const clientInfo = responseData.ClientInfo || {}
    console.log("Client info:", clientInfo)

    // Get assessment responses (questionnaires 6-19)
    const assessmentResponse = responseData.filter(
      (response) =>
        response.QuestionID >= 6 &&
        response.QuestionID <= 19 &&
        response.Score !== null
    )

    console.log(`Found ${assessmentResponse.length} assessment responses`)

    // If no assessment responses, return null
    if (!assessmentResponse || assessmentResponse.length === 0) {
      console.warn("No assessment responses found (questions 6-19)")
      return null
    }

    // Group responses by category
    const responsesByCategory = {}
    assessmentResponse.forEach((response) => {
      const category = response.Category || "Uncategorized"

      if (!responsesByCategory[category]) {
        responsesByCategory[category] = []
      }
      responsesByCategory[category].push(response)
    })

    console.log("Categories found:", Object.keys(responsesByCategory))

    // Calculate scores by category
    const categoryScores = {}
    Object.entries(responsesByCategory).forEach(([category, responses]) => {
      const scores = responses.map((r) => r.Score)
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
      categoryScores[category] = {
        score: averageScore,
        responses: responses.length,
      }
    })

    // Calculate overall cloud maturity score
    const overallScore =
      Object.values(categoryScores).reduce(
        (sum, category) => sum + category.score,
        0
      ) / Object.keys(categoryScores).length

    // Determine current maturity level based on score
    let currentLevel = ""
    if (overallScore < 1.5) {
      currentLevel = "Initial"
    } else if (overallScore < 2.5) {
      currentLevel = "Developing"
    } else if (overallScore < 3.5) {
      currentLevel = "Defined"
    } else if (overallScore < 4.5) {
      currentLevel = "Advanced"
    } else {
      currentLevel = "Optimized"
    }

    // Compare with industry standards if available
    const standardsComparison = []

    // If we have standards data, use it
    if (standardsData && standardsData.length > 0) {
      // Map standards to responses by QuestionID
      const standardsMap = {}
      standardsData.forEach((standard) => {
        standardsMap[standard.QuestionID] = standard
      })

      // Compare each response with its standard
      assessmentResponse.forEach((response) => {
        const standard = standardsMap[response.QuestionID]
        if (standard) {
          standardsComparison.push({
            QuestionID: response.QuestionID,
            QuestionText: response.QuestionText,
            Category: response.Category,
            Score: response.Score,
            StandardScore: standard.Score,
            Difference: response.Score - standard.Score,
          })
        }
      })
    }
    // If no standards data, create synthetic comparison data
    else {
      // Create synthetic standards with a default score of 3
      assessmentResponse.forEach((response) => {
        standardsComparison.push({
          QuestionID: response.QuestionID,
          QuestionText: response.QuestionText,
          Category: response.Category,
          Score: response.Score,
          StandardScore: 3, // Default industry standard
          Difference: response.Score - 3,
        })
      })
    }

    // Create dimensional scores for radar chart
    const dimensions = {
      "Cloud Strategy": [],
      "Cloud Cost": [],
      "Cloud Security": [],
      "Cloud People": [],
      "Cloud DevOps": [],
    }

    // Populate dimensions with scores
    assessmentResponse.forEach((response) => {
      const category = response.Category
      if (dimensions[category]) {
        dimensions[category].push(response.Score)
      } else if (category) {
        // If category doesn't match predefined dimensions but exists, add it
        dimensions[category] = [response.Score]
      }
    })

    // Calculate average score for each dimension
    const dimensionalScores = Object.entries(dimensions)
      .map(([dimension, scores]) => {
        // Skip dimensions with no scores
        if (!scores || scores.length === 0) return null

        // Calculate average score
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length

        // Find matching standard score
        let standardScore = 3 // Default standard score

        if (standardsData && standardsData.length > 0) {
          const matchingStandards = standardsData.filter(
            (s) => s.Category === dimension
          )

          if (matchingStandards.length > 0) {
            standardScore =
              matchingStandards.reduce((a, b) => a + b.Score, 0) /
              matchingStandards.length
          }
        }

        return {
          dimension,
          score: avgScore,
          standardScore,
        }
      })
      .filter(Boolean) // Remove null entries

    // Prepare report metadata
    const reportMetadata = {
      clientName: clientInfo.ClientName || "Unknown",
      organizationName: clientInfo.OrganizationName || "Unknown Organization",
      clientSize: clientInfo.CompanySize || "",
      industryType: clientInfo.IndustryType || "",
      reportDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      overallScore: overallScore.toFixed(1),
    }

    // Return processed assessment data
    return {
      cloudMaturityAssessment: {
        overallScore,
        currentLevel,
        dimensionalScores,
      },
      recommendations: {
        categoryScores,
        responses: standardsComparison,
      },
      reportMetadata,
    }
  },
}

export default assessmentUtils
