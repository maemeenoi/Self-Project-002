// src/lib/assessmentUtils.js
// This module processes assessment data to generate the cloud maturity dashboard visuals

const assessmentUtils = {
  /**
   * Process assessment data for the cloud maturity dashboard
   * @param {Array} responseData - Assessment responses from the API
   * @param {Array} standardsData - Industry standards for comparison
   * @returns {Object} Processed data for the dashboard
   */
  processAssessmentData: function (responseData, standardsData) {
    console.log("Processing enhanced assessment data:", {
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

    // Define our maturity levels
    const maturityLevels = [
      {
        level: 1,
        name: "Initial",
        description: "Ad-hoc practices with minimal formalization",
      },
      {
        level: 2,
        name: "Developing",
        description: "Basic processes established but inconsistently applied",
      },
      {
        level: 3,
        name: "Defined",
        description: "Standardized processes with consistent implementation",
      },
      {
        level: 4,
        name: "Managed",
        description:
          "Measured and controlled processes with quantitative goals",
      },
      {
        level: 5,
        name: "Optimizing",
        description: "Continuous improvement with proactive optimization",
      },
    ]

    // Define dimensions and their question mappings based on the Excel file
    const dimensions = [
      {
        id: "strategic_alignment",
        name: "Strategic Alignment",
        questionIds: [4, 5],
        description:
          "How well cloud initiatives align with business goals and strategy",
      },
      {
        id: "cost_visibility",
        name: "Cost Visibility & Value Assessment",
        questionIds: [6, 7, 8],
        description: "Ability to track, manage, and optimize cloud spending",
      },
      {
        id: "cloud_adoption",
        name: "Cloud Adoption",
        questionIds: [5, 6],
        description: "Current cloud adoption level and migration progress",
      },
      {
        id: "security_posture",
        name: "Security Posture",
        questionIds: [9, 10],
        description:
          "Effectiveness of cloud security policies, controls, and monitoring",
      },
      {
        id: "operational_excellence",
        name: "Operational Excellence",
        questionIds: [11, 12, 13, 14, 15],
        description:
          "Effectiveness of cloud operations, automation and DevOps practices",
      },
      {
        id: "organizational_enablement",
        name: "Organizational Enablement",
        questionIds: [16, 17],
        description:
          "Team structure, skills and training to support cloud operations",
      },
    ]

    // Filter only assessment responses (questions 6-19)
    const assessmentResponses = responseData.filter(
      (response) =>
        response.QuestionID >= 6 &&
        response.QuestionID <= 19 &&
        response.Score !== null
    )

    console.log(`Found ${assessmentResponses.length} assessment responses`)

    if (!assessmentResponses || assessmentResponses.length === 0) {
      console.warn("No assessment responses found (questions 6-19)")
      return null
    }

    // Calculate scores for each dimension
    const dimensionScores = dimensions.map((dimension) => {
      // Get responses for this dimension
      const dimensionResponses = assessmentResponses.filter((response) =>
        dimension.questionIds.includes(response.QuestionID)
      )

      // Special handling for client info questions (4-5)
      // For questions 4-5, which are basic client info, we need to convert them to a score
      const clientInfoResponses = dimension.questionIds.filter((id) => id <= 5)
      let additionalScore = 0
      let additionalCount = 0

      // If this dimension includes client info questions, convert them to scores
      if (clientInfoResponses.length > 0) {
        // This approach assigns a default score of 3 (middle of the scale) for client info
        // You might want to use a more sophisticated method based on your business logic
        additionalScore = clientInfoResponses.length * 3
        additionalCount = clientInfoResponses.length
      }

      // Skip if no responses for this dimension and no client info
      if (!dimensionResponses.length && additionalCount === 0) {
        return {
          id: dimension.id,
          name: dimension.name,
          score: 0,
          percentage: 0,
          maturityLevel: 0,
          maturityName: "N/A",
          recommendations: [],
          description: dimension.description,
        }
      }

      // Calculate average score for this dimension, including client info if applicable
      const responseScore = dimensionResponses.reduce(
        (sum, response) => sum + response.Score,
        0
      )
      const totalScore = responseScore + additionalScore
      const totalCount = dimensionResponses.length + additionalCount
      const averageScore = totalScore / totalCount

      // Convert score to percentage
      const percentage = Math.round((averageScore / 5) * 100)

      // Determine maturity level
      let maturityLevel
      if (averageScore < 1.5) maturityLevel = maturityLevels[0]
      else if (averageScore < 2.5) maturityLevel = maturityLevels[1]
      else if (averageScore < 3.5) maturityLevel = maturityLevels[2]
      else if (averageScore < 4.5) maturityLevel = maturityLevels[3]
      else maturityLevel = maturityLevels[4]

      // Generate recommendations based on score
      const recommendations = []

      // If score is below standard (3.5), add recommendation
      if (averageScore < 3.5) {
        let priority = "Medium"
        if (averageScore < 2) priority = "Critical"
        else if (averageScore < 3) priority = "High"

        recommendations.push({
          title: `Improve ${dimension.name}`,
          rationale: `Your organization scored below industry standard in ${dimension.name}.`,
          impact: `Moving from ${maturityLevel.name} to ${
            maturityLevels[Math.min(Math.ceil(averageScore), 4)].name
          } maturity`,
          priority: priority,
        })
      }

      return {
        id: dimension.id,
        name: dimension.name,
        score: parseFloat(averageScore.toFixed(1)),
        percentage: percentage,
        maturityLevel: maturityLevel.level,
        maturityName: maturityLevel.name,
        recommendations: recommendations,
        description: dimension.description,
        responses: dimensionResponses.length,
      }
    })

    // Calculate overall score
    const validDimensions = dimensionScores.filter((d) => d.score > 0)
    const overallScore =
      validDimensions.length > 0
        ? parseFloat(
            (
              validDimensions.reduce((sum, dim) => sum + dim.score, 0) /
              validDimensions.length
            ).toFixed(1)
          )
        : 0

    // Determine overall maturity level
    let overallMaturityLevel
    if (overallScore < 1.5) overallMaturityLevel = maturityLevels[0]
    else if (overallScore < 2.5) overallMaturityLevel = maturityLevels[1]
    else if (overallScore < 3.5) overallMaturityLevel = maturityLevels[2]
    else if (overallScore < 4.5) overallMaturityLevel = maturityLevels[3]
    else overallMaturityLevel = maturityLevels[4]

    // Build radar chart data for dimensional comparison
    const radarData = dimensionScores
      .filter((dim) => dim.score > 0)
      .map((dim) => ({
        dimension: dim.name,
        score: dim.score,
        standardScore: 3.5, // Industry standard benchmark
      }))

    // Collect all recommendations and sort by priority
    const allRecommendations = dimensionScores
      .flatMap((dim) => dim.recommendations)
      .sort((a, b) => {
        const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })

    // Create implementation roadmap (phased approach to improvements)
    const implementationRoadmap = [
      {
        phase: "Immediate (0-30 days)",
        actions: allRecommendations
          .filter((rec) => rec.priority === "Critical")
          .map((rec) => rec.title),
      },
      {
        phase: "Short-term (1-3 months)",
        actions: allRecommendations
          .filter((rec) => rec.priority === "High")
          .map((rec) => rec.title),
      },
      {
        phase: "Medium-term (3-6 months)",
        actions: allRecommendations
          .filter((rec) => rec.priority === "Medium")
          .map((rec) => rec.title),
      },
      {
        phase: "Long-term (6-12 months)",
        actions: [
          "Implement continuous improvement processes",
          "Advanced cloud optimization",
          "Fully automated governance frameworks",
          "Develop cloud center of excellence",
        ],
      },
    ]

    // Ensure each phase has at least some actions
    implementationRoadmap.forEach((phase) => {
      if (phase.actions.length === 0) {
        phase.actions = ["Review and align with organization priorities"]
      }
    })

    // Prepare cloud spend data (simulated)
    const cloudSpend = {
      byService: [
        { name: "Compute", value: 40 },
        { name: "Storage", value: 25 },
        { name: "Database", value: 15 },
        { name: "Network", value: 12 },
        { name: "Other", value: 8 },
      ],
      potential: {
        current: Math.round(1000 - 50 * overallScore),
        optimized: Math.round(700 - 30 * overallScore),
      },
    }

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
    }

    // Calculate category scores for compatibility with existing code
    const categoryScores = {}
    dimensionScores.forEach((dimension) => {
      // Map dimension names to the existing category names
      let categoryName
      if (dimension.id === "strategic_alignment")
        categoryName = "Cloud Strategy"
      else if (dimension.id === "cost_visibility") categoryName = "Cloud Cost"
      else if (dimension.id === "security_posture")
        categoryName = "Cloud Security"
      else if (dimension.id === "organizational_enablement")
        categoryName = "Cloud People"
      else if (dimension.id === "operational_excellence")
        categoryName = "Cloud DevOps"
      else if (dimension.id === "cloud_adoption")
        categoryName = "Cloud Adoption"
      else categoryName = dimension.name

      categoryScores[categoryName] = {
        score: dimension.score,
        responses: dimension.responses,
      }
    })

    // Return the complete assessment object
    return {
      // Include the original structure for backward compatibility
      cloudMaturityAssessment: {
        overallScore,
        currentLevel: `${overallMaturityLevel.name}`,
        dimensionalScores: radarData,
      },
      recommendations: {
        keyRecommendations: allRecommendations,
        categoryScores,
        responses: assessmentResponses.map((response) => {
          // Find matching standard from standardsData if available
          const standard = standardsData?.find(
            (s) => s.QuestionID === response.QuestionID
          )

          return {
            QuestionID: response.QuestionID,
            QuestionText:
              response.QuestionText || `Question ${response.QuestionID}`,
            Category: response.Category || "Uncategorized",
            Score: response.Score,
            StandardScore: standard?.Score || 3, // Default to 3 if no standard
            StandardText:
              standard?.StandardText || "Industry standard practice",
            Difference: response.Score - (standard?.Score || 3),
          }
        }),
        implementationRoadmap,
      },

      // Enhanced structure with detailed dimensional analysis
      reportMetadata,
      dimensions: dimensionScores,
      cloudSpend,

      // Additional data for advanced visualizations
      overallMaturity: {
        score: overallScore,
        percentage: Math.round((overallScore / 5) * 100),
        level: overallMaturityLevel.level,
        name: overallMaturityLevel.name,
        description: overallMaturityLevel.description,
        maturityLevels,
      },

      // Include time-to-value data based on maturity score
      timeToValue: {
        current: [
          {
            name: "Initial Implementation",
            value: 5 - Math.min(4, Math.round(overallScore)),
          },
          {
            name: "Time to Market",
            value: 6 - Math.min(5, Math.round(overallScore)),
          },
          {
            name: "Deployment Frequency",
            value: 4 - Math.min(3, Math.round(overallScore)),
          },
          {
            name: "Change Failure Rate",
            value: 5 - Math.min(4, Math.round(overallScore)),
          },
        ],
        optimized: [
          { name: "Initial Implementation", value: 1 },
          { name: "Time to Market", value: 2 },
          { name: "Deployment Frequency", value: 1 },
          { name: "Change Failure Rate", value: 1.5 },
        ],
      },

      // Standards comparison counts for visualization
      standardsComparison: {
        above: assessmentResponses.filter(
          (r) =>
            r.Score >
            (standardsData?.find((s) => s.QuestionID === r.QuestionID)?.Score ||
              3)
        ).length,
        meeting: assessmentResponses.filter(
          (r) =>
            r.Score ===
            (standardsData?.find((s) => s.QuestionID === r.QuestionID)?.Score ||
              3)
        ).length,
        below: assessmentResponses.filter(
          (r) =>
            r.Score <
            (standardsData?.find((s) => s.QuestionID === r.QuestionID)?.Score ||
              3)
        ).length,
      },
    }
  },

  /**
   * Utility function to determine maturity level name from score
   * @param {number} score - Maturity score (1-5)
   * @returns {string} Maturity level name
   */
  getMaturityLevelName: function (score) {
    if (score < 1.5) return "Initial"
    if (score < 2.5) return "Developing"
    if (score < 3.5) return "Defined"
    if (score < 4.5) return "Managed"
    return "Optimizing"
  },

  /**
   * Get a color for visualization based on maturity score
   * @param {number} score - Maturity score (1-5)
   * @returns {string} Hex color code
   */
  getMaturityColor: function (score) {
    if (score < 1.5) return "#ef4444" // Red
    if (score < 2.5) return "#f59e0b" // Orange/Amber
    if (score < 3.5) return "#3b82f6" // Blue
    if (score < 4.5) return "#10b981" // Green
    return "#059669" // Dark Green
  },
}

export default assessmentUtils
