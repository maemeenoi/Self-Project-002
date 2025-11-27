/**
 * API client for Engineer Dashboard widgets
 * Calls the work_processor backend for GitHub and Jira data
 */

// Interfaces for work_processor API
export interface JiraStats {
  total_issues: number
  projects: Record<string, number>
  statuses: Record<string, number>
  last_updated: string
}

export interface JiraIssue {
  id: number
  key: string
  summary: string
  description: string
  status: string
  priority: string
  assignee: string
  reporter: string
  project_key: string
  project_name: string
  issue_type: string
  created_date: string
  updated_date: string
  labels: string[]
  components: string[]
}

export interface JiraIssuesResponse {
  total: number
  limit: number
  offset: number
  issues: JiraIssue[]
}

export interface GitHubIntegrationStatus {
  configured: boolean
  message?: string
}

export interface JiraIntegrationStatus {
  configured: boolean
  message?: string
}

export interface GitHubStats {
  total_repositories: number
  total_issues: number
  total_pull_requests: number
  organization: string
  last_updated: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string
  language: string
  stars: number
  forks: number
  open_issues: number
  recent_commits: number
  updated_at: string
  created_at: string
  private: boolean
}

export interface GitHubRepositoriesResponse {
  total: number
  limit: number
  repositories: GitHubRepository[]
}

export interface GitHubActivity {
  id: string
  type: string
  title: string
  repository: string
  author: string
  created_at: string
  status?: string
  url?: string
}

export interface GitHubActivityResponse {
  total: number
  limit: number
  activities: GitHubActivity[]
}

export interface EngineerAIForecastRequest {
  days?: number
  provider?: string
}

export interface EngineerAIForecastResponse {
  daily_costs: {
    dates: string[]
    costs: number[]
  }
  forecast_and_recommendations: {
    forecast: {
      dates: string[]
      costs: number[]
      monthly_projection?: number
      confidence_level?: number
    }
    recommendations: Recommendation[]
  }
  provider_used?: string
}

export interface Recommendation {
  title: string
  description: string
  priority: string
  action: string
  type: string
  source: string
  category: string
}

export interface TerraformGenerationRequest {
  recommendation: Recommendation
  cost_summary: {
    total_cost: number
    avg_cost: number
  }
}

export interface TerraformGenerationResponse {
  success: boolean
  terraform_files: Record<string, string>
  download_url?: string
  error?: string
  fallback_used?: boolean
  message?: string
}

class EngineerDashboardApiService {
  private baseURL: string
  private workProcessorURL: string

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      // "https://app-makestuffgo-test-001-backend.azurewebsites.net"
    this.workProcessorURL =
      process.env.NEXT_PUBLIC_WORK_PROCESSOR_URL || "http://localhost:8001"
  }

  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  /**
   * Check if GitHub integration is configured for the company
   */
  async checkGitHubIntegration(): Promise<GitHubIntegrationStatus> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/engineer/integrations/github/status`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      if (!response.ok) {
        throw new Error(
          `Failed to check GitHub integration: ${response.statusText}`
        )
      }
      return await response.json()
    } catch (error) {
      console.error("Error checking GitHub integration:", error)
      return { configured: false, message: "Error checking GitHub integration" }
    }
  }

  /**
   * Check if Jira integration is configured and has data
   */
  async checkJiraIntegration(): Promise<JiraIntegrationStatus> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/engineer/integrations/jira/status`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      if (!response.ok) {
        throw new Error(
          `Failed to check Jira integration: ${response.statusText}`
        )
      }
      return await response.json()
    } catch (error) {
      console.error("Error checking Jira integration:", error)
      return {
        configured: false,
        message:
          "Jira integration not configured. Contact your admin to set up Jira credentials.",
      }
    }
  }

  /**
   * Fetch Jira statistics from unified backend
   */
  async fetchJiraStats(): Promise<JiraStats> {
    try {
      const response = await fetch(`${this.baseURL}/api/engineer/jira/stats`, {
        headers: this.getAuthHeaders(),
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch Jira stats: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching Jira stats:", error)
      throw error
    }
  }

  /**
   * Fetch Jira issues from unified backend
   */
  async fetchJiraIssues(
    limit: number = 50,
    offset: number = 0
  ): Promise<JiraIssuesResponse> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/engineer/jira/issues?limit=${limit}&offset=${offset}`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch Jira issues: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching Jira issues:", error)
      throw error
    }
  }

  /**
   * Fetch GitHub statistics from unified backend
   */
  async fetchGitHubStats(): Promise<GitHubStats> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/engineer/github/stats`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch GitHub stats: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching GitHub stats:", error)
      throw error
    }
  }

  /**
   * Fetch GitHub repositories from unified backend
   */
  async fetchGitHubRepositories(
    limit: number = 10
  ): Promise<GitHubRepositoriesResponse> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/engineer/github/repositories?limit=${limit}`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      if (!response.ok) {
        throw new Error(
          `Failed to fetch GitHub repositories: ${response.statusText}`
        )
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching GitHub repositories:", error)
      throw error
    }
  }

  /**
   * Fetch recent GitHub activity from unified backend
   */
  async fetchGitHubActivity(
    limit: number = 20
  ): Promise<GitHubActivityResponse> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/engineer/github/recent-activity?limit=${limit}`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      if (!response.ok) {
        throw new Error(
          `Failed to fetch GitHub activity: ${response.statusText}`
        )
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching GitHub activity:", error)
      throw error
    }
  }

  /**
   * Fetch AI-powered forecast + recommendations for the engineer AI tab
   */
  async fetchEngineerAIForecast(
    payload: EngineerAIForecastRequest
  ): Promise<EngineerAIForecastResponse> {
    const response = await fetch(`${this.baseURL}/api/engineer/ai/forecast`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorBody = await response
        .json()
        .catch(() => ({ error: "Unknown error" }))
      throw new Error(errorBody.error || errorBody.detail || "API error")
    }

    return response.json()
  }

  /**
   * Trigger Terraform generation for an engineer AI recommendation
   */
  async generateEngineerTerraform(
    payload: TerraformGenerationRequest
  ): Promise<TerraformGenerationResponse> {
    const response = await fetch(
      `${this.baseURL}/api/engineer/ai/generate_terraform`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      const errorBody = await response
        .json()
        .catch(() => ({ error: "Unknown error" }))
      throw new Error(errorBody.error || "Failed to generate Terraform")
    }

    return response.json()
  }

  /**
   * Download the generated Terraform ZIP for the engineer AI tab
   */
  async downloadEngineerTerraform(downloadUrl: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}${downloadUrl}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to download Terraform ZIP")
    }

    return response.blob()
  }
}

// Export singleton instance
export const engineerDashboardApi = new EngineerDashboardApiService()
export default engineerDashboardApi
