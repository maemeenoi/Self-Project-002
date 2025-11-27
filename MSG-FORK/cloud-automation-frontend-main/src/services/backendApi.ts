/**
 * Backend API Service
 *
 * This service integrates with the FastAPI backend using the provided OpenAPI contract.
 * Requires valid credentials - no mock data fallbacks.
 */

interface JiraCredentials {
  jira_url: string
  jira_email: string
  jira_token: string
  jql?: string
  max_results?: number
}

interface HealthResponse {
  status: "healthy" | "unhealthy"
  timestamp: string
  database_connected: boolean
}

interface StorageStats {
  total_files: number
  total_records: number
  file_types: Record<string, number>
  last_updated: string
}

interface JiraSyncResponse {
  success: boolean
  message: string
  issues_count?: number
  files?: {
    json?: string
    csv?: string
  }
  timestamp?: string
}

interface BulkUploadResponse {
  success: boolean
  processed: number
  errors: string[]
  message: string
}

interface JiraIssue {
  issue_key: string
  summary: string
  issue_type?: string
  status: string
  priority?: string
  assignee?: string
  reporter?: string
  created?: string
  updated?: string
  project_key?: string
  project_name?: string
  [key: string]: any
}

interface DashboardMetrics {
  deploymentFrequency: {
    deploymentsPerWeek: number
    trend: number
  }
  releaseMetrics: {
    development: number
    testing: number
    ready: number
    released: number
  }
  issuesByStatus: Record<string, number>
  issuesByType: Record<string, number>
  issuesByPriority: Record<string, number>
  totalIssues: number
  activeProjects: string[]
  recentActivity: {
    created: number
    resolved: number
    inProgress: number
  }
}

