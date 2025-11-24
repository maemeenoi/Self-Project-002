// CEO Dashboard API Service

import {
  ExecutiveKPI,
  CostBreakdownItem,
  CostTrendItem,
  OptimizationProgressItem,
  SavingsSummary,
  CEODashboardData,
} from "@/types/ceoDashboard"

class CEODashboardApiService {
  private baseURL: string
  private companyId!: number

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_NEXT_PUBLIC_BACKEND_URL ||
      "https://app-makestuffgo-test-001-backend.azurewebsites.net"
  }

  /**
   * Get authentication headers with JWT token
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Get auth token from localStorage (matching unifiedApi pattern)
    const token = localStorage.getItem("auth_token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Generic fetch method with authentication
   */
  private async fetchWithAuth<T>(
    endpoint: string,
    params?: URLSearchParams
  ): Promise<T> {
    const url = params
      ? `${this.baseURL}${endpoint}?${params.toString()}`
      : `${this.baseURL}${endpoint}`

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`
      )
    }

    return await response.json()
  }

  /**
   * Fetch available cloud providers
   */
  async fetchAvailableProviders(): Promise<
    Array<{
      name: string
      display_name: string
      cost: number
      percentage: number
    }>
  > {
    try {
      const response = await fetch(
        `${this.baseURL}/api/widgets/financial/providers?company_id=${this.companyId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
          signal: AbortSignal.timeout(10000),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch providers: ${response.status} ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching providers:", error)
      throw error
    }
  }

  /**
   * Fetch Executive KPI Summary (Widget 1 - PRIORITY)
   */
  async fetchExecutiveKPI(provider?: string): Promise<ExecutiveKPI> {
    try {
      const url =
        provider && provider !== "all"
          ? `${this.baseURL}/api/widgets/combined/executive-kpi?company_id=${this.companyId}&provider=${provider}`
          : `${this.baseURL}/api/widgets/combined/executive-kpi?company_id=${this.companyId}`

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to fetch executive KPI: ${response.status} ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching executive KPI:", error)
      throw error
    }
  }

  /**
   * Fetch Cost Breakdown (Widget 2 - Reuse from CFO)
   */
  async fetchCostBreakdown(provider?: string): Promise<CostBreakdownItem[]> {
    try {
      const url =
        provider && provider !== "all"
          ? `${this.baseURL}/api/widgets/financial/cost-breakdown?company_id=${this.companyId}&group_by=ServiceName&provider=${provider}`
          : `${this.baseURL}/api/widgets/financial/cost-breakdown?company_id=${this.companyId}&group_by=ServiceName`

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to fetch cost breakdown: ${response.status} ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching cost breakdown:", error)
      throw error
    }
  }

  /**
   * Fetch Cost Trend (Widget 3 - Reuse from CFO)
   */
  async fetchCostTrend(provider?: string): Promise<CostTrendItem[]> {
    try {
      const url =
        provider && provider !== "all"
          ? `${this.baseURL}/api/widgets/financial/cost-trend?company_id=${this.companyId}&provider=${provider}`
          : `${this.baseURL}/api/widgets/financial/cost-trend?company_id=${this.companyId}`

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to fetch cost trend: ${response.status} ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching cost trend:", error)
      throw error
    }
  }

  /**
   * Fetch Optimization Progress (Widget 4 - Reuse from CFO)
   */
  async fetchOptimizationProgress(
    provider?: string
  ): Promise<OptimizationProgressItem[]> {
    try {
      const url =
        provider && provider !== "all"
          ? `${this.baseURL}/api/widgets/combined/optimization-progress?company_id=${this.companyId}&provider=${provider}`
          : `${this.baseURL}/api/widgets/combined/optimization-progress?company_id=${this.companyId}`

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to fetch optimisation progress: ${response.status} ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching optimisation progress:", error)
      throw error
    }
  }

  /**
   * Fetch Savings Summary (Widget 5 - Reuse from CFO)
   */
  async fetchSavingsSummary(provider?: string): Promise<SavingsSummary> {
    try {
      const url =
        provider && provider !== "all"
          ? `${this.baseURL}/api/widgets/financial/savings-summary?company_id=${this.companyId}&provider=${provider}`
          : `${this.baseURL}/api/widgets/financial/savings-summary?company_id=${this.companyId}`

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to fetch savings summary: ${response.status} ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching savings summary:", error)
      throw error
    }
  }

  /**
   * Fetch all dashboard data in parallel (using real data from backend)
   */
  async fetchAllDashboardData(provider?: string): Promise<CEODashboardData> {
    try {
      const [
        executiveKPI,
        costBreakdown,
        costTrend,
        optimizationProgress,
        savingsSummary,
      ] = await Promise.all([
        this.fetchExecutiveKPI(provider),
        this.fetchCostBreakdown(provider),
        this.fetchCostTrend(provider),
        this.fetchOptimizationProgress(provider),
        this.fetchSavingsSummary(provider),
      ])

      return {
        executiveKPI,
        costBreakdown,
        costTrend,
        optimizationProgress,
        savingsSummary,
      }
    } catch (error) {
      console.error("Error fetching CEO dashboard data:", error)
      throw error
    }
  }
}

// Export singleton instance
export const ceoDashboardApi = new CEODashboardApiService()
