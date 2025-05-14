// src/lib/aiUtils.js
import OpenAI from "openai"
import crypto from "crypto"
import { query } from "./db"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// FinOps Maturity Framework based on Hamish's document
const MATURITY_FRAMEWORK = {
  dimensions: [
    {
      id: "strategic_alignment",
      name: "Strategic Alignment",
      description: "Cloud strategy alignment with business objectives",
      questionIds: [6, 7, 8], // Cloud Strategy questions
      maturityLevels: {
        low: {
          threshold: 0.3, // <30%
          description:
            "Cloud strategy is fragmented and disconnected from business objectives",
          recommendations:
            "Immediate leadership intervention required to establish strategic direction",
        },
        medium: {
          threshold: 0.7, // 30-70%
          description:
            "Basic cloud strategy exists but lacks comprehensive business integration",
          recommendations:
            "Develop more structured governance and alignment mechanisms",
        },
        high: {
          threshold: 1.0, // >70%
          description:
            "Cloud strategy is fully integrated with business strategic objectives",
          recommendations: "Focus on continuous optimization and innovation",
        },
      },
    },
    {
      id: "cost_visibility",
      name: "Cost Visibility & Value Assessment",
      description: "Ability to track, measure, and optimize cloud spending",
      questionIds: [9, 10, 11], // Cloud Cost questions
      maturityLevels: {
        low: {
          threshold: 0.3,
          description: "Limited to no visibility into cloud spending",
          recommendations:
            "Implement basic cost tracking and tagging infrastructure",
        },
        medium: {
          threshold: 0.7,
          description:
            "Partial visibility into cloud costs with basic allocation",
          recommendations:
            "Develop comprehensive showback/chargeback mechanisms",
        },
        high: {
          threshold: 1.0,
          description: "Real-time, granular visibility into cloud spending",
          recommendations: "Advanced cost modeling and predictive optimization",
        },
      },
    },
    {
      id: "cloud_adoption",
      name: "Cloud Adoption",
      description: "Level of cloud adoption and cloud-native practices",
      questionIds: [8], // Applications hosted in cloud
      maturityLevels: {
        low: {
          threshold: 0.3,
          description:
            "Minimal cloud adoption, primarily lift-and-shift approach",
          recommendations:
            "Develop cloud migration strategy and skills development program",
        },
        medium: {
          threshold: 0.7,
          description: "Hybrid cloud environment with mixed adoption",
          recommendations:
            "Accelerate cloud-native development and standardize cloud approaches",
        },
        high: {
          threshold: 1.0,
          description:
            "Predominantly cloud-native architecture with multi-cloud strategies",
          recommendations:
            "Focus on innovation and advanced cloud capabilities",
        },
      },
    },
    {
      id: "security_posture",
      name: "Security Posture",
      description: "Cloud security practices and risk management",
      questionIds: [12, 13], // Cloud Security questions
      maturityLevels: {
        low: {
          threshold: 0.3,
          description: "Minimal cloud security controls with reactive approach",
          recommendations:
            "Immediate security assessment and policy development",
        },
        medium: {
          threshold: 0.7,
          description: "Basic security controls with emerging governance",
          recommendations:
            "Enhance security automation and comprehensive risk management",
        },
        high: {
          threshold: 1.0,
          description:
            "Comprehensive, proactive security strategy with advanced automation",
          recommendations:
            "Advanced threat detection and continuous security innovation",
        },
      },
    },
    {
      id: "operational_excellence",
      name: "Operational Excellence",
      description: "DevOps maturity and operational efficiency",
      questionIds: [15, 16, 17, 18], // Cloud DevOps questions
      maturityLevels: {
        low: {
          threshold: 0.3,
          description: "Manual, inefficient operational processes",
          recommendations: "Implement basic DevOps practices and automation",
        },
        medium: {
          threshold: 0.7,
          description: "Emerging DevOps practices with partial automation",
          recommendations: "Accelerate automation and implement SRE principles",
        },
        high: {
          threshold: 1.0,
          description: "Advanced DevOps and SRE practices with high automation",
          recommendations:
            "Focus on advanced reliability and optimization techniques",
        },
      },
    },
    {
      id: "organizational_enablement",
      name: "Organizational Enablement",
      description: "Team skills, training, and cloud capabilities",
      questionIds: [14, 19], // Cloud People questions
      maturityLevels: {
        low: {
          threshold: 0.3,
          description: "Limited cloud training and skills development",
          recommendations: "Develop comprehensive cloud skills strategy",
        },
        medium: {
          threshold: 0.7,
          description:
            "Basic cloud training programs with emerging competency center",
          recommendations:
            "Expand skills development and create internal cloud community",
        },
        high: {
          threshold: 1.0,
          description:
            "Comprehensive learning programs with mature Cloud Center of Excellence",
          recommendations:
            "Focus on advanced certifications and thought leadership",
        },
      },
    },
  ],
}

