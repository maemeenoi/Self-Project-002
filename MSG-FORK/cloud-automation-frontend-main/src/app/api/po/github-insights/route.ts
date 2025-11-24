import { NextResponse } from "next/server"
import { getRepositoryPermissions } from "@/lib/permissionHelpers"

interface GitHubRepo {
  name: string
  full_name: string
  private: boolean
  html_url: string
  language: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  created_at: string
  updated_at: string
  pushed_at: string
}

interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
}

interface GitHubPullRequest {
  id: number
  number: number
  title: string
  state: string
  created_at: string
  merged_at: string | null
  closed_at: string | null
  labels: Array<{
    name: string
    color: string
  }>
  milestone: {
    title: string
    state: string
    due_on: string | null
  } | null
  draft: boolean
  review_comments: number
  comments: number
  commits: number
  additions: number
  deletions: number
  changed_files: number
  user: {
    login: string
    avatar_url: string
  }
}

interface GitHubIssue {
  id: number
  number: number
  title: string
  state: string
  created_at: string
  updated_at: string
  closed_at: string | null
  labels: Array<{
    name: string
    color: string
  }>
  milestone: {
    title: string
    state: string
    due_on: string | null
  } | null
  assignee: {
    login: string
    avatar_url: string
  } | null
  user: {
    login: string
    avatar_url: string
  }
  pull_request?: {
    url: string
    html_url: string
  }
}

interface GitHubRelease {
  id: number
  tag_name: string
  name: string
  published_at: string
  prerelease: boolean
}

interface GitHubWorkflowRun {
  id: number
  name: string
  status: string
  conclusion: string | null
  event: string
  created_at: string
  updated_at: string
}

// Simple in-memory cache (15 minutes)
const CACHE_TTL_MS = 15 * 60 * 1000
const insightsCache: Map<string, { timestamp: number; data: any }> = new Map()

// Fetch real GitHub data
async function fetchGitHubData(repo: string, token: string) {
  const baseUrl = "https://api.github.com"
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "makeStuffGo-Admin-Portal",
  }

  try {
    // Fetch repository info
    const repoResponse = await fetch(`${baseUrl}/repos/${repo}`, { headers })
    if (!repoResponse.ok) {
      throw new Error(`Failed to fetch repository data: ${repoResponse.status}`)
    }
    const repoData: GitHubRepo = await repoResponse.json()

    // Fetch recent commits (last 30 days)
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString()
    const commitsResponse = await fetch(
      `${baseUrl}/repos/${repo}/commits?since=${thirtyDaysAgo}&per_page=100`,
      { headers }
    )
    const commits: GitHubCommit[] = commitsResponse.ok
      ? await commitsResponse.json()
      : []

    // Fetch pull requests with detailed information
    const prsResponse = await fetch(
      `${baseUrl}/repos/${repo}/pulls?state=all&per_page=50&sort=updated&direction=desc&state=all`,
      { headers }
    )
    const pullRequests: GitHubPullRequest[] = prsResponse.ok
      ? await prsResponse.json()
      : []

    // Fetch issues (including feature requests, bugs, etc.)
    const issuesResponse = await fetch(
      `${baseUrl}/repos/${repo}/issues?state=all&per_page=50&sort=updated&direction=desc`,
      { headers }
    )
    const issues: GitHubIssue[] = issuesResponse.ok
      ? await issuesResponse.json()
      : []

    // Fetch releases
    const releasesResponse = await fetch(
      `${baseUrl}/repos/${repo}/releases?per_page=10`,
      { headers }
    )
    const releases: GitHubRelease[] = releasesResponse.ok
      ? await releasesResponse.json()
      : []

    // Fetch GitHub Actions workflow runs (last 100)
    const runsResponse = await fetch(
      `${baseUrl}/repos/${repo}/actions/runs?per_page=100`,
      { headers }
    )
    const runsData = runsResponse.ok
      ? await runsResponse.json()
      : { workflow_runs: [] }
    const workflowRuns: GitHubWorkflowRun[] = runsData.workflow_runs || []

    return {
      repository: repoData,
      commits,
      pullRequests,
      issues,
      releases,
      workflowRuns,
    }
  } catch (error) {
    console.error(`Error fetching GitHub data for ${repo}:`, error)
    return null
  }
}