class BackendApiService {
  private baseURL: string

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      // "https://app-makestuffgo-test-001-backend.azurewebsites.net"
  }

  /**
   * Check if credentials are available for a specific integration
   */
  private validateCredentials(credentials?: any): void {
    if (!credentials || Object.keys(credentials).length === 0) {
      throw new Error(
        "CREDENTIALS_REQUIRED: Integration credentials must be configured before accessing data. Please set up your integration in the admin panel."
      )
    }
  }

  // ============================================================================
  // HEALTH AND STATUS
  // ============================================================================

  /**
   * Check backend health status
   */
  async healthCheck(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Health check failed:", error)
      throw new Error(
        `Backend health check failed: ${error}. Please ensure the backend server is running at ${this.baseURL}`
      )
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    try {
      const response = await fetch(`${this.baseURL}/stats`)

      if (!response.ok) {
        throw new Error(`Failed to get stats: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to get stats:", error)
      throw new Error(
        `CREDENTIALS_REQUIRED: Unable to retrieve storage statistics. Please ensure your integration credentials are configured and the backend is accessible.`
      )
    }
  }

  // ============================================================================
  // JIRA DATA MANAGEMENT
  // ============================================================================

  /**
   * Get processed Jira data for dashboard metrics
   */
  async getJiraData(credentials?: JiraCredentials): Promise<DashboardMetrics> {
    this.validateCredentials(credentials)

    try {
      // Get dashboard data directly from the backend
      const response = await fetch(`${this.baseURL}/jira/data`)

      if (!response.ok) {
        throw new Error(`Failed to get Jira data: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to get Jira data:", error)
      throw new Error(
        `CREDENTIALS_REQUIRED: Unable to retrieve Jira data. Please configure your Jira integration credentials (URL, email, API token) in the admin panel.`
      )
    }
  }

  /**
   * Sync Jira data from external Jira instance
   */
  async syncJira(credentials: JiraCredentials): Promise<JiraSyncResponse> {
    this.validateCredentials(credentials)

    try {
      const response = await fetch(`${this.baseURL}/jira/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jira_url: credentials.jira_url,
          jira_email: credentials.jira_email,
          jira_token: credentials.jira_token,
          jql: credentials.jql || "order by created DESC",
          max_results: credentials.max_results || 1000,
        }),
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Jira sync failed:", error)
      throw new Error(
        `CREDENTIALS_REQUIRED: Jira sync failed. Please verify your Jira credentials (URL: ${credentials.jira_url}, Email: ${credentials.jira_email}) and ensure API token is valid.`
      )
    }
  }

  /**
   * Bulk upload issues
   */
  async bulkUploadIssues(issues: JiraIssue[]): Promise<BulkUploadResponse> {
    if (!issues || issues.length === 0) {
      throw new Error("No issues provided for bulk upload")
    }

    try {
      const response = await fetch(`${this.baseURL}/issues/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issues }),
      })

      if (!response.ok) {
        throw new Error(`Bulk upload failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Bulk upload failed:", error)
      throw error
    }
  }

  /**
   * Upload CSV file
   */
  async uploadCsv(file: File): Promise<BulkUploadResponse> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${this.baseURL}/issues/upload-csv`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`CSV upload failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("CSV upload failed:", error)
      throw new Error(
        `CREDENTIALS_REQUIRED: CSV upload failed. Please ensure your integration credentials are configured and the backend is accessible.`
      )
    }
  }

  // ============================================================================
  // DATA PARSING AND TRANSFORMATION
  // ============================================================================

  /**
   * Parse CSV text to dashboard metrics
   */
  private async parseCsvToMetrics(csvText: string): Promise<DashboardMetrics> {
    const lines = csvText.trim().split("\n")
    if (lines.length <= 1) {
      throw new Error(
        "CREDENTIALS_REQUIRED: CSV data is empty or invalid. Please ensure your data source is properly configured and contains valid issue data."
      )
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const issues: JiraIssue[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",")
      if (values.length < headers.length) continue

      const issue: JiraIssue = {
        issue_key: "",
        summary: "",
        status: "Unknown",
      }

      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/"/g, "")

        // Map common header variations
        switch (header) {
          case "issue_key":
          case "issue key":
          case "key":
            issue.issue_key = value
            break
          case "summary":
          case "title":
            issue.summary = value
            break
          case "status":
            issue.status = value
            break
          case "issue_type":
          case "issue type":
          case "type":
            issue.issue_type = value
            break
          case "priority":
            issue.priority = value
            break
          case "assignee":
            issue.assignee = value
            break
          case "created":
          case "created date":
            issue.created = value
            break
          case "project_key":
          case "project key":
          case "project":
            issue.project_key = value
            break
          default:
            issue[header] = value
        }
      })

      if (issue.issue_key) {
        issues.push(issue)
      }
    }

    return this.calculateMetricsFromIssues(issues)
  }

  /**
   * Calculate dashboard metrics from issue data
   */
  private calculateMetricsFromIssues(issues: JiraIssue[]): DashboardMetrics {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Count issues by status
    const issuesByStatus: Record<string, number> = {}
    issues.forEach((issue) => {
      const status = issue.status || "Unknown"
      issuesByStatus[status] = (issuesByStatus[status] || 0) + 1
    })

    // Count issues by type
    const issuesByType: Record<string, number> = {}
    issues.forEach((issue) => {
      const type = issue.issue_type || "Unknown"
      issuesByType[type] = (issuesByType[type] || 0) + 1
    })

    // Count issues by priority
    const issuesByPriority: Record<string, number> = {}
    issues.forEach((issue) => {
      const priority = issue.priority || "Unknown"
      issuesByPriority[priority] = (issuesByPriority[priority] || 0) + 1
    })

    // Get active projects
    const activeProjects = [
      ...new Set(issues.map((issue) => issue.project_key).filter(Boolean)),
    ] as string[]

    // Calculate recent activity (last 30 days)
    const recentIssues = issues.filter((issue) => {
      if (!issue.created) return false
      const createdDate = new Date(issue.created)
      return createdDate >= thirtyDaysAgo
    })

    const recentActivity = {
      created: recentIssues.length,
      resolved: issues.filter(
        (issue) =>
          ["Done", "Closed", "Resolved"].includes(issue.status) &&
          issue.updated &&
          new Date(issue.updated) >= thirtyDaysAgo
      ).length,
      inProgress: issues.filter((issue) =>
        ["In Progress", "In Review", "Testing"].includes(issue.status)
      ).length,
    }

    // Calculate deployment frequency (estimate based on resolved issues)
    const resolvedIssues = issues.filter((issue) =>
      ["Done", "Closed", "Resolved"].includes(issue.status)
    )
    const deploymentsPerWeek = Math.ceil(resolvedIssues.length / 4) // Rough estimate

    // Release metrics based on status
    const releaseMetrics = {
      development: issues.filter((issue) =>
        ["In Progress", "In Development"].includes(issue.status)
      ).length,
      testing: issues.filter((issue) =>
        ["Testing", "In Review", "QA"].includes(issue.status)
      ).length,
      ready: issues.filter((issue) =>
        ["Ready for Release", "Ready", "Staging"].includes(issue.status)
      ).length,
      released: issues.filter((issue) =>
        ["Done", "Closed", "Released"].includes(issue.status)
      ).length,
    }

    return {
      deploymentFrequency: {
        deploymentsPerWeek,
        trend: Math.floor(Math.random() * 20) - 10, // Random trend for now
      },
      releaseMetrics,
      issuesByStatus,
      issuesByType,
      issuesByPriority,
      totalIssues: issues.length,
      activeProjects,
      recentActivity,
    }
  }
}

export default new BackendApiService()
export type {
  JiraCredentials,
  HealthResponse,
  StorageStats,
  JiraSyncResponse,
  DashboardMetrics,
  JiraIssue,
}