/**
 * Calculate maturity level based on FinOps framework
 * @param {number} score - Normalized score (0-1)
 * @returns {Object} Maturity level information
 */
function calculateMaturityLevel(score) {
  const percentage = score * 100

  if (percentage < 30) {
    return {
      category: "Initial/Emerging",
      description: "Foundational transformation required",
      color: "#ef4444",
      priority: "Critical",
    }
  } else if (percentage <= 70) {
    return {
      category: "Developing",
      description: "Accelerated improvement needed",
      color: "#f59e0b",
      priority: "High",
    }
  } else {
    return {
      category: "Advanced/Optimizing",
      description: "Continuous innovation and optimization",
      color: "#10b981",
      priority: "Medium",
    }
  }
}

/**
 * Analyze dimensional maturity based on FinOps framework
 * @param {Object} assessmentData - The assessment data
 * @returns {Array} Dimensional analysis with FinOps insights
 */
function analyzeDimensionalMaturity(assessmentData) {
  const responses = assessmentData.recommendations?.responses || []
  const dimensionalAnalysis = []

  MATURITY_FRAMEWORK.dimensions.forEach((dimension) => {
    // Get scores for questions in this dimension
    const dimensionScores = dimension.questionIds
      .map((questionId) => {
        const response = responses.find((r) => r.QuestionID === questionId)
        return response ? response.Score / 5 : null // Normalize to 0-1
      })
      .filter((score) => score !== null)

    if (dimensionScores.length === 0) return

    // Calculate average score
    const averageScore =
      dimensionScores.reduce((a, b) => a + b, 0) / dimensionScores.length
    const percentage = averageScore * 100

    // Determine maturity level
    let maturityLevel
    if (percentage < 30) {
      maturityLevel = dimension.maturityLevels.low
    } else if (percentage <= 70) {
      maturityLevel = dimension.maturityLevels.medium
    } else {
      maturityLevel = dimension.maturityLevels.high
    }

    const overallMaturity = calculateMaturityLevel(averageScore)

    dimensionalAnalysis.push({
      id: dimension.id,
      name: dimension.name,
      description: dimension.description,
      score: averageScore,
      percentage: Math.round(percentage),
      maturityLevel: maturityLevel.description,
      recommendations: maturityLevel.recommendations,
      priority: overallMaturity.priority,
      color: overallMaturity.color,
      category: overallMaturity.category,
    })
  })

  return dimensionalAnalysis
}

/**
 * Generate FinOps-specific executive summary
 * @param {Object} assessmentData - The assessment data
 * @returns {Promise<Object>} FinOps-focused executive summary
 */