// Calculate PO-focused metrics from real GitHub data
function calculateGitHubMetrics(repoDataArray: any[]) {
  const validRepos = repoDataArray.filter((data) => data !== null)

  if (validRepos.length === 0) {
    // Return fallback data if no valid repos
    return {
      repositoryHealth: {
        totalRepos: 0,
        healthyRepos: 0,
        warningRepos: 0,
        criticalRepos: 0,
      },
      featureDelivery: {
        featuresInProgress: 0,
        featuresCompleted: 0,
        featuresPlanned: 0,
        deliveryTimeline: [],
        featureCompletionRate: 0,
      },
      featureVelocity: {
        averageFeaturesPerWeek: 0,
        lastFourWeeks: [],
        trend: "stable",
      },
      releaseReadiness: {
        readyForRelease: 0,
        inTesting: 0,
        blocked: 0,
        releasePipeline: [],
      },
      teamProductivity: {
        activeContributors: 0,
        averagePRSize: 0,
        reviewEfficiency: 0,
        codeQualityScore: 0,
      },
      releases: {
        totalReleases: 0,
        successfulReleases: 0,
        deploymentSuccessRate: 0,
        averageReleaseFrequency: "N/A",
        upcomingReleases: [],
      },
    }
  }

  // Get all data across repositories
  const allPRs = validRepos.flatMap((data) => data.pullRequests || [])
  const allIssues = validRepos.flatMap((data) => data.issues || [])
  const allReleases = validRepos.flatMap((data) => data.releases || [])
  const allCommits = validRepos.flatMap((data) => data.commits || [])
  const allWorkflowRuns: GitHubWorkflowRun[] = validRepos.flatMap(
    (data) => data.workflowRuns || []
  )

  // Repository health calculation
  const totalRepos = validRepos.length
  const healthyRepos = validRepos.filter((data) => {
    const repo = data.repository
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSinceUpdate < 7 && repo.open_issues_count < 20
  }).length

  const warningRepos = validRepos.filter((data) => {
    const repo = data.repository
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    return (
      (daysSinceUpdate >= 7 && daysSinceUpdate < 30) ||
      (repo.open_issues_count >= 20 && repo.open_issues_count < 50)
    )
  }).length

  const criticalRepos = totalRepos - healthyRepos - warningRepos

  // Feature-focused PR analysis
  const featurePRs = allPRs.filter(
    (pr) =>
      pr.labels?.some((label: { name: string; color: string }) =>
        ["feature", "enhancement", "new-feature"].includes(
          label.name.toLowerCase()
        )
      ) ||
      pr.title.toLowerCase().includes("feat") ||
      pr.title.toLowerCase().includes("feature")
  )

  const featuresInProgress = featurePRs.filter(
    (pr) => pr.state === "open" && !pr.draft
  ).length
  const featuresCompleted = featurePRs.filter((pr) => pr.merged_at).length
  const featuresPlanned = allIssues.filter(
    (issue) =>
      issue.labels?.some((label: { name: string; color: string }) =>
        ["feature", "enhancement", "story"].includes(label.name.toLowerCase())
      ) && issue.state === "open"
  ).length

  const featureCompletionRate =
    featuresPlanned > 0
      ? (featuresCompleted / (featuresCompleted + featuresPlanned)) * 100
      : 0

  // Closed issues as features delivered (labels feature/enhancement)
  const closedFeatureIssues = allIssues.filter(
    (issue) =>
      issue.state.toLowerCase() === "closed" &&
      issue.labels?.some((l: { name: string; color: string }) =>
        ["feature", "enhancement", "new-feature"].includes(l.name.toLowerCase())
      )
  )

  // Story points from labels (e.g., points:3, story points:5)
  const storyPoints = closedFeatureIssues.reduce((sum, issue) => {
    const pointsLabel = issue.labels?.find(
      (l: { name: string; color: string }) =>
        /^(points|story points)\s*:\s*\d+/i.test(l.name)
    )
    if (pointsLabel) {
      const match = pointsLabel.name.match(/(\d+)/)
      if (match) return sum + Number(match[1])
    }
    const alt = issue.labels?.find((l: { name: string; color: string }) =>
      /\b(p\d+)\b/i.test(l.name)
    )
    if (alt) {
      const m = alt.name.match(/p(\d+)/i)
      if (m) return sum + Number(m[1])
    }
    return sum
  }, 0)

  // Feature velocity analysis (weekly basis instead of sprints)
  const lastFourWeeks = [3, 2, 1, 0].map((weekOffset) => {
    const weekStart = new Date(
      Date.now() - (weekOffset + 1) * 7 * 24 * 60 * 60 * 1000
    )
    const weekEnd = new Date(Date.now() - weekOffset * 7 * 24 * 60 * 60 * 1000)

    const weekFeatures = featurePRs.filter((pr) => {
      const prDate = new Date(pr.created_at)
      return prDate >= weekStart && prDate < weekEnd
    })

    return weekFeatures.filter((pr) => pr.merged_at).length
  })

  const averageFeaturesPerWeek =
    lastFourWeeks.reduce((sum, count) => sum + count, 0) / 4
  const velocityTrend =
    lastFourWeeks[3] > lastFourWeeks[0]
      ? "increasing"
      : lastFourWeeks[3] < lastFourWeeks[0]
      ? "decreasing"
      : "stable"

  // Release readiness analysis
  const readyForRelease = allPRs.filter(
    (pr) =>
      pr.state === "open" &&
      pr.labels?.some((label: { name: string; color: string }) =>
        ["ready-for-release", "release"].includes(label.name.toLowerCase())
      )
  ).length

  const inTesting = allPRs.filter(
    (pr) =>
      pr.state === "open" &&
      pr.labels?.some((label: { name: string; color: string }) =>
        ["testing", "qa"].includes(label.name.toLowerCase())
      )
  ).length

  const blocked = allPRs.filter(
    (pr) =>
      pr.state === "open" &&
      pr.labels?.some((label: { name: string; color: string }) =>
        ["blocked", "needs-review"].includes(label.name.toLowerCase())
      )
  ).length

  // Team productivity metrics
  const activeContributors = new Set(allPRs.map((pr) => pr.user?.login)).size
  const averagePRSize =
    allPRs.length > 0
      ? allPRs.reduce((sum, pr) => sum + (pr.additions + pr.deletions), 0) /
        allPRs.length
      : 0

  const reviewEfficiency =
    allPRs.length > 0
      ? allPRs.reduce((sum, pr) => sum + pr.review_comments, 0) / allPRs.length
      : 0

  // Code quality score based on PR metrics
  const codeQualityScore =
    allPRs.length > 0
      ? Math.min(
          100,
          Math.max(
            0,
            reviewEfficiency * 20 + // Review comments indicate thoroughness
              (allPRs.filter((pr) => pr.commits > 0).length / allPRs.length) *
                30 + // Commits indicate activity
              (allPRs.filter((pr) => pr.changed_files < 20).length /
                allPRs.length) *
                30 + // Smaller PRs are better
              (allPRs.filter((pr) => pr.merged_at).length / allPRs.length) * 20 // Merge rate
          )
        )
      : 0

  // Feature delivery timeline (last 4 weeks)
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]
  const deliveryTimeline = weeks.map((week, index) => {
    const weekStart = new Date(
      Date.now() - (4 - index) * 7 * 24 * 60 * 60 * 1000
    )
    const weekEnd = new Date(Date.now() - (3 - index) * 7 * 24 * 60 * 60 * 1000)

    const weekFeatures = featurePRs.filter((pr) => {
      const prDate = new Date(pr.created_at)
      return prDate >= weekStart && prDate < weekEnd
    })

    const deliveredThisWeek = weekFeatures.filter((pr) => pr.merged_at).length
    const plannedThisWeek = weekFeatures.length

    return {
      week,
      planned: plannedThisWeek,
      delivered: deliveredThisWeek,
    }
  })

  // Release metrics
  const recentReleases = allReleases.filter((release) => {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return new Date(release.published_at) > monthAgo
  })

  // Derive deployment/build success from Actions workflow runs (last 30 days)
  const monthAgoISO = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString()
  const recentRuns = allWorkflowRuns.filter(
    (run) => run.created_at >= monthAgoISO
  )
  const deployRuns = recentRuns.filter(
    (run) => /deploy/i.test(run.name) || /deploy/i.test(run.event)
  )
  const buildRuns = recentRuns.filter(
    (run) => /build|ci/i.test(run.name) || /push|pull_request/i.test(run.event)
  )

  const calcSuccess = (runs: GitHubWorkflowRun[]) => {
    if (runs.length === 0) return 100
    const success = runs.filter((r) => r.conclusion === "success").length
    return (success / runs.length) * 100
  }

  const deploymentSuccessRate = Math.round(calcSuccess(deployRuns) * 10) / 10
  const buildSuccessRate = Math.round(calcSuccess(buildRuns) * 10) / 10

  // Continuous Delivery specific metrics
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const featuresShippedThisMonth = closedFeatureIssues.filter(
    (issue) => issue.closed_at && new Date(issue.closed_at) > monthAgo
  ).length
  const releasesThisMonth = recentReleases.length
  const releaseCadencePerMonth = releasesThisMonth
  const dailyCommitFrequency = Math.round((allCommits.length / 30) * 10) / 10

  // Development flow from open issues
  const openIssues = allIssues.filter((i) => i.state.toLowerCase() === "open")
  const hasLabel = (issue: any, names: string[]) =>
    issue.labels?.some((l: any) => names.includes(l.name.toLowerCase()))
  const flowInProgress = openIssues.filter((i) =>
    hasLabel(i, ["in progress", "progress", "doing"])
  ).length
  const flowReview = openIssues.filter((i) =>
    hasLabel(i, ["review", "code review", "needs-review"])
  ).length
  const flowReadyToDeploy = openIssues.filter((i) =>
    hasLabel(i, [
      "ready-to-deploy",
      "ready for release",
      "ready-for-release",
      "release",
    ])
  ).length

  // Upcoming releases based on milestones
  const upcomingReleases = allIssues
    .filter(
      (issue) =>
        issue.milestone?.state === "open" &&
        issue.milestone?.due_on &&
        new Date(issue.milestone.due_on) > new Date()
    )
    .slice(0, 3)
    .map((issue) => ({
      name: issue.milestone?.title || "Unnamed Release",
      date: issue.milestone?.due_on?.split("T")[0] || "TBD",
      features: allPRs.filter(
        (pr) => pr.milestone?.title === issue.milestone?.title
      ).length,
      status: "planning",
    }))

  return {
    repositoryHealth: {
      totalRepos,
      healthyRepos,
      warningRepos,
      criticalRepos,
    },
    featureDelivery: {
      featuresInProgress,
      featuresCompleted,
      featuresPlanned,
      deliveryTimeline,
      featureCompletionRate: Math.round(featureCompletionRate * 10) / 10,
      // additional fields helpful to PO
      featuresDelivered: closedFeatureIssues.length,
      storyPoints,
    },
    featureVelocity: {
      averageFeaturesPerWeek: Math.round(averageFeaturesPerWeek * 10) / 10,
      lastFourWeeks,
      trend: velocityTrend,
    },
    releaseReadiness: {
      readyForRelease,
      inTesting,
      blocked,
      releasePipeline: [
        { stage: "Development", count: featuresInProgress },
        { stage: "Testing", count: inTesting },
        { stage: "Ready", count: readyForRelease },
        { stage: "Blocked", count: blocked },
      ],
    },
    teamProductivity: {
      activeContributors,
      averagePRSize: Math.round(averagePRSize),
      reviewEfficiency: Math.round(reviewEfficiency * 10) / 10,
      codeQualityScore: Math.round(codeQualityScore),
    },
    releases: {
      totalReleases: allReleases.length,
      successfulReleases: allReleases.filter((r) => !r.prerelease).length,
      deploymentSuccessRate: Math.round(deploymentSuccessRate * 10) / 10,
      averageReleaseFrequency: `${Math.round(
        30 / (recentReleases.length || 1)
      )} days`,
      upcomingReleases,
      buildSuccessRate,
    },
    continuousDelivery: {
      featuresShippedThisMonth,
      weeklyDeliveryRate: Math.round(averageFeaturesPerWeek * 10) / 10,
      pipelineHealth: buildSuccessRate,
      releaseCadencePerMonth,
      teamActivity: {
        activeContributors,
        dailyCommitFrequency,
      },
      developmentFlow: {
        inProgress: flowInProgress,
        review: flowReview,
        readyToDeploy: flowReadyToDeploy,
      },
    },
  }
}

