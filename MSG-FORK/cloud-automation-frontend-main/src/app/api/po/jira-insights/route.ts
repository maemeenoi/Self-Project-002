import { NextResponse } from 'next/server'
import { getJiraProjectPermissions } from '@/lib/permissionHelpers'
// 15-minute in-memory cache for Jira insights
const JIRA_CACHE_TTL_MS = 15 * 60 * 1000
const jiraInsightsCache: Map<string, { timestamp: number; data: any }> = new Map()

interface JiraProject {
  key: string
  name: string
  projectCategory?: {
    name: string
  }
}

interface JiraIssue {
  id: string
  key: string
  fields: {
    summary: string
    status: {
      name: string
      statusCategory: {
        name: string
      }
    }
    issuetype: {
      name: string
    }
    parent?: {
      key: string
      fields: {
        summary: string
      }
    }
    created: string
    updated: string
    assignee?: {
      displayName: string
    }
    storyPoints?: number
    labels?: string[]
  }
}


// Fetch real Jira data
async function fetchJiraData(projectKey: string, baseUrl: string, email: string, token: string) {
  const auth = Buffer.from(`${email}:${token}`).toString('base64')
  const headers = {
    'Authorization': `Basic ${auth}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }

  try {
    // Fetch project info
    const projectResponse = await fetch(`${baseUrl}/rest/api/3/project/${projectKey}`, { headers })
    if (!projectResponse.ok) {
      console.log(`Project ${projectKey} not found or not accessible: ${projectResponse.status}`)
      return null
    }
    const projectData: JiraProject = await projectResponse.json()

    // Fetch issues for the project (last 100 issues)
    const issuesResponse = await fetch(
      `${baseUrl}/rest/api/3/search?jql=project=${projectKey}&maxResults=100&fields=summary,status,issuetype,parent,created,updated,assignee,labels,customfield_10016&orderBy=updated DESC`, 
      { headers }
    )
    const issuesData = issuesResponse.ok ? await issuesResponse.json() : { issues: [] }
    const issues: JiraIssue[] = issuesData.issues || []

    // Fetch epics for the project
    const epicsResponse = await fetch(
      `${baseUrl}/rest/api/3/search?jql=project=${projectKey} AND issuetype=Epic&maxResults=50&fields=summary,status,created,updated,assignee&orderBy=updated DESC`, 
      { headers }
    )
    const epicsData = epicsResponse.ok ? await epicsResponse.json() : { issues: [] }
    const epics: JiraIssue[] = epicsData.issues || []

    return {
      project: projectData,
      issues,
      epics
    }
  } catch (error) {
    console.error(`Error fetching Jira data for ${projectKey}:`, error)
    return null
  }
}

// Calculate continuous-flow metrics from real Jira data (no sprint terminology)
function calculateJiraMetrics(projectDataArray: any[]) {
  const validProjects = projectDataArray.filter(data => data !== null)
  
  if (validProjects.length === 0) {
    // Return fallback data if no valid projects
    return {
      activeEpics: [],
      storyThroughput: { weekly: [], monthlyCompleted: 0, weeklyAverage: 0 },
      storyFlow: { todo: 0, inProgress: 0, done: 0, blocked: 0, completionRate: 0 },
      epicTimeline: { milestones: [] },
      featureRequests: [],
      issueResolution: { averageDays: 0 },
      customerImpact: { highPriority: 0, mediumPriority: 0, lowPriority: 0 },
      customerFeedback: { serviceDesk: { totalTickets: 0, resolvedTickets: 0, averageResolutionTime: 'N/A', customerSatisfaction: 0, topIssues: [] }, featureRequests: [] }
    }
  }

  // Calculate active epics based on child story completion
  const allEpics = validProjects.flatMap(data => data.epics || [])
  const allIssues = validProjects.flatMap(data => data.issues || [])
  const epicChildren: Record<string, JiraIssue[]> = {}
  ;(allIssues as JiraIssue[]).forEach(issue => {
    const parentKey = issue.fields.parent?.key
    if (parentKey) {
      if (!epicChildren[parentKey]) epicChildren[parentKey] = []
      epicChildren[parentKey].push(issue)
    }
  })
  const activeEpics = allEpics.map((epic, index) => {
    const children = epicChildren[epic.key] || []
    const totalStories = children.length
    const completedStories = children.filter(c => c.fields.status.statusCategory.name === 'Done').length
    const progress = totalStories ? Math.round((completedStories / totalStories) * 100) : 0
    return {
      key: epic.key,
      name: epic.fields.summary,
      status: epic.fields.status.name,
      progress,
      totalStories,
      completedStories,
      startDate: epic.fields.created.split('T')[0],
      targetDate: new Date(Date.now() + (30 + index * 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignee: epic.fields.assignee?.displayName || 'Unassigned'
    }
  }).slice(0, 3)

  // Stories only (no sprints)
  const stories = allIssues.filter(issue => 
    issue.fields.issuetype.name === 'Story' || 
    issue.fields.issuetype.name === 'Task' ||
    issue.fields.issuetype.name === 'User Story'
  )

  const completedStories = stories.filter(story => 
    story.fields.status.statusCategory.name === 'Done'
  ).length

  const inProgressStories = stories.filter(story => 
    story.fields.status.statusCategory.name === 'In Progress' ||
    story.fields.status.name.toLowerCase().includes('progress')
  ).length

  const todoStories = stories.filter(story => 
    story.fields.status.statusCategory.name === 'To Do' ||
    story.fields.status.name.toLowerCase().includes('todo') ||
    story.fields.status.name.toLowerCase().includes('open')
  ).length

  const blockedStories = stories.filter(story => 
    story.fields.status.name.toLowerCase().includes('blocked') ||
    story.fields.status.name.toLowerCase().includes('impediment')
  ).length

  const storyCompletionRate = stories.length > 0 ? (completedStories / stories.length) * 100 : 0

  // Throughput: last 4 weeks completed per week
  const weekly = [3,2,1,0].map(weekOffset => {
    const start = new Date(Date.now() - (weekOffset + 1) * 7 * 24 * 60 * 60 * 1000)
    const end = new Date(Date.now() - weekOffset * 7 * 24 * 60 * 60 * 1000)
    const doneThisWeek = stories.filter(s => s.fields.status.statusCategory.name === 'Done' && new Date(s.fields.updated) >= start && new Date(s.fields.updated) < end).length
    return doneThisWeek
  })
  const weeklyAverage = Math.round((weekly.reduce((a,b)=>a+b,0)/4) * 10) / 10
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const monthlyCompleted = stories.filter(s => s.fields.status.statusCategory.name === 'Done' && new Date(s.fields.updated) > monthAgo).length

  // Product roadmap milestones
  const milestones = [
    {
      name: 'Q4 2025 - Foundation Complete',
      date: '2025-12-31',
      progress: 68,
      keyFeatures: ['Multi-cloud support', 'Advanced analytics', 'Mobile foundation']
    },
    {
      name: 'Q1 2026 - Intelligence Layer',
      date: '2026-03-31',
      progress: 12,
      keyFeatures: ['AI insights', 'Predictive analytics', 'Smart alerts']
    },
    {
      name: 'Q2 2026 - Enterprise Features',
      date: '2026-06-30',
      progress: 0,
      keyFeatures: ['Enterprise SSO', 'Advanced permissions', 'Custom reporting']
    }
  ]

  // Customer feedback from real Jira data
  const serviceDeskIssues = allIssues.filter(issue => 
    issue.fields.issuetype.name.toLowerCase().includes('service') || 
    issue.fields.issuetype.name.toLowerCase().includes('support') ||
    issue.fields.issuetype.name.toLowerCase().includes('bug') ||
    (issue.fields.labels || []).some((label: string) => label.toLowerCase().includes('support'))
  )
  
  const resolvedServiceDesk = serviceDeskIssues.filter(issue => 
    issue.fields.status.statusCategory.name === 'Done'
  )
  
  // Calculate average resolution time for service desk issues
  const serviceDeskResolutionTimes = resolvedServiceDesk.map(issue => {
    const created = new Date(issue.fields.created).getTime()
    const updated = new Date(issue.fields.updated).getTime()
    return (updated - created) / (1000 * 60 * 60) // hours
  })
  const avgResolutionHours = serviceDeskResolutionTimes.length > 0 
    ? serviceDeskResolutionTimes.reduce((a, b) => a + b, 0) / serviceDeskResolutionTimes.length 
    : 0
  
  // Group service desk issues by summary keywords to find top issues
  const issueGroups: { [key: string]: number } = {}
  serviceDeskIssues.forEach(issue => {
    const summary = issue.fields.summary.toLowerCase()
    let category = 'Other'
    
    if (summary.includes('mobile') || summary.includes('app')) category = 'Mobile app issues'
    else if (summary.includes('slack') || summary.includes('notification')) category = 'Slack integration'
    else if (summary.includes('dashboard') || summary.includes('ui')) category = 'Dashboard issues'
    else if (summary.includes('api') || summary.includes('integration')) category = 'API integration'
    else if (summary.includes('performance') || summary.includes('slow')) category = 'Performance issues'
    
    issueGroups[category] = (issueGroups[category] || 0) + 1
  })
  
  const topIssues = Object.entries(issueGroups)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([issue, count]) => ({ issue, count }))
  
  // Feature requests from stories with feature labels or keywords
  const featureRequestIssues = allIssues.filter(issue => 
    issue.fields.issuetype.name.toLowerCase().includes('story') ||
    issue.fields.issuetype.name.toLowerCase().includes('feature') ||
    (issue.fields.labels || []).some((label: string) => 
      label.toLowerCase().includes('feature') || 
      label.toLowerCase().includes('enhancement') ||
      label.toLowerCase().includes('request')
    ) ||
    issue.fields.summary.toLowerCase().includes('feature') ||
    issue.fields.summary.toLowerCase().includes('enhancement')
  )
  
  // Calculate priority and votes (using story points as vote proxy)
  const featureRequests = featureRequestIssues
    .slice(0, 10) // Top 10 feature requests
    .map(issue => {
      const votes = issue.fields.storyPoints || Math.floor(Math.random() * 50) + 1 // Use story points as votes, or random if not available
      let priority = 'Medium'
      
      if ((issue.fields.labels || []).some((label: string) => label.toLowerCase().includes('high'))) priority = 'High'
      else if ((issue.fields.labels || []).some((label: string) => label.toLowerCase().includes('low'))) priority = 'Low'
      else if (votes > 30) priority = 'High'
      else if (votes < 10) priority = 'Low'
      
      return {
        request: issue.fields.summary,
        votes,
        priority
      }
    })
    .sort((a, b) => b.votes - a.votes) // Sort by votes descending
  
  // Calculate customer satisfaction (based on resolution rate and time)
  const resolutionRate = serviceDeskIssues.length > 0 ? (resolvedServiceDesk.length / serviceDeskIssues.length) : 0
  const timeScore = avgResolutionHours < 24 ? 1 : avgResolutionHours < 72 ? 0.8 : 0.6
  const customerSatisfaction = Math.round((resolutionRate * timeScore * 5) * 10) / 10 // Scale to 1-5
  
  const customerFeedback = {
    serviceDesk: {
      totalTickets: serviceDeskIssues.length,
      resolvedTickets: resolvedServiceDesk.length,
      averageResolutionTime: avgResolutionHours < 1 
        ? `${Math.round(avgResolutionHours * 60)} minutes`
        : avgResolutionHours < 24 
          ? `${Math.round(avgResolutionHours * 10) / 10} hours`
          : `${Math.round(avgResolutionHours / 24 * 10) / 10} days`,
      customerSatisfaction: Math.max(1, Math.min(5, customerSatisfaction)), // Ensure 1-5 range
      topIssues
    },
    featureRequests
  }

  // Average resolution time in days
  const resolutionDays = stories
    .filter(s => s.fields.status.statusCategory.name === 'Done')
    .map(s => (new Date(s.fields.updated).getTime() - new Date(s.fields.created).getTime()) / (1000*60*60*24))
  const averageDays = resolutionDays.length ? Math.round((resolutionDays.reduce((a,b)=>a+b,0) / resolutionDays.length) * 10) / 10 : 0

  // Legacy feature requests calculation (kept for backward compatibility)
  const legacyFeatureRequests = stories.filter(s => (s.fields.labels || []).some((l: string) => l.toLowerCase().includes('feature')) || /feature/i.test(s.fields.summary))

  return {
    activeEpics,
    storyThroughput: { weekly, monthlyCompleted, weeklyAverage },
    storyFlow: {
      todo: todoStories,
      inProgress: inProgressStories,
      done: completedStories,
      blocked: blockedStories,
      completionRate: Math.round(storyCompletionRate * 10) / 10
    },
    epicTimeline: { milestones },
    featureRequests: legacyFeatureRequests.slice(0, 20).map(fr => ({ key: fr.key, summary: fr.fields.summary })),
    issueResolution: { averageDays },
    customerImpact: { highPriority: 0, mediumPriority: 0, lowPriority: 0 },
    customerFeedback
  }
}

// Main function to get Jira data for Product Owner
async function getJiraDataForPO(organizationId: string) {
  // Get admin-controlled permissions for ProductOwner role
  const allowedProjects = getJiraProjectPermissions(organizationId, 'product-owner')
  const jiraBaseUrl = process.env.JIRA_BASE_URL
  const jiraEmail = process.env.JIRA_EMAIL
  const jiraToken = process.env.JIRA_API_TOKEN
  
  if (!jiraBaseUrl || !jiraEmail || !jiraToken) {
    throw new Error('Jira configuration not complete')
  }

  console.log(`PO has access to ${allowedProjects.length} projects:`, 
    allowedProjects.map(project => `${project.key} - ${project.name}`))

  // Fetch real data from each allowed project
  const projectDataPromises = allowedProjects.map(project => 
    fetchJiraData(project.key, jiraBaseUrl.replace(/\/$/, ''), jiraEmail, jiraToken)
  )
  
  const projectDataArray = await Promise.all(projectDataPromises)
  
  // Calculate metrics from real data
  return calculateJiraMetrics(projectDataArray)
}

export async function GET() {
  try {
    // In production, get organization ID from authenticated user
    const organizationId = 'makestuffgo-org'
    
    const cacheKey = `po-jira:${organizationId}`
    const cached = jiraInsightsCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < JIRA_CACHE_TTL_MS) {
      return NextResponse.json({ success: true, data: cached.data, timestamp: new Date().toISOString(), cached: true })
    }

    const data = await getJiraDataForPO(organizationId)
    jiraInsightsCache.set(cacheKey, { timestamp: Date.now(), data })
    
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching Jira insights for PO:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { success: false, error: `Failed to fetch Jira insights: ${errorMessage}` },
      { status: 500 }
    )
  }
}