async function generateFinOpsExecutiveSummary(assessmentData) {
  try {
    const dimensionalAnalysis = analyzeDimensionalMaturity(assessmentData)
    const overallScore =
      dimensionalAnalysis.reduce((sum, dim) => sum + dim.score, 0) /
      dimensionalAnalysis.length
    const overallMaturity = calculateMaturityLevel(overallScore)

    const prompt = `
    As a FinOps expert, create an executive summary for this cloud financial operations assessment:
    
    Organization: ${assessmentData.reportMetadata.organizationName}
    Industry: ${assessmentData.reportMetadata.industryType}
    Overall FinOps Maturity: ${Math.round(overallScore * 100)}% (${
      overallMaturity.category
    })
    
    Dimensional Analysis:
    ${dimensionalAnalysis
      .map(
        (dim) =>
          `- ${dim.name}: ${dim.percentage}% (${dim.category}) - ${dim.maturityLevel}`
      )
      .join("\n")}
    
    Focus on FinOps principles: cost optimization, value realization, and financial accountability.
    Create 4 sections:
    
    1. Overview - Current FinOps maturity state and key financial metrics
    2. Purpose - Why FinOps excellence matters for this organization
    3. Methodology - FinOps assessment approach and benchmarking
    4. Key Findings - Top 3 financial optimization opportunities
    
    Format as JSON:
    {
      "overview": "Current FinOps state in 2-3 sentences",
      "purpose": "Business value of FinOps for this organization",
      "methodology": "Assessment approach and standards used",
      "keyFindings": ["finding 1", "finding 2", "finding 3"]
    }
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a FinOps expert who specializes in cloud financial optimization. Generate JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 600,
      temperature: 0.6,
    })

    return JSON.parse(completion.choices[0].message.content)
  } catch (error) {
    console.error("Error generating FinOps executive summary:", error)
    return {
      overview:
        "FinOps maturity assessment completed to evaluate cloud financial operations.",
      purpose:
        "To identify cost optimization opportunities and establish financial governance.",
      methodology:
        "Assessment based on FinOps framework and industry best practices.",
      keyFindings: [
        "Cost visibility gaps identified",
        "Optimization opportunities discovered",
        "Governance improvements needed",
      ],
    }
  }
}

/**
 * Generate FinOps-specific recommendations
 * @param {Object} assessmentData - The assessment data
 * @returns {Promise<Array>} FinOps-focused recommendations
 */
export async function generateFinOpsRecommendations(assessmentData) {
  try {
    const dimensionalAnalysis = analyzeDimensionalMaturity(assessmentData)
    const lowestDimensions = dimensionalAnalysis
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)

    const prompt = `
    As a FinOps consultant, create specific recommendations for this organization:
    
    Industry: ${assessmentData.reportMetadata.industryType}
    Current FinOps Challenges:
    
    ${lowestDimensions
      .map(
        (dim, index) =>
          `${index + 1}. ${dim.name} (${dim.percentage}%): ${dim.maturityLevel}`
      )
      .join("\n")}
    
    Focus on:
    - Cost optimization and waste reduction
    - Financial governance and accountability
    - Value realization from cloud investments
    - FinOps culture development
    
    Generate 3 specific, actionable recommendations with:
    - Clear FinOps principles applied
    - Expected cost impact or savings
    - Implementation timeline
    - Priority based on financial impact
    
    Format as JSON array:
    [
      {
        "title": "FinOps recommendation title",
        "description": "What to implement",
        "rationale": "Why this matters for cost optimization",
        "impact": "Expected financial benefit",
        "timeline": "Implementation timeframe",
        "priority": "Critical/High/Medium based on financial impact",
        "category": "Cost Optimization/Governance/Culture"
      }
    ]
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a FinOps expert focused on cloud cost optimization and financial governance. Generate JSON responses only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    })

    let raw = completion.choices[0].message.content.trim()

    // Remove triple backtick block if it exists
    if (raw.startsWith("```json") || raw.startsWith("```")) {
      raw = raw
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim()
    }

    return JSON.parse(raw)
  } catch (error) {
    console.error("Error generating FinOps recommendations:", error)
    return [
      {
        title: "Implement Cost Tagging Strategy",
        description:
          "Establish comprehensive resource tagging for cost allocation",
        rationale:
          "Enable accurate cost tracking and accountability across teams",
        impact: "10-15% reduction in wasted spend through visibility",
        timeline: "30-60 days",
        priority: "Critical",
        category: "Cost Optimization",
      },
    ]
  }
}

