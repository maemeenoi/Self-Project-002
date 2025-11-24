/**
 * API service for CFO Dashboard widgets
 * Calls the existing backend endpoints from widgetsService.py
 */

import {
  CostBreakdownItem,
  CostTrendItem,
  SavingsSummary,
  FinancialAlert,
  VendorCost,
  ResourceAllocation,
  ExecutiveKPI,
  OptimizationProgress,
  GroupByType,
  CFODashboardData,
} from "@/types/cfoDashboard"

class CFODashboardApiService {
  private baseURL: string
  private companyId: number

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://app-makestuffgo-test-001-backend.azurewebsites.net"
    // Initialize companyId from localStorage
    this.companyId = this.getCompanyId()
  }

  /**
   * Get company ID from localStorage or return default
   */
  private getCompanyId(): number {
    // Check if we're in the browser environment
    if (typeof window === "undefined") {
      return 1 // Default value for SSR
    }

    const storedCompanyId = localStorage.getItem("company_id")
    return storedCompanyId ? parseInt(storedCompanyId, 10) : 1
  }

  /**
   * Set company ID and store in localStorage
   */
  setCompanyId(companyId: number): void {
    this.companyId = companyId

    // Only access localStorage in browser environment
    if (typeof window !== "undefined") {
      localStorage.setItem("company_id", companyId.toString())
    }
  }

  /**
   * Get authentication headers with JWT token
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Get auth token from localStorage (only in browser)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
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
   * Widget 1: Cost Breakdown Chart
   * GET /api/widgets/financial/cost-breakdown?company_id={company_id}&group_by={ServiceName|Region|Provider}
   */
  async fetchCostBreakdown(
    groupBy: GroupByType = "ServiceName",
    provider?: string
  ): Promise<CostBreakdownItem[]> {
    try {
      const url =
        provider && provider !== "all"
          ? `${this.baseURL}/api/widgets/financial/cost-breakdown?company_id=${this.companyId}&group_by=${groupBy}&provider=${provider}`
          : `${this.baseURL}/api/widgets/financial/cost-breakdown?company_id=${this.companyId}&group_by=${groupBy}`

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
   * Widget 2: Cost Trend Line
   * GET /api/widgets/financial/cost-trend?company_id={company_id}
   */
  async fetchCostTrend(): Promise<CostTrendItem[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/widgets/financial/cost-trend?company_id=${this.companyId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
          signal: AbortSignal.timeout(10000),
        }
      )

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
   * Widget 3: Savings Summary
   * GET /api/widgets/financial/savings-summary?company_id={company_id}
   */
  async fetchSavingsSummary(): Promise<SavingsSummary> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/widgets/financial/savings-summary?company_id=${this.companyId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
          signal: AbortSignal.timeout(10000),
        }
      )

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
   * Widget 4: Financial Alerts
   * GET /api/widgets/financial/financial-alerts?company_id={company_id}
   */
  async fetchFinancialAlerts(): Promise<FinancialAlert[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/widgets/financial/financial-alerts?company_id=${this.companyId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
          signal: AbortSignal.timeout(10000),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch financial alerts: ${response.status} ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching financial alerts:", error)
      throw error
    }
  }

  /**
   * Widget 6: Vendor Management
   * GET /api/widgets/financial/vendor-costs?company_id={company_id}
   */
  async fetchVendorCosts(): Promise<VendorCost[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/widgets/financial/vendor-costs?company_id=${this.companyId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
          signal: AbortSignal.timeout(10000),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch vendor costs: ${response.status} ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching vendor costs:", error)
      throw error
    }
  }

  /**
   * Widget 7: Resource Allocation
   * GET /api/widgets/financial/resource-allocation?company_id={company_id}
   */
  async fetchResourceAllocation(): Promise<ResourceAllocation[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/widgets/financial/resource-allocation?company_id=${this.companyId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
          signal: AbortSignal.timeout(10000),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch resource allocation: ${response.status} ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching resource allocation:", error)
      throw error
    }
  }

  /**
   * Widget 8: Executive KPI Summary
   * GET /api/widgets/combined/executive-kpi?company_id={company_id}
   */
  async fetchExecutiveKPI(): Promise<ExecutiveKPI> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/widgets/combined/executive-kpi?company_id=${this.companyId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
          signal: AbortSignal.timeout(10000),
        }
      )

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
   * Widget 9: Optimisation Progress
   * GET /api/widgets/combined/optimization-progress?company_id={company_id}
   */
  async fetchOptimizationProgress(): Promise<OptimizationProgress[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/widgets/combined/optimization-progress?company_id=${this.companyId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
          signal: AbortSignal.timeout(10000),
        }
      )

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
   * Fetch all dashboard data in parallel
   */
  async fetchAllDashboardData(
    groupBy: GroupByType = "ServiceName",
    provider?: string
  ): Promise<CFODashboardData> {
    try {
      const [
        costBreakdown,
        costTrend,
        savingsSummary,
        financialAlerts,
        vendorCosts,
        resourceAllocation,
        executiveKPI,
        optimizationProgress,
      ] = await Promise.all([
        this.fetchCostBreakdown(groupBy, provider),
        this.fetchCostTrend(),
        this.fetchSavingsSummary(),
        this.fetchFinancialAlerts(),
        this.fetchVendorCosts(),
        this.fetchResourceAllocation(),
        this.fetchExecutiveKPI(),
        this.fetchOptimizationProgress(),
      ])

      return {
        costBreakdown,
        costTrend,
        savingsSummary,
        financialAlerts,
        vendorCosts,
        resourceAllocation,
        executiveKPI,
        optimizationProgress,
      }
    } catch (error) {
      console.error("Error fetching CFO dashboard data:", error)
      throw new Error(
        "CREDENTIALS_REQUIRED: Unable to fetch CFO dashboard data. Please configure your cloud billing and cost management integrations with valid credentials."
      )
    }
  }
}

export default new CFODashboardApiService()