// Main function to get GitHub data for Product Owner
async function getGitHubDataForPO(organizationId: string) {
  // Get admin-controlled permissions for ProductOwner role
  const allowedRepos = getRepositoryPermissions(organizationId, "product-owner")
  const githubToken = process.env.GITHUB_TOKEN

  if (!githubToken) {
    throw new Error("GitHub token not configured")
  }

  console.log(
    `PO has access to ${allowedRepos.length} repositories:`,
    allowedRepos.map((repo) => `${repo.owner}/${repo.name}`)
  )

  // Fetch real data from each allowed repository
  const repoDataPromises = allowedRepos.map((repo) =>
    fetchGitHubData(`${repo.owner}/${repo.name}`, githubToken)
  )

  const repoDataArray = await Promise.all(repoDataPromises)

  // Calculate metrics from real data
  return calculateGitHubMetrics(repoDataArray)
}

export async function GET() {
  try {
    // In production, get organization ID from authenticated user
    const organizationId = "makestuffgo-org"

    const cacheKey = `po:${organizationId}`
    const cached = insightsCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        timestamp: new Date().toISOString(),
        cached: true,
      })
    }

    const data = await getGitHubDataForPO(organizationId)
    insightsCache.set(cacheKey, { timestamp: Date.now(), data })

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching GitHub insights for PO:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch GitHub insights: ${errorMessage}`,
      },
      { status: 500 }
    )
  }
}
