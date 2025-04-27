// src/lib/assessmentUtils.js

/**
 * Processes database responses into maturity assessment data
 * @param {Array} responses - Array of response objects from the database
 * @param {Array} industryStandards - Array of industry standard objects
 * @returns {Object} Processed assessment data
 */
export function processAssessmentData(responses, industryStandards) {
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
  const enrichedResponses = responses.map((r) => {
    const key = `${r.QuestionID}_${r.Score}`
    return {
      ...r,
      StandardText: standardMap[key] || "No standard available",
      QuestionText: questionMap[r.QuestionID] || `Question ${r.QuestionID}`,
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
    overallScore,
    enrichedResponses
  )
}

// Maturity levels data for reference
const MATURITY_LEVELS = [
  {
    level: -1,
    threshold: 0,
    name: "Level -1: Regressive",
    description: "Process unrepeatable, poorly controlled and reactive",
  },
  {
    level: 0,
    threshold: 2,
    name: "Level 0: Repeatable",
    description: "Process documented and partly automated",
  },
  {
    level: 1,
    threshold: 3,
    name: "Level 1: Consistent",
    description:
      "Automated processes applied across whole application lifecycle",
  },
  {
    level: 2,
    threshold: 4,
    name: "Level 2: Quantitatively managed",
    description: "Process measured and controlled",
  },
  {
    level: 3,
    threshold: 4.5,
    name: "Level 3: Optimizing",
    description: "Focus on process improvements",
  },
]

/**
 * Determines maturity level for Cloud Strategy
 * @param {number} score - Average score for Cloud Strategy
 * @returns {object} - Maturity level information
 */
function determineStrategyMaturityLevel(score) {
  if (!score)
    return {
      level: 1,
      name: "Level 1: Initial",
      description: "Ad hoc cloud usage without a defined strategy",
    }
  if (score < 2)
    return {
      level: 1,
      name: "Level 1: Initial",
      description: "Ad hoc cloud usage without a defined strategy",
    }
  if (score < 3)
    return {
      level: 2,
      name: "Level 2: Repeatable",
      description: "Basic cloud strategy aligned with some business objectives",
    }
  if (score < 4)
    return {
      level: 3,
      name: "Level 3: Defined",
      description:
        "Formalized cloud strategy integrated with business planning",
    }
  if (score < 4.6)
    return {
      level: 4,
      name: "Level 4: Managed",
      description: "Cloud strategy is regularly reviewed and optimized",
    }
  return {
    level: 5,
    name: "Level 5: Optimized",
    description:
      "Continuous improvement with proactive alignment to evolving business goals",
  }
}

/**
 * Determines maturity level for Cloud Cost Management
 * @param {number} score - Average score for Cloud Cost
 * @returns {object} - Maturity level information
 */
function determineCostMaturityLevel(score) {
  if (!score)
    return {
      level: 1,
      name: "Crawl",
      description: "Limited cost visibility and control",
    }
  if (score < 2.5)
    return {
      level: 1,
      name: "Crawl",
      description: "Basic cost visibility with initial tagging and reporting",
    }
  if (score < 4)
    return {
      level: 2,
      name: "Walk",
      description: "Improved cost allocation and budgeting processes",
    }
  return {
    level: 3,
    name: "Run",
    description:
      "Advanced forecasting, real-time cost monitoring, and strategic business alignment",
  }
}

/**
 * Determines maturity level for Cloud Security
 * @param {number} score - Average score for Cloud Security
 * @returns {object} - Maturity level information
 */
function determineSecurityMaturityLevel(score) {
  if (!score)
    return {
      level: 1,
      name: "Level 1: Initial",
      description: "Basic security measures with limited automation",
    }
  if (score < 2)
    return {
      level: 1,
      name: "Level 1: Initial",
      description: "Basic security measures with limited automation",
    }
  if (score < 3)
    return {
      level: 2,
      name: "Level 2: Managed",
      description: "Improved visibility and some automated security processes",
    }
  if (score < 4)
    return {
      level: 3,
      name: "Level 3: Defined",
      description: "Comprehensive security policies and procedures in place",
    }
  if (score < 4.6)
    return {
      level: 4,
      name: "Level 4: Quantitatively Managed",
      description: "Security performance is measured and managed",
    }
  return {
    level: 5,
    name: "Level 5: Optimized",
    description: "Continuous improvement with adaptive security measures",
  }
}

/**
 * Determines maturity level for Cloud People
 * @param {number} score - Average score for Cloud People
 * @returns {object} - Maturity level information
 */
function determinePeopleMaturityLevel(score) {
  if (!score)
    return {
      level: 1,
      name: "Level 1: Initial",
      description: "Limited cloud expertise with ad hoc training",
    }
  if (score < 2)
    return {
      level: 1,
      name: "Level 1: Initial",
      description: "Limited cloud expertise with ad hoc training",
    }
  if (score < 3)
    return {
      level: 2,
      name: "Level 2: Repeatable",
      description: "Basic training programs established",
    }
  if (score < 4)
    return {
      level: 3,
      name: "Level 3: Defined",
      description: "Structured training and development plans in place",
    }
  if (score < 4.6)
    return {
      level: 4,
      name: "Level 4: Managed",
      description: "Regular assessment and improvement of cloud skills",
    }
  return {
    level: 5,
    name: "Level 5: Optimized",
    description: "Continuous learning culture with advanced skill development",
  }
}

/**
 * Determines maturity level for Cloud DevOps
 * @param {number} score - Average score for Cloud DevOps
 * @returns {object} - Maturity level information
 */
function determineDevOpsMaturityLevel(score) {
  if (!score)
    return {
      level: 1,
      name: "Level 1: Initial",
      description: "Manual processes with minimal collaboration",
    }
  if (score < 2)
    return {
      level: 1,
      name: "Level 1: Initial",
      description: "Manual processes with minimal collaboration",
    }
  if (score < 3)
    return {
      level: 2,
      name: "Level 2: Managed",
      description: "Basic automation and improved team collaboration",
    }
  if (score < 4)
    return {
      level: 3,
      name: "Level 3: Defined",
      description: "Standardized processes with integrated tools",
    }
  if (score < 4.6)
    return {
      level: 4,
      name: "Level 4: Quantitatively Managed",
      description:
        "Metrics-driven improvements and proactive incident management",
    }
  return {
    level: 5,
    name: "Level 5: Optimized",
    description:
      "Fully automated pipelines with continuous delivery and feedback loops",
  }
}

/**
 * Determines overall maturity level
 * @param {number} score - Overall maturity score
 * @returns {string} - Overall maturity level name
 */
function determineOverallMaturityLevel(score) {
  if (score < 2) return "Level 1: Initial"
  if (score < 3) return "Level 2: Repeatable"
  if (score < 4) return "Level 3: Defined"
  if (score < 4.6) return "Level 4: Managed"
  return "Level 5: Optimized"
}

/**
 * Formats assessment data for report components
 * @param {object} clientInfo - Client information
 * @param {object} categoryScores - Scores by category
 * @param {object} maturityLevels - Maturity levels by category
 * @param {number} overallScore - Overall maturity score
 * @param {array} enrichedResponses - Enriched responses with standards text
 * @returns {object} - Formatted report data
 */

function formatReportData(
  clientInfo,
  categoryScores,
  maturityLevels,
  overallScore,
  enrichedResponses
) {
  // Create radar chart data for maturity dimensions
  const dimensionalScores = Object.entries(categoryScores).map(
    ([dimension, data]) => ({
      dimension,
      score: data.score,
      fullMark: 5,
    })
  )

  // Practice areas for maturity table
  const practiceAreas = [
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

  // Generate necessary sections
  const recommendations = generateRecommendations(
    categoryScores,
    maturityLevels
  )
  const shortTermFocus = generateShortTermFocus(categoryScores)
  const longTermObjectives = generateLongTermObjectives(categoryScores)
  const summaryFindings = generateSummaryFindings(categoryScores)

  return {
    reportMetadata: {
      organizationName: clientInfo.business,
      clientName: clientInfo.name,
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
          content: `This report presents an overview of ${clientInfo.business}'s cloud infrastructure maturity.`,
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
          title: "Key Focuses",
          content: [
            "Cloud cost optimization",
            "Infrastructure as Code (IaC) practices",
            "Automation and DevOps improvements",
            "Governance and operational excellence",
          ],
        },
        {
          title: "Summary of Findings",
          content: summaryFindings,
        },
        {
          title: "Key Recommendations",
          content: recommendations.slice(0, 4).map((rec) => rec.title),
        },
      ],
    },
    cloudMaturityAssessment: {
      sectionTitle: "Cloud Maturity Assessment",
      overallScore: overallScore,
      currentLevel: determineOverallMaturityLevel(overallScore),
      maturityLevels: MATURITY_LEVELS,
      dimensionalScores: dimensionalScores,
      subtopics: [
        {
          title: "Understanding Cloud Maturity",
          content:
            "Cloud maturity measures the effectiveness and optimization of cloud adoption and practices.",
        },
        {
          title: "Current Cloud Maturity Level",
          content: `With an overall score of ${overallScore.toFixed(
            1
          )}/5.0, your organization is at ${determineOverallMaturityLevel(
            overallScore
          )}. ${interpretMaturityLevel(overallScore)}`,
        },
        {
          title: "Dimensional Analysis",
          content:
            "This radar chart highlights strengths and improvement areas across cloud domains.",
          dimensionalScores: dimensionalScores,
        },
        {
          title: "Growth Trajectory & Recommendations",
          content: "Focus areas and goals to accelerate cloud maturity.",
          shortTermFocus: shortTermFocus,
          longTermObjectives: longTermObjectives,
        },
      ],
      practiceAreas: practiceAreas,
      description:
        "This maturity assessment shows your current position and target state across key DevOps and cloud practices.",
    },
    recommendations: {
      sectionTitle: "Recommendations & Action Plan",
      keyRecommendations: recommendations,
      implementationRoadmap: [
        {
          phase: "Immediate (0-30 days)",
          actions: [
            "Implement automated instance scheduling",
            "Standardize resource tagging",
          ],
        },
        {
          phase: "Short-term (1-3 months)",
          actions: [
            "Right-size oversized instances",
            "Implement S3 lifecycle policies",
          ],
        },
        {
          phase: "Medium-term (3-6 months)",
          actions: [
            "Expand Infrastructure as Code (IaC) practices",
            "Introduce cost anomaly detection",
          ],
        },
        {
          phase: "Long-term (6-12 months)",
          actions: [
            "Adopt FinOps best practices",
            "Enhance container orchestration strategies",
          ],
        },
      ],
      nextSteps: [
        "Schedule a planning session with MakeStuffGo team",
        "Assign internal stakeholders to each recommendation area",
        "Track progress with bi-weekly reviews",
      ],
      categoryScores,
      responses: enrichedResponses,
    },
  }
}

/**
 * Helper function to determine practice level based on category score
 * @param {object} categoryScores - Scores by category
 * @param {string} category - Category name
 * @returns {number} - Practice level
 */
function determinePracticeLevel(categoryScores, category) {
  const score = categoryScores[category]?.score || 3

  if (score < 2) return -1 // Level -1: Regressive
  if (score < 3) return 0 // Level 0: Repeatable
  if (score < 4) return 1 // Level 1: Consistent
  if (score < 4.6) return 2 // Level 2: Quantitatively managed
  return 3 // Level 3: Optimizing
}

/**
 * Interpret maturity level description
 * @param {number} score - Maturity score
 * @returns {string} - Interpretation
 */
function interpretMaturityLevel(score) {
  if (score < 2)
    return "significant room for improvement in your cloud practices"
  if (score < 3)
    return "established cloud practices with opportunities for automation and standardization"
  if (score < 4)
    return "good cloud practices with opportunities for optimization and measurement"
  return "advanced cloud practices with opportunities for continuous improvement"
}

/**
 * Generate short-term focus areas based on lowest scores
 * @param {object} categoryScores - Scores by category
 * @returns {array} - Short-term focus areas
 */
function generateShortTermFocus(categoryScores) {
  const focusAreas = []
  const sortedCategories = Object.entries(categoryScores)
    .sort((a, b) => a[1].score - b[1].score)
    .slice(0, 3)

  sortedCategories.forEach(([category, data]) => {
    if (category === "Cloud Strategy") {
      focusAreas.push("Develop comprehensive cloud governance framework")
    } else if (category === "Cloud Cost") {
      focusAreas.push("Implement automated cost monitoring and reporting")
    } else if (category === "Cloud Security") {
      focusAreas.push("Enhance security controls and compliance monitoring")
    } else if (category === "Cloud DevOps") {
      focusAreas.push("Automate deployment and testing processes")
    } else if (category === "Cloud People") {
      focusAreas.push("Implement cloud skills development program")
    }
  })

  return focusAreas
}

/**
 * Generate long-term objectives
 * @param {object} categoryScores - Scores by category
 * @returns {array} - Long-term objectives
 */
function generateLongTermObjectives(categoryScores) {
  return [
    "Establish a mature FinOps practice with proactive optimization",
    "Achieve 90%+ infrastructure-as-code coverage",
    "Implement advanced multi-cloud strategy with automated workload balancing",
    "Develop AI-driven cloud optimization capabilities",
  ]
}

/**
 * Generate summary findings based on scores
 * @param {object} categoryScores - Scores by category
 * @returns {array} - Summary findings
 */
function generateSummaryFindings(categoryScores) {
  const findings = []

  if ((categoryScores["Cloud Cost"]?.score || 0) < 3.5) {
    findings.push(
      "Cloud cost management practices need improvement with potential for 25-35% cost reduction"
    )
  }

  if ((categoryScores["Cloud DevOps"]?.score || 0) < 3.5) {
    findings.push(
      "DevOps automation maturity is below industry average, impacting deployment efficiency"
    )
  }

  if ((categoryScores["Cloud Security"]?.score || 0) < 4) {
    findings.push(
      "Security controls require enhancement to meet industry best practices"
    )
  }

  if ((categoryScores["Cloud Strategy"]?.score || 0) < 3.5) {
    findings.push(
      "Cloud governance framework needs standardization across the organization"
    )
  }

  // Add at least one positive finding
  const bestCategory = Object.entries(categoryScores).sort(
    (a, b) => b[1].score - a[1].score
  )[0]

  if (bestCategory && bestCategory[1].score >= 3.5) {
    findings.push(
      `Strong performance in ${
        bestCategory[0]
      } with a score of ${bestCategory[1].score.toFixed(1)}/5.0`
    )
  } else {
    findings.push(
      "Multiple opportunities identified to enhance cloud maturity across all dimensions"
    )
  }

  return findings
}

/**
 * Generate prioritized recommendations
 * @param {object} categoryScores - Scores by category
 * @param {object} maturityLevels - Maturity levels by category
 * @returns {array} - Recommendations
 */
function generateRecommendations(categoryScores, maturityLevels) {
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

    recommendations.push({
      title: "Implement Cost Anomaly Detection",
      rationale: "Unexpected cost spikes are not being detected promptly.",
      impact: "Early detection of cost issues",
      priority: "Medium",
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

  // Cloud Security recommendations
  if ((categoryScores["Cloud Security"]?.score || 0) < 4) {
    recommendations.push({
      title: "Enhance IAM Controls and Monitoring",
      rationale:
        "Current identity management practices don't follow principle of least privilege.",
      impact: "Reduced security risk exposure",
      priority:
        (categoryScores["Cloud Security"]?.score || 0) < 3
          ? "Critical"
          : "Medium",
    })
  }

  // Add storage recommendations
  recommendations.push({
    title: "Implement S3 Lifecycle Policies",
    rationale:
      "Large volumes of infrequently accessed data are stored on premium storage tiers.",
    impact: "25-30% reduction in storage costs",
    priority: "Medium",
  })

  return recommendations
}

export default {
  processAssessmentData,
}
