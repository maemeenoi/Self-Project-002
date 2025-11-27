// Product Owner Dashboard API Service - Real Data Only

import { ProductOwnerDashboardData } from "@/types/productOwnerDashboard"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
  // "https://app-makestuffgo-test-001-backend.azurewebsites.net"

class ProductOwnerDashboardApiService {
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
   * Fetch Cost Breakdown (Widget 1 - Reuse from CFO)
   */
  async fetchCostBreakdown(provider?: string) {
    try {
      const url =
        provider && provider !== "all"
          ? `${API_BASE_URL}/api/widgets/financial/cost-breakdown?group_by=ServiceName&provider=${provider}`
          : `${API_BASE_URL}/api/widgets/financial/cost-breakdown?group_by=ServiceName`

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        console.error(
          `Failed to fetch cost breakdown: ${response.status} ${response.statusText}`
        )
        return []
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching cost breakdown:", error)
      return []
    }
  }

  /**
   * Fetch Cost Trend (Widget 2 - Reuse from CFO)
   */
  async fetchCostTrend(provider?: string) {
    try {
      const url =
        provider && provider !== "all"
          ? `${API_BASE_URL}/api/widgets/financial/cost-trend?provider=${provider}`
          : `${API_BASE_URL}/api/widgets/financial/cost-trend`

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        console.error(
          `Failed to fetch cost trend: ${response.status} ${response.statusText}`
        )
        return []
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching cost trend:", error)
      return []
    }
  }

  /**
   * Fetch Savings Summary (Widget 3 - Reuse from CFO)
   */
  async fetchSavingsSummary(provider?: string) {
    try {
      const url =
        provider && provider !== "all"
          ? `${API_BASE_URL}/api/widgets/financial/savings-summary?provider=${provider}`
          : `${API_BASE_URL}/api/widgets/financial/savings-summary`

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        console.error(
          `Failed to fetch savings summary: ${response.status} ${response.statusText}`
        )
        return {
          total_list_cost: 0,
          total_effective_cost: 0,
          total_savings: 0,
          savings_percent: 0,
        }
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching savings summary:", error)
      return {
        total_list_cost: 0,
        total_effective_cost: 0,
        total_savings: 0,
        savings_percent: 0,
      }
    }
  }

  /**
   * Fetch Team Performance (Widget 5)
   */
  async fetchTeamPerformance() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/widgets/workflow/team-performance`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        console.error(
          `Failed to fetch team performance: ${response.status} ${response.statusText}`
        )
        return []
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching team performance:", error)
      return []
    }
  }

  /**
   * Fetch System Health (Widget 6)
   */
  async fetchSystemHealth() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/widgets/workflow/system-health`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        console.error(
          `Failed to fetch system health: ${response.status} ${response.statusText}`
        )
        return []
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching system health:", error)
      return []
    }
  }

  /**
   * Fetch Deployment Metrics (Widget 7)
   */
  async fetchDeploymentMetrics() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/widgets/workflow/deployment-metrics`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        console.error(
          `Failed to fetch deployment metrics: ${response.status} ${response.statusText}`
        )
        return []
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching deployment metrics:", error)
      return []
    }
  }

  /**
   * Fetch Available Providers
   */
  async fetchAvailableProviders() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/widgets/financial/providers`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      )

      if (!response.ok) {
        console.error(
          `Failed to fetch available providers: ${response.status} ${response.statusText}`
        )
        return []
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching available providers:", error)
      return []
    }
  }

  /**
   * Fetch all dashboard data in parallel
   */
  async fetchAllDashboardData(
    provider?: string
  ): Promise<ProductOwnerDashboardData> {
    try {
      const [
        costBreakdown,
        costTrend,
        savingsSummary,
        teamPerformance,
        systemHealth,
        deploymentMetrics,
        availableProviders,
      ] = await Promise.all([
        this.fetchCostBreakdown(provider),
        this.fetchCostTrend(provider),
        this.fetchSavingsSummary(provider),
        this.fetchTeamPerformance(),
        this.fetchSystemHealth(),
        this.fetchDeploymentMetrics(),
        this.fetchAvailableProviders(),
      ])

      return {
        costBreakdown,
        costTrend,
        savingsSummary,
        teamPerformance,
        systemHealth,
        deploymentMetrics,
        availableProviders,
      }
    } catch (error) {
      console.error("Error fetching Product Owner dashboard data:", error)
      throw error
    }
  }
}

// Export singleton instance
export const productOwnerDashboardApi = new ProductOwnerDashboardApiService()