/**
 * Generate FinOps implementation roadmap
 * @param {Object} assessmentData - The assessment data
 * @returns {Promise<Array>} FinOps implementation roadmap
 */
async function generateFinOpsRoadmap(assessmentData) {
  try {
    const dimensionalAnalysis = analyzeDimensionalMaturity(assessmentData)
    const criticalDimensions = dimensionalAnalysis.filter(
      (dim) => dim.priority === "Critical"
    )
    const highDimensions = dimensionalAnalysis.filter(
      (dim) => dim.priority === "High"
    )

    const prompt = `
    Create a FinOps implementation roadmap based on this maturity analysis:
    
    Critical Priority Dimensions:
    ${criticalDimensions
      .map((dim) => `- ${dim.name}: ${dim.recommendations}`)
      .join("\n")}
    
    High Priority Dimensions:
    ${highDimensions
      .map((dim) => `- ${dim.name}: ${dim.recommendations}`)
      .join("\n")}
    
    Create a phased roadmap focusing on:
    1. Foundational FinOps practices (0-30 days)
    2. Cost optimization initiatives (1-3 months)
    3. Advanced governance and automation (3-6 months)
    4. Continuous optimization culture (6-12 months)
    
    Each phase should include specific FinOps actions that will drive cost savings and financial accountability.
    
    Format as JSON array:
    [
      {
        "phase": "Immediate (0-30 days)",
        "focus": "Main FinOps theme for this phase",
        "actions": ["specific action 1", "specific action 2"]
      }
    ]
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a FinOps strategy expert creating implementation roadmaps. Generate JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    return JSON.parse(completion.choices[0].message.content)
  } catch (error) {
    console.error("Error generating FinOps roadmap:", error)
    return [
      {
        phase: "Immediate (0-30 days)",
        focus: "Foundational FinOps setup",
        actions: ["Implement basic cost tracking", "Establish FinOps team"],
      },
      {
        phase: "Short-term (1-3 months)",
        focus: "Cost optimization",
        actions: [
          "Deploy automated cost controls",
          "Create cost allocation models",
        ],
      },
      {
        phase: "Medium-term (3-6 months)",
        focus: "Advanced governance",
        actions: [
          "Implement real-time cost monitoring",
          "Develop showback/chargeback",
        ],
      },
      {
        phase: "Long-term (6-12 months)",
        focus: "Continuous optimization",
        actions: [
          "Advanced analytics and forecasting",
          "FinOps culture transformation",
        ],
      },
    ]
  }
}

// ... (rest of the caching functions remain the same)
// Copy the existing caching functions (generateAssessmentHash, getCachedInsights, saveInsights) here

/**
 * Generate a hash of assessment data for cache invalidation
 * @param {Object} assessmentData - The assessment data
 * @returns {string} MD5 hash of the assessment
 */
function generateAssessmentHash(assessmentData) {
  const hashableData = {
    overallScore: assessmentData.cloudMaturityAssessment?.overallScore,
    dimensionalScores:
      assessmentData.cloudMaturityAssessment?.dimensionalScores,
    categoryScores: assessmentData.recommendations?.categoryScores,
  }

  return crypto
    .createHash("md5")
    .update(JSON.stringify(hashableData))
    .digest("hex")
}

/**
 * Check if AI insights already exist for this assessment
 * @param {number} clientId - Client ID
 * @param {string} assessmentHash - Hash of assessment data
 * @returns {Promise<Object|null>} Existing insights or null
 */
async function getCachedInsights(clientId, assessmentHash) {
  try {
    const results = await query(
      `SELECT * FROM AIInsights 
       WHERE ClientID = ? AND AssessmentVersion = ?
       ORDER BY GeneratedAt DESC 
       LIMIT 1`,
      [clientId, assessmentHash]
    )

    if (results.length > 0) {
      const insight = results[0]
      return {
        executiveSummary: insight.ExecutiveSummary,
        keyStrengths: insight.KeyStrengths,
        improvementAreas: insight.ImprovementAreas,
        nextSteps: insight.NextSteps,
        personalizedRecommendations: insight.PersonalizedRecommendations
          ? JSON.parse(insight.PersonalizedRecommendations)
          : [],
        implementationRoadmap: insight.ImplementationRoadmap
          ? JSON.parse(insight.ImplementationRoadmap)
          : [],
        generatedAt: insight.GeneratedAt,
      }
    }

    return null
  } catch (error) {
    console.error("Error checking cached insights:", error)
    return null
  }
}

/**
 * Save AI insights to database
 * @param {number} clientId - Client ID
 * @param {string} assessmentHash - Hash of assessment data
 * @param {Object} insights - Generated insights
 * @returns {Promise<void>}
 */
async function saveInsights(clientId, assessmentHash, insights) {
  try {
    await query(
      `INSERT INTO AIInsights 
       (ClientID, AssessmentVersion, ExecutiveSummary, KeyStrengths, 
        ImprovementAreas, NextSteps, PersonalizedRecommendations, 
        ImplementationRoadmap)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        assessmentHash,
        insights.executiveSummary,
        insights.keyStrengths,
        insights.improvementAreas,
        insights.nextSteps,
        JSON.stringify(insights.personalizedRecommendations || []),
        JSON.stringify(insights.implementationRoadmap || []),
      ]
    )
    console.log("AI insights saved to database")
  } catch (error) {
    console.error("Error saving insights:", error)
  }
}

