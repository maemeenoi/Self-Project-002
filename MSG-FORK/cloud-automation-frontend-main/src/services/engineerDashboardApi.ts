/**
 * API client for Engineer Dashboard widgets
 * Calls the existing backend endpoints from widgetsService.py
 */

import { DeploymentMetric, ActivityItem } from "@/types/engineerDashboard"

class EngineerDashboardApiService {
  private baseURL: string

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_NEXT_PUBLIC_BACKEND_URL ||
      "https://app-makestuffgo-test-001-backend.azurewebsites.net"
  }

  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  /**
   * Fetch deployment metrics data
   * GET /api/widgets/workflow/deployment-metrics
   */
  async fetchDeploymentMetrics(): Promise<DeploymentMetric[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/widgets/workflow/deployment-metrics`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch deployment metrics: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching deployment metrics:", error)
      throw new Error(
        "CREDENTIALS_REQUIRED: Unable to fetch deployment metrics. Please configure your GitHub integration credentials."
      )
    }
  }

  /**
   * Fetch recent activity stream data
   * GET /api/widgets/workflow/recent-activity?limit=10
   */
  async fetchActivityStream(limit: number = 10): Promise<ActivityItem[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/widgets/workflow/recent-activity?limit=${limit}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch activity stream: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching activity stream:", error)
      throw new Error(
        "CREDENTIALS_REQUIRED: Unable to fetch activity stream. Please configure your Jira and GitHub integration credentials."
      )
    }
  }

  /**
   * Fetch both widgets data in parallel
   */
  async fetchDashboardData(): Promise<{
    deploymentMetrics: DeploymentMetric[]
    activityStream: ActivityItem[]
  }> {
    try {
      const [deploymentMetrics, activityStream] = await Promise.all([
        this.fetchDeploymentMetrics(),
        this.fetchActivityStream(),
      ])

      return {
        deploymentMetrics,
        activityStream,
      }
    } catch (error) {
      console.error("Error fetching engineer dashboard data:", error)
      throw new Error(
        "CREDENTIALS_REQUIRED: Unable to fetch dashboard data. Please configure your GitHub and Jira integration credentials."
      )
    }
  }
}

export default new EngineerDashboardApiService()
