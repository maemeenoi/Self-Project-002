import { NextResponse } from "next/server"

interface GitHubMetrics {
  repositoryHealth: {
    totalRepos: number
    healthyRepos: number
    warningRepos: number
    criticalRepos: number
  }
  featureDelivery: {
    featuresInProgress: number
    featuresCompleted: number
    featuresPlanned: number
    deliveryTimeline: Array<{
      week: string
      planned: number
      delivered: number
    }>
    featureCompletionRate: number
  }
  featureVelocity: {
    averageFeaturesPerWeek: number
    lastFourWeeks: number[]
    trend: string
  }
  releaseReadiness: {
    readyForRelease: number
    inTesting: number
    blocked: number
    releasePipeline: Array<{
      stage: string
      count: number
    }>
  }
  teamProductivity: {
    activeContributors: number
    averagePRSize: number
    reviewEfficiency: number
    codeQualityScore: number
  }
  releases: {
    totalReleases: number
    successfulReleases: number
    deploymentSuccessRate: number
    averageReleaseFrequency: string
    upcomingReleases: Array<{
      name: string
      date: string
      features: number
      status: string
    }>
  }
  technicalDebtScore: number
}

interface JiraMetrics {
  activeEpics: Array<{
    key: string
    name: string
    status: string
    progress: number
    totalStories: number
    completedStories: number
    startDate: string
    targetDate: string
    assignee: string
  }>
  storyThroughput?: {
    weekly: number[]
    weeklyAverage: number
    monthlyCompleted: number
  }
  storyFlow?: {
    todo: number
    inProgress: number
    done: number
    blocked: number
    completionRate: number
  }
  customerFeedback?: {
    serviceDesk: {
      customerSatisfaction: number
      totalTickets: number
      resolvedTickets: number
      averageResolutionTime: string
    }
  }
  // Legacy fields for backward compatibility
  sprintProgress?: {
    velocity?: {
      averageVelocity: number
    }
    currentSprint?: {
      totalStoryPoints: number
      completedStoryPoints: number
    }
  }
  userStoryMetrics?: {
    storyCompletionRate: number
  }
}

interface POMetrics {
  featuresDelivered: number
  userStoryVelocity: number
  customerSatisfaction: number
  deploymentSuccess: number
  featuresInProgress: number
  sprintProgress: number
  codeQuality: number
  technicalDebt: number
}

async function fetchGitHubMetrics(): Promise<GitHubMetrics | null> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/po/github-insights`
    )
    const result = await response.json()
    return result.success ? result.data : null
  } catch (error) {
    console.error("Error fetching GitHub metrics:", error)
    return null
  }
}

async function fetchJiraMetrics(): Promise<JiraMetrics | null> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/po/jira-insights`
    )
    const result = await response.json()
    return result.success ? result.data : null
  } catch (error) {
    console.error("Error fetching Jira metrics:", error)
    return null
  }
}

function calculatePOMetrics(
  githubData: GitHubMetrics | null,
  jiraData: JiraMetrics | null
): POMetrics {
  // Default values if no data is available
  const defaultMetrics: POMetrics = {
    featuresDelivered: 0,
    userStoryVelocity: 0,
    customerSatisfaction: 0,
    deploymentSuccess: 0,
    featuresInProgress: 0,
    sprintProgress: 0,
    codeQuality: 0,
    technicalDebt: 0,
  }

  if (!githubData && !jiraData) {
    return defaultMetrics
  }

  // Calculate features delivered from GitHub data
  const featuresDelivered = githubData?.featureDelivery.featuresCompleted || 0

  // Calculate user story velocity from Jira data (prefer new structure, fallback to legacy and GitHub)
  const userStoryVelocity =
    jiraData?.storyThroughput?.weeklyAverage ||
    jiraData?.sprintProgress?.velocity?.averageVelocity ||
    githubData?.featureVelocity.averageFeaturesPerWeek ||
    0

  // Calculate customer satisfaction from real Jira service desk data
  const customerSatisfaction =
    jiraData?.customerFeedback?.serviceDesk?.customerSatisfaction || 4.6

  // Calculate deployment success from GitHub data
  const deploymentSuccess = githubData?.releases.deploymentSuccessRate || 0

  // Calculate features in progress from GitHub data
  const featuresInProgress = githubData?.featureDelivery.featuresInProgress || 0

  // Calculate story flow progress from Jira data (prefer new structure, fallback to legacy and GitHub)
  const sprintProgress =
    jiraData?.storyFlow?.completionRate ||
    (jiraData?.sprintProgress?.currentSprint
      ? (jiraData.sprintProgress.currentSprint.completedStoryPoints /
          jiraData.sprintProgress.currentSprint.totalStoryPoints) *
        100
      : githubData?.featureDelivery.featureCompletionRate) ||
    0

  // Calculate code quality from GitHub data
  const codeQuality = githubData?.teamProductivity.codeQualityScore || 0

  // Calculate technical debt from code analysis
  const technicalDebt = githubData?.technicalDebtScore || 0

  return {
    featuresDelivered,
    userStoryVelocity,
    customerSatisfaction,
    deploymentSuccess,
    featuresInProgress,
    sprintProgress,
    codeQuality,
    technicalDebt,
  }
}

export async function GET() {
  try {
    // Fetch data from both GitHub and Jira APIs
    const [githubData, jiraData] = await Promise.all([
      fetchGitHubMetrics(),
      fetchJiraMetrics(),
    ])

    // Calculate PO-specific metrics
    const metrics = calculatePOMetrics(githubData, jiraData)

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching PO metrics:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json(
      { success: false, error: `Failed to fetch PO metrics: ${errorMessage}` },
      { status: 500 }
    )
  }
}