/**
 * Generate FinOps-focused insights using AI
 * @param {Object} assessmentData - The assessment data
 * @returns {Promise<Object|null>} FinOps insights
 */
export async function generateFinOpsInsights(assessmentData) {
  try {
    const dimensionalAnalysis = analyzeDimensionalMaturity(assessmentData)
    const overallScore =
      dimensionalAnalysis.reduce((sum, dim) => sum + dim.score, 0) /
      dimensionalAnalysis.length
    const overallMaturity = calculateMaturityLevel(overallScore)

    const prompt = `
    As a FinOps expert, analyze this cloud financial maturity assessment:
    
    Organization: ${assessmentData.reportMetadata.organizationName}
    Industry: ${assessmentData.reportMetadata.industryType}
    Overall FinOps Maturity: ${Math.round(overallScore * 100)}% (${
      overallMaturity.category
    })
    
    Dimensional Analysis:
    ${dimensionalAnalysis
      .map((dim) => `- ${dim.name}: ${dim.percentage}% - ${dim.maturityLevel}`)
      .join("\n")}
    
    Provide FinOps-focused insights:
    1. Executive summary (2-3 sentences) highlighting current FinOps maturity and financial optimization opportunities
    2. Top 3 financial strengths and areas of good cost management
    3. Top 3 cost optimization opportunities with highest financial impact
    4. One urgent financial action for the next 30 days to reduce costs or improve financial visibility
    
    Focus on concrete financial benefits and cost optimization opportunities.
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a FinOps expert who analyzes cloud financial maturity and provides cost optimization insights. Be specific about financial benefits and cost savings opportunities.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
    })

    const aiInsights = completion.choices[0].message.content

    return {
      executiveSummary: extractSection(aiInsights, "executive summary"),
      strengths: extractSection(aiInsights, "strengths"),
      improvementAreas: extractSection(aiInsights, "improvement"),
      nextSteps: extractSection(aiInsights, "urgent|action"),
      fullResponse: aiInsights,
      finOpsMaturity: overallMaturity,
      dimensionalAnalysis,
    }
  } catch (error) {
    console.error("Error generating FinOps insights:", error)
    return null
  }
}

/**
 * Main function to get or generate enhanced assessment data with FinOps focus
 * @param {Object} assessmentData - The original assessment data
 * @param {number} clientId - Client ID
 * @returns {Promise<Object>} Enhanced assessment data with FinOps insights
 */
export async function getFinOpsEnhancedAssessmentData(
  assessmentData,
  clientId
) {
  // Generate hash of current assessment
  const assessmentHash = generateAssessmentHash(assessmentData)

  // Check for cached insights
  console.log("Checking for cached FinOps insights...")
  const cached = await getCachedInsights(clientId, assessmentHash)

  if (cached) {
    console.log("Using cached FinOps insights")
    // Ensure metadata is passed correctly for OpenAI
    if (!assessmentData.reportMetadata) {
      console.warn("⚠️ No reportMetadata found in assessmentData")
    }
    return {
      ...assessmentData,
      aiEnhanced: true,
      finOpsEnhanced: true,
      aiInsights: cached,
      executiveSummary: {
        ...assessmentData.executiveSummary,
        subtopics: [
          {
            title: "Overview",
            content: cached.executiveSummary || "FinOps assessment completed",
          },
          {
            title: "Purpose",
            content:
              "This assessment evaluates cloud financial operations maturity",
          },
          {
            title: "Methodology",
            content: "Assessment based on FinOps framework and best practices",
          },
          { title: "Key Findings", content: cached.keyFindings || [] },
        ],
      },
      recommendations: {
        ...assessmentData.recommendations,
        keyRecommendations:
          cached.personalizedRecommendations ||
          assessmentData.recommendations?.keyRecommendations,
        implementationRoadmap:
          cached.implementationRoadmap ||
          assessmentData.recommendations?.implementationRoadmap,
      },
    }
  }

  // Generate new FinOps insights
  console.log("Generating new FinOps insights...")

  // Generate all FinOps content
  const [insights, recommendations, executiveSummary, roadmap] =
    await Promise.all([
      generateFinOpsInsights(assessmentData),
      generateFinOpsRecommendations(assessmentData),
      generateFinOpsExecutiveSummary(assessmentData),
      generateFinOpsRoadmap(assessmentData),
    ])

  // Combine all insights
  const enhancedInsights = {
    executiveSummary: insights?.executiveSummary || "",
    keyStrengths: insights?.strengths || "",
    improvementAreas: insights?.improvementAreas || "",
    nextSteps: insights?.nextSteps || "",
    personalizedRecommendations: recommendations,
    implementationRoadmap: roadmap,
    keyFindings: executiveSummary?.keyFindings || [],
    finOpsMaturity: insights?.finOpsMaturity || {},
    dimensionalAnalysis: insights?.dimensionalAnalysis || [],
  }

  // Save to database for caching
  await saveInsights(clientId, assessmentHash, enhancedInsights)

  return {
    ...assessmentData,
    aiEnhanced: true,
    finOpsEnhanced: true,
    aiInsights: enhancedInsights,
    executiveSummary: {
      sectionTitle: "Executive Summary",
      subtopics: [
        { title: "Overview", content: executiveSummary.overview },
        { title: "Purpose", content: executiveSummary.purpose },
        { title: "Methodology", content: executiveSummary.methodology },
        { title: "Key Findings", content: executiveSummary.keyFindings },
      ],
    },
    recommendations: {
      ...assessmentData.recommendations,
      keyRecommendations: recommendations,
      implementationRoadmap: roadmap,
    },
  }
}

// ... (keep the original functions for backward compatibility)
export async function generateCloudAssessmentInsights(assessmentData) {
  // Keep original function but add deprecation notice
  console.warn(
    "Using deprecated generateCloudAssessmentInsights. Please use generateFinOpsInsights instead."
  )
  return generateFinOpsInsights(assessmentData)
}

function extractSection(text, section) {
  if (!text) return ""
  const sectionRegex = new RegExp(
    `\\d\\.\\s*.*?${section}.*?:(.*?)(?=\\d\\.|$)`,
    "is"
  )
  const match = text.match(sectionRegex)
  if (match && match[1]) {
    return match[1]
      .trim()
      .split("\n")
      .filter((line) => line.trim())
      .join(" ")
  }
  return ""
}
