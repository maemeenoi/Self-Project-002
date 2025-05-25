// src/lib/assessmentUtils.js

const assessmentUtils = {
  /**
   * Process assessment data for the cloud maturity dashboard
   * @param {Array} responseData - Assessment responses from the API
   * @param {Array} standardsData - Industry standards for comparison (not used in new implementation)
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

    // Extract client info (Question 1-5)
    const clientInfo = responseData.ClientInfo || {}
    console.log("Client info:", clientInfo)

    // Define FinOps Maturity Pillars with CORRECTED question mapping and max scores
    const finOpsPillars = [
      {
        id: "strategic_alignment",
        name: "Strategic Alignment",
        questionIds: [6, 7, 8], // 3 questions
        maxScore: 15, // 3 questions × 5 points each
        description:
          "How well cloud initiatives align with business goals and strategy",
      },
      {
        id: "cost_visibility",
        name: "Cost Visibility & Value Assessment",
        questionIds: [9, 10, 11], // 3 questions
        maxScore: 15, // 3 questions × 5 points each
        description: "Ability to track, manage, and optimize cloud spending",
      },
      {
        id: "security_posture",
        name: "Security Posture",
        questionIds: [12, 13], // 2 questions
        maxScore: 10, // 2 questions × 5 points each
        description:
          "Effectiveness of cloud security policies, controls, and monitoring",
      },
      {
        id: "organizational_enablement",
        name: "Organizational Enablement",
        questionIds: [14, 15], // 2 questions
        maxScore: 10, // 2 questions × 5 points each
        description:
          "Team structure, skills and training to support cloud operations",
      },
      {
        id: "operational_excellence",
        name: "Operational Excellence",
        questionIds: [16, 17, 18], // 3 questions
        maxScore: 15, // 3 questions × 5 points each
        description:
          "Effectiveness of cloud operations, automation and DevOps practices",
      },
      {
        id: "cloud_adoption",
        name: "Cloud Adoption",
        questionIds: [19], // 1 question
        maxScore: 5, // 1 question × 5 points each
        description: "Current cloud adoption level and migration progress",
      },
    ]

    // FinOps Maturity Descriptions from the provided matrix
    const finOpsDescriptions = {
      "Strategic Alignment": {
        low: "Cloud strategy is fragmented and disconnected from business objectives. No clear alignment between technology investments and business outcomes.",
        medium:
          "Basic cloud strategy exists but lacks comprehensive business integration. Some alignment between technology initiatives and business goals.",
        high: "Cloud strategy is fully integrated with business strategic objectives. Clear, measurable business outcomes tied to cloud investments.",
      },
      "Cost Visibility & Value Assessment": {
        low: "Limited to no visibility into cloud spending. No systematic cost tracking or allocation. Reactive approach to cloud expenses.",
        medium:
          "Partial visibility into cloud costs. Basic cost allocation by department or project. Emerging understanding of cloud spending patterns.",
        high: "Real-time, granular visibility into cloud spending. Sophisticated cost allocation across multiple dimensions. Proactive cost optimization strategies.",
      },
      "Security Posture": {
        low: "Minimal cloud security controls. Reactive security approach. Limited understanding of cloud security risks. No consistent security policies.",
        medium:
          "Basic security controls in place. Emerging security governance. Partial implementation of security best practices. Some security automation.",
        high: "Comprehensive, proactive security strategy. Advanced security automation. Continuous security monitoring and assessment.",
      },
      "Organizational Enablement": {
        low: "Limited cloud training and skills development. No dedicated cloud competency center. High dependency on external consultants.",
        medium:
          "Basic cloud training programs. Emerging cloud competency center. Growing internal cloud expertise.",
        high: "Comprehensive, continuous learning programs. Mature Cloud Center of Excellence. Strong internal cloud and FinOps expertise.",
      },
      "Operational Excellence": {
        low: "Manual, inefficient operational processes. High incident rates and long recovery times. Limited monitoring and observability. Minimal automation.",
        medium:
          "Emerging DevOps practices. Partial automation of deployment and operations. Improving monitoring capabilities.",
        high: "Advanced DevOps and SRE practices. Highly automated deployment and operations. Proactive monitoring and self-healing systems.",
      },
      "Cloud Adoption": {
        low: "Minimal cloud adoption, primarily lift-and-shift approach. Limited cloud skills within the organization. Majority of workloads still on-premises.",
        medium:
          "Hybrid cloud environment with mixed adoption. Some cloud-native applications and services. Growing cloud skills and expertise.",
        high: "Predominantly cloud-native architecture. Multi-cloud and hybrid cloud strategies. Advanced cloud skills across the organization.",
      },
    }

    // Filter only assessment responses (questions 6-19)
    const assessmentResponse = responseData.filter(
      (response) =>
        response.QuestionID >= 6 &&
        response.QuestionID <= 19 &&
        response.Score !== null
    )

    console.log(`Found ${assessmentResponse.length} assessment responses`)

    if (!assessmentResponse || assessmentResponse.length === 0) {
      console.warn("No assessment responses found (questions 6-19)")
      return null
    }

    // Calculate scores for each FinOps pillar
    const pillarScores = finOpsPillars.map((pillar) => {
      // Get responses for this pillar
      const pillarResponse = assessmentResponse.filter((response) =>
        pillar.questionIds.includes(response.QuestionID)
      )

      console.log(
        `${pillar.name}: Found ${pillarResponse.length} responses out of ${pillar.questionIds.length} expected`
      )

      if (pillarResponse.length === 0) {
        return {
          id: pillar.id,
          name: pillar.name,
          score: 0,
          percentage: 0,
          maturityLevel: "Low",
          maturityDescription:
            finOpsDescriptions[pillar.name]?.low ||
            "Limited capabilities in this area",
          recommendations: [],
          description: pillar.description,
          responses: 0,
          maxScore: pillar.maxScore,
        }
      }

      // Handle multiple responses per question by taking the highest score for each question ID
      const highestScoresByQuestionId = new Map()

      pillarResponse.forEach((response) => {
        const questionId = response.QuestionID
        const currentScore = response.Score || 0

        // If we haven't seen this question before, or the current score is higher than previous
        if (
          !highestScoresByQuestionId.has(questionId) ||
          currentScore > highestScoresByQuestionId.get(questionId).score
        ) {
          highestScoresByQuestionId.set(questionId, {
            score: currentScore,
            response: response,
          })
        }
      })

      // Get the unique question responses with highest scores
      const uniqueResponse = Array.from(highestScoresByQuestionId.values()).map(
        (item) => item.response
      )

      console.log(
        `${pillar.name}: Using ${uniqueResponse.length} unique questions (after deduplication)`
      )

      // Calculate total score using only the highest score for each question
      const totalScore = Array.from(highestScoresByQuestionId.values()).reduce(
        (sum, item) => sum + item.score,
        0
      )

      // Cap percentage at 100%
      const percentage = Math.min(
        100,
        Math.round((totalScore / pillar.maxScore) * 100)
      )

      console.log(
        `${pillar.name}: ${totalScore}/${pillar.maxScore} = ${percentage}%`
      )

      // Determine maturity level based on percentage
      let maturityLevel, maturityDescription
      if (percentage < 30) {
        maturityLevel = "Low"
        maturityDescription =
          finOpsDescriptions[pillar.name]?.low ||
          "Limited capabilities in this area"
      } else if (percentage < 70) {
        maturityLevel = "Medium"
        maturityDescription =
          finOpsDescriptions[pillar.name]?.medium ||
          "Developing capabilities in this area"
      } else {
        maturityLevel = "High"
        maturityDescription =
          finOpsDescriptions[pillar.name]?.high ||
          "Advanced capabilities in this area"
      }

      // Generate basic recommendations (these will be replaced with AI recommendations)
      const recommendations = []
      if (maturityLevel === "Low") {
        recommendations.push({
          title: `Immediate attention required for ${pillar.name}`,
          rationale: `Your organization scored ${percentage}% (Low maturity) in ${pillar.name}.`,
          impact: "Critical foundational issues need to be addressed",
          priority: "Critical",
        })
      } else if (maturityLevel === "Medium") {
        recommendations.push({
          title: `Accelerate improvement in ${pillar.name}`,
          rationale: `Your organization scored ${percentage}% (Medium maturity) in ${pillar.name}.`,
          impact: "Good foundation exists, focus on optimization",
          priority: "High",
        })
      }

      // Return the pillar data
      return {
        id: pillar.id,
        name: pillar.name,
        score: totalScore,
        percentage: percentage,
        maturityLevel: maturityLevel,
        maturityDescription: maturityDescription,
        recommendations: recommendations, // These are placeholders that will be replaced
        description: pillar.description,
        responses: uniqueResponse.length,
        maxScore: pillar.maxScore,
        userAnswers: uniqueResponse.map((r) => ({
          questionId: r.QuestionID,
          questionText: r.QuestionText,
          selectedAnswer: r.StandardText || `Score: ${r.Score}`,
          score: r.Score,
        })),
      }
    })

    // Calculate overall score
    const totalMaxScore = finOpsPillars.reduce(
      (sum, pillar) => sum + pillar.maxScore,
      0
    )
    const totalActualScore = pillarScores.reduce(
      (sum, pillar) => sum + pillar.score,
      0
    )
    // Cap overall percentage at 100%
    const overallPercentage = Math.min(
      100,
      Math.round((totalActualScore / totalMaxScore) * 100)
    )

    console.log(
      `Overall: ${totalActualScore}/${totalMaxScore} = ${overallPercentage}%`
    )

    // Determine overall maturity level
    let overallMaturityLevel
    if (overallPercentage < 30) {
      overallMaturityLevel = "Low (Initial/Emerging)"
    } else if (overallPercentage < 70) {
      overallMaturityLevel = "Medium (Developing)"
    } else {
      overallMaturityLevel = "High (Advanced/Optimizing)"
    }

    // Build radar chart data for dimensional comparison
    const radarData = pillarScores
      .filter((pillar) => pillar.score > 0)
      .map((pillar) => ({
        dimension: pillar.name,
        score: pillar.percentage,
        standardScore: 50, // 50% as middle benchmark
      }))

    // Collect basic recommendations (these will be replaced with AI recommendations)
    const allRecommendations = pillarScores
      .flatMap((pillar) => pillar.recommendations)
      .sort((a, b) => {
        const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })

    // Create a default implementation roadmap (will be replaced with AI roadmap)
    const implementationRoadmap = [
      {
        phase: "First 30 Days",
        actions: allRecommendations
          .filter((rec) => rec.priority === "Critical")
          .map((rec) => rec.title),
      },
      {
        phase: "31-60 Days",
        actions: allRecommendations
          .filter((rec) => rec.priority === "High")
          .map((rec) => rec.title),
      },
      {
        phase: "61-90 Days",
        actions: allRecommendations
          .filter((rec) => rec.priority === "Medium")
          .map((rec) => rec.title),
      },
      {
        phase: "Beyond 90 Days",
        actions: allRecommendations
          .filter((rec) => rec.priority === "Low")
          .map((rec) => rec.title),
      },
    ]

    // Ensure each phase has at least some actions
    implementationRoadmap.forEach((phase) => {
      if (phase.actions.length === 0) {
        phase.actions = ["Review and align with organizational priorities"]
      }
    })

    // Prepare report metadata
    const reportMetadata = {
      clientName: clientInfo.ClientName || "Unknown",
      organizationName: clientInfo.OrganizationName || "Unknown Organization",
      clientSize: clientInfo.CompanySize || "Not specified",
      industryType: clientInfo.IndustryType || "Not specified",

      // Use the assessment submission date
      reportDate: (() => {
        // Look for the first response with a ResponseDate
        if (Array.isArray(responseData)) {
          // Find a response with question ID 20 (feedback question) as it's typically the last question
          const lastResponse = responseData.find(
            (r) => r.QuestionID === 20 && r.ResponseDate
          )

          // If found, use its date
          if (lastResponse && lastResponse.ResponseDate) {
            return new Date(lastResponse.ResponseDate).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )
          }

          // Otherwise, just use the first response with a date
          const anyResponse = responseData.find((r) => r.ResponseDate)
          if (anyResponse && anyResponse.ResponseDate) {
            return new Date(anyResponse.ResponseDate).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )
          }
        }

        // If no response dates found, use client's last login date if available
        if (clientInfo && clientInfo.LastLoginDate) {
          return new Date(clientInfo.LastLoginDate).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )
        }

        // Only use current date as absolute last resort
        return new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      })(),
    }

    // Create category scores for compatibility with existing visualizations
    const categoryScores = {}
    pillarScores.forEach((pillar) => {
      categoryScores[pillar.name] = {
        score: pillar.percentage / 20, // Convert percentage to 1-5 scale for compatibility
        responses: pillar.responses,
      }
    })

    // Return the base assessment object without AI analysis integration
    // The AI analysis will be fetched and merged separately
    return {
      cloudMaturityAssessment: {
        overallScore: overallPercentage / 20,
        currentLevel: overallMaturityLevel,
        dimensionalScores: radarData,
      },
      recommendations: {
        keyRecommendations: allRecommendations,
        categoryScores,
        responses: assessmentResponse.map((response) => ({
          QuestionID: response.QuestionID,
          QuestionText:
            response.QuestionText || `Question ${response.QuestionID}`,
          Category: response.Category || "Uncategorized",
          Score: response.Score,
          StandardScore: 3, // Default benchmark
          StandardText: response.StandardText || `Score: ${response.Score}`,
          Difference: response.Score - 3,
        })),
        implementationRoadmap,
      },

      // New FinOps structure
      reportMetadata,
      finOpsPillars: pillarScores,
      overallFinOpsMaturity: {
        percentage: overallPercentage,
        level: overallMaturityLevel,
        totalScore: totalActualScore,
        maxScore: totalMaxScore,
      },

      // AI insights placeholder
      executiveSummary: null,
      overallFindings: null,
      strengths: [],
      improvementAreas: [],
      // Note: recommendations are already included in the structure above
      timelineSteps: null,

      // Standards comparison based on FinOps benchmarks
      standardsComparison: {
        above: pillarScores.filter((p) => p.percentage > 70).length,
        meeting: pillarScores.filter(
          (p) => p.percentage >= 30 && p.percentage <= 70
        ).length,
        below: pillarScores.filter((p) => p.percentage < 30).length,
      },
    }
  },

  /**
   * Fetch and integrate AI analysis data with assessment data
   * @param {number} clientId - The client ID
   * @param {Object} baseAssessmentData - The base assessment data without AI insights
   * @returns {Object} Integrated assessment data with AI insights
   */
  integrateAIAnalysis: async function (clientId, baseAssessmentData) {
    console.log(`Integrating AI analysis for client ${clientId}`)

    if (!baseAssessmentData) {
      console.warn("No base assessment data to integrate AI analysis with")
      return null
    }

    try {
      // Fetch AI analysis
      const aiAnalysis = await this.getConsolidatedAnalysis(clientId)

      if (!aiAnalysis) {
        console.log("No AI analysis available, using base assessment data")
        return baseAssessmentData
      }

      console.log(
        "Successfully fetched AI analysis, integrating with assessment data"
      )

      // Create a deep copy of the base assessment data
      const integratedData = JSON.parse(JSON.stringify(baseAssessmentData))

      // If we have AI analysis, integrate it into the processedData directly
      if (aiAnalysis.analysis) {
        // Add the executive summary and findings at the top level
        integratedData.executiveSummary =
          aiAnalysis.analysis.executiveSummary || null
        integratedData.overallFindings =
          aiAnalysis.analysis.overallFindings || null
        integratedData.strengths = aiAnalysis.analysis.strengths || []
        integratedData.improvementAreas =
          aiAnalysis.analysis.improvementAreas || []
        integratedData.timelineSteps = aiAnalysis.analysis.timelineSteps || null

        // Also add AI metadata for tracking
        integratedData.aiMetadata = {
          analysisId: aiAnalysis.analysisId,
          modelVersion: aiAnalysis.modelVersion,
          createdAt: aiAnalysis.createdAt,
        }

        // Replace the recommendations if available
        if (
          aiAnalysis.analysis.recommendations &&
          aiAnalysis.analysis.recommendations.length > 0
        ) {
          integratedData.recommendations.keyRecommendations =
            aiAnalysis.analysis.recommendations
        }

        // Replace the implementation roadmap with AI timeline
        if (aiAnalysis.analysis.timelineSteps) {
          // Transform the timeline steps into the format expected by the UI
          const aiRoadmap = [
            {
              phase: "First 30 Days",
              actions: aiAnalysis.analysis.timelineSteps["30day"] || [],
            },
            {
              phase: "31-60 Days",
              actions: aiAnalysis.analysis.timelineSteps["60day"] || [],
            },
            {
              phase: "61-90 Days",
              actions: aiAnalysis.analysis.timelineSteps["90day"] || [],
            },
            {
              phase: "Beyond 90 Days",
              actions:
                aiAnalysis.analysis.timelineSteps["Beyond 90 Days"] || [],
            },
          ]

          integratedData.recommendations.implementationRoadmap = aiRoadmap
        }
      }

      return integratedData
    } catch (error) {
      console.error("Error integrating AI analysis:", error)
      // Return the original data if there's an error
      return baseAssessmentData
    }
  },

  /**
   * Get consolidated analysis for a client
   * @param {number} clientId - The client ID
   * @returns {Object|null} The analysis or null if not found
   */
  getConsolidatedAnalysis: async function (clientId) {
    try {
      const response = await fetch(`/api/consolidated-analysis/${clientId}`)

      if (!response.ok) {
        console.warn(
          `Failed to fetch consolidated analysis: ${response.status}`
        )
        return null
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error getting consolidated analysis:", error)
      return null
    }
  },

  /**
   * Generate consolidated AI analysis for a client
   * @param {number} clientId - The client ID
   * @param {Object} assessmentData - The assessment data to analyze
   * @returns {Object|null} The generated analysis or null if generation failed
   */
  generateConsolidatedAnalysis: async function (clientId, assessmentData) {
    try {
      const response = await fetch(`/api/consolidated-analysis/${clientId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentData,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate analysis: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error generating consolidated analysis:", error)
      return null
    }
  },

  /**
   * Process assessment data and integrate AI analysis in one call
   * @param {Array} responseData - Assessment responses from the API
   * @param {Array} standardsData - Industry standards for comparison
   * @param {number} clientId - The client ID
   * @returns {Promise<Object>} Processed data with AI insights
   */
  processAssessmentWithAI: async function (
    responseData,
    standardsData,
    clientId
  ) {
    // First process the basic assessment data
    const baseData = this.processAssessmentData(responseData, standardsData)

    if (!baseData) {
      return null
    }

    // If no clientId provided, we can't fetch AI analysis
    if (!clientId) {
      console.log("No clientId provided, skipping AI analysis integration")
      return baseData
    }

    // Then integrate AI analysis
    return await this.integrateAIAnalysis(clientId, baseData)
  },
}

export default assessmentUtils
