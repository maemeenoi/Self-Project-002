/**
 * API service for CTO Dashboard
 * Fetches real workflow and deployment data from backend
 */

export interface RecentActivity {
  provider: string
  item_type: string
  title: string
  status: string
  author: string
  created_at: string
  project_or_repo: string
}

export interface DeploymentMetric {
  provider: string
  deployments_count: number
  success_rate: number
  avg_lead_time_hours: number
  avg_cycle_time_hours: number
}

export interface SystemMetrics {
  uptime_percentage: number
  avg_response_time_ms: number
  error_rate_percentage: number
  deployments_today: number
}

class CTOApiService {
  private baseURL: string

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:8000"
  }

  /**
   * Get authentication headers with JWT token
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    const token = localStorage.getItem("auth_token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Get recent workflow activity
   */
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/widgets/workflow/recent-activity?limit=${limit}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch recent activity: ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching recent activity:", error)
      return []
    }
  }

  /**
   * Get deployment metrics by provider
   */
  async getDeploymentMetrics(): Promise<DeploymentMetric[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/widgets/workflow/deployment-metrics`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch deployment metrics: ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching deployment metrics:", error)
      return []
    }
  }

  /**
   * Get AI recommendations and forecast data
   */
  async getAIRecommendations(
    provider: string = "aws",
    days: number = 30
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/cto/forecast`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ provider, days }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching AI recommendations:", error)
      throw error
    }
  }

  /**
   * Calculate system metrics from deployment data
   */
  calculateSystemMetrics(
    deploymentMetrics: DeploymentMetric[],
    recentActivity: RecentActivity[]
  ): SystemMetrics {
    // Calculate overall success rate (uptime proxy)
    const totalDeployments = deploymentMetrics.reduce(
      (sum, metric) => sum + metric.deployments_count,
      0
    )
    const weightedSuccessRate = deploymentMetrics.reduce(
      (sum, metric) => sum + metric.success_rate * metric.deployments_count,
      0
    )
    const overallSuccessRate =
      totalDeployments > 0 ? weightedSuccessRate / totalDeployments : 100

    // Calculate average response time from lead times (convert hours to ms)
    const avgLeadTimeHours =
      deploymentMetrics.reduce(
        (sum, metric) => sum + metric.avg_lead_time_hours,
        0
      ) / (deploymentMetrics.length || 1)
    const avgResponseTimeMs = Math.min(avgLeadTimeHours * 60 * 1000, 2000) // Cap at 2 seconds

    // Calculate error rate (inverse of success rate)
    const errorRate = Math.max(0, 100 - overallSuccessRate)

    // Count deployments today
    const today = new Date().toISOString().split("T")[0]
    const deploymentsToday = recentActivity.filter(
      (activity) =>
        activity.created_at.startsWith(today) &&
        activity.item_type.toLowerCase().includes("deploy")
    ).length

    return {
      uptime_percentage: Math.round(overallSuccessRate * 100) / 100,
      avg_response_time_ms: Math.round(avgResponseTimeMs),
      error_rate_percentage: Math.round(errorRate * 100) / 100,
      deployments_today: deploymentsToday,
    }
  }

  /**
   * Calculate team performance metrics from deployment data
   */
  calculateTeamMetrics(deploymentMetrics: DeploymentMetric[]) {
    return deploymentMetrics.map((metric) => ({
      team: metric.provider,
      velocity: Math.min(100, metric.success_rate),
      completed_tasks: metric.deployments_count,
      avg_cycle_time: metric.avg_cycle_time_hours,
      quality_score: this.getQualityGrade(metric.success_rate),
    }))
  }

  /**
   * Get quality grade based on success rate
   */
  private getQualityGrade(successRate: number): string {
    if (successRate >= 95) return "A+"
    if (successRate >= 90) return "A"
    if (successRate >= 85) return "B+"
    if (successRate >= 80) return "B"
    if (successRate >= 75) return "C+"
    return "C"
  }

  /**
   * Calculate technical debt from deployment metrics
   */
  calculateTechnicalDebt(deploymentMetrics: DeploymentMetric[]): number {
    // Use cycle time as proxy for technical debt
    const avgCycleTime =
      deploymentMetrics.reduce(
        (sum, metric) => sum + metric.avg_cycle_time_hours,
        0
      ) / (deploymentMetrics.length || 1)

    // Convert to debt hours (higher cycle time = more debt)
    return Math.round(avgCycleTime * 2)
  }
}

const ctoApi = new CTOApiService()
export default ctoApi
