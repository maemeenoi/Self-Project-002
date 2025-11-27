// Super Admin API Service
// Handles all API calls for the Super Admin Dashboard

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_BACKEND_URL ||
//   "https://app-makestuffgo-test-001-backend.azurewebsites.net"

class SuperAdminApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  }

  // Generic fetch wrapper with error handling
  private async fetchWithErrorHandling<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error)
      throw error
    }
  }

  // 1. Total Companies
  async getTotalCompanies() {
    return this.fetchWithErrorHandling("/api/superadmin/companies/count")
  }

  // 2. Active Companies
  async getActiveCompanies() {
    return this.fetchWithErrorHandling("/api/superadmin/companies/active-count")
  }

  // 3. Total Users
  async getTotalUsers() {
    return this.fetchWithErrorHandling("/api/superadmin/users/count")
  }

  // 4. System Health
  async getSystemHealth() {
    return this.fetchWithErrorHandling("/health/detailed")
  }

  // 5. Company Management
  async getCompanies(
    params: {
      limit?: number
      offset?: number
      search?: string
      status?: "active" | "inactive" | "all"
      subscription?: string
    } = {}
  ) {
    const searchParams = new URLSearchParams()

    if (params.limit) searchParams.append("limit", params.limit.toString())
    if (params.offset) searchParams.append("offset", params.offset.toString())
    if (params.search) searchParams.append("search", params.search)
    if (params.status && params.status !== "all")
      searchParams.append("status", params.status)
    if (params.subscription)
      searchParams.append("subscription", params.subscription)

    const queryString = searchParams.toString()
    const endpoint = `/api/superadmin/companies${
      queryString ? `?${queryString}` : ""
    }`

    return this.fetchWithErrorHandling(endpoint)
  }

  // Create new company
  async createCompany(companyData: {
    name: string
    size_label: string
    subscription_tier: string
    admin_first_name: string
    admin_last_name: string
    admin_email: string
    admin_phone?: string
  }) {
    return this.fetchWithErrorHandling("/api/superadmin/companies", {
      method: "POST",
      body: JSON.stringify(companyData),
    })
  }

  // Update company
  async updateCompany(
    companyId: number,
    companyData: {
      name?: string
      size_label?: string
      subscription_tier?: string
      is_active?: boolean
    }
  ) {
    return this.fetchWithErrorHandling(
      `/api/superadmin/companies/${companyId}`,
      {
        method: "PUT",
        body: JSON.stringify(companyData),
      }
    )
  }

  // Toggle company status
  async toggleCompanyStatus(companyId: number, isActive: boolean) {
    return this.fetchWithErrorHandling(
      `/api/superadmin/companies/${companyId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive }),
      }
    )
  }

  // Delete company (permanently removes from Azure database)
  async deleteCompany(companyId: number) {
    return this.fetchWithErrorHandling(
      `/api/superadmin/companies/${companyId}`,
      {
        method: "DELETE",
      }
    )
  }

  // Login as company admin (impersonation)
  async loginAsCompany(companyId: number) {
    return this.fetchWithErrorHandling(
      `/api/superadmin/companies/${companyId}/impersonate`,
      {
        method: "POST",
      }
    )
  }

  // 6. Recent Company Additions
  async getRecentCompanies(limit: number = 6) {
    return this.fetchWithErrorHandling(
      `/api/superadmin/recent-additions?limit=${limit}`
    )
  }

  // 7. System Activity Log
  async getSystemActivity(limit: number = 20) {
    return this.fetchWithErrorHandling(
      `/api/superadmin/activity?limit=${limit}`
    )
  }

  // 8. Company Usage & Billing
  async getCompanyUsage(
    params: {
      limit?: number
      sort_by?: "cost" | "usage" | "storage"
    } = {}
  ) {
    const searchParams = new URLSearchParams()

    if (params.limit) searchParams.append("limit", params.limit.toString())
    if (params.sort_by) searchParams.append("sort_by", params.sort_by)

    const queryString = searchParams.toString()
    const endpoint = `/api/superadmin/companies/usage${
      queryString ? `?${queryString}` : ""
    }`

    return this.fetchWithErrorHandling(endpoint)
  }

  // 9. Integration Status
  async getIntegrationStatus() {
    return this.fetchWithErrorHandling("/api/superadmin/integrations/company-status")
  }

  // Bulk operations
  async bulkToggleCompanyStatus(companyIds: number[], isActive: boolean) {
    return this.fetchWithErrorHandling(
      "/api/superadmin/companies/bulk-status",
      {
        method: "PATCH",
        body: JSON.stringify({
          company_ids: companyIds,
          is_active: isActive,
        }),
      }
    )
  }

  // Export companies to CSV
  async exportCompaniesToCSV(
    params: {
      search?: string
      status?: "active" | "inactive" | "all"
      subscription?: string
    } = {}
  ) {
    const searchParams = new URLSearchParams()

    if (params.search) searchParams.append("search", params.search)
    if (params.status && params.status !== "all")
      searchParams.append("status", params.status)
    if (params.subscription)
      searchParams.append("subscription", params.subscription)

    const queryString = searchParams.toString()
    const endpoint = `/api/superadmin/companies/export${
      queryString ? `?${queryString}` : ""
    }`

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: {
        Accept: "text/csv",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.blob()
  }

  // Get company details
  async getCompanyDetails(companyId: number) {
    return this.fetchWithErrorHandling(`/api/superadmin/companies/${companyId}`)
  }

  // Get company billing details
  async getCompanyBilling(companyId: number) {
    return this.fetchWithErrorHandling(
      `/api/superadmin/companies/${companyId}/billing`
    )
  }

  // Update company billing
  async updateCompanyBilling(
    companyId: number,
    billingData: {
      monthly_cost?: number
      billing_status?: "paid" | "pending" | "overdue"
      next_billing_date?: string
    }
  ) {
    return this.fetchWithErrorHandling(
      `/api/superadmin/companies/${companyId}/billing`,
      {
        method: "PUT",
        body: JSON.stringify(billingData),
      }
    )
  }

  // Get integration details for a company
  async getCompanyIntegrations(companyId: number) {
    return this.fetchWithErrorHandling(
      `/api/superadmin/companies/${companyId}/integrations`
    )
  }

  // Fix integration for a company
  async fixCompanyIntegration(companyId: number, integrationName: string) {
    return this.fetchWithErrorHandling(
      `/api/superadmin/companies/${companyId}/integrations/${integrationName}/fix`,
      {
        method: "POST",
      }
    )
  }

  // Get alert details
  async getAlertDetails(alertId: string) {
    return this.fetchWithErrorHandling(`/api/superadmin/alerts/${alertId}`)
  }

  // Get system metrics
  async getSystemMetrics() {
    return this.fetchWithErrorHandling("/api/superadmin/system/metrics")
  }

  // Get user activity for a company
  async getCompanyUserActivity(companyId: number, limit: number = 50) {
    return this.fetchWithErrorHandling(
      `/api/superadmin/companies/${companyId}/activity?limit=${limit}`
    )
  }

  // Get company admin information
  async getCompanyAdmin(companyId: number) {
    console.log("🌐 API: Getting company admin for ID:", companyId)
    console.log(
      "🌐 API: Full URL:",
      `${this.baseUrl}/api/superadmin/companies/${companyId}/admin`
    )
    const result = await this.fetchWithErrorHandling(
      `/api/superadmin/companies/${companyId}/admin`
    )
    console.log("🌐 API: Admin result:", result)
    return result
  }

  // Reset company admin password
  async resetAdminPassword(
    companyId: number,
    passwordData: {
      new_password: string
    }
  ) {
    return this.fetchWithErrorHandling(
      `/api/superadmin/companies/${companyId}/reset-password`,
      {
        method: "POST",
        body: JSON.stringify(passwordData),
      }
    )
  }

  // ========================================
  // USER MANAGEMENT ENDPOINTS
  // ========================================

  // Get all users in the system
  async getAllUsers(
    params: {
      limit?: number
      offset?: number
      search?: string
      role?: string
      company_id?: number
      is_active?: boolean
    } = {}
  ) {
    const searchParams = new URLSearchParams()

    if (params.limit) searchParams.append("limit", params.limit.toString())
    if (params.offset) searchParams.append("offset", params.offset.toString())
    if (params.search) searchParams.append("search", params.search)
    if (params.role) searchParams.append("role", params.role)
    if (params.company_id) searchParams.append("company_id", params.company_id.toString())
    if (params.is_active !== undefined) searchParams.append("is_active", params.is_active.toString())

    const queryString = searchParams.toString()
    const endpoint = `/api/superadmin/users${queryString ? `?${queryString}` : ""}`

    return this.fetchWithErrorHandling(endpoint)
  }

  // Update user
  async updateUser(
    userId: number,
    userData: {
      first_name?: string
      middle_name?: string
      last_name?: string
      email?: string
      company_id?: number
      is_super_admin?: boolean
      is_active?: boolean
    }
  ) {
    return this.fetchWithErrorHandling(`/api/superadmin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  // Delete user
  async deleteUser(userId: number) {
    return this.fetchWithErrorHandling(`/api/superadmin/users/${userId}`, {
      method: "DELETE",
    })
  }

  // Toggle user status
  async toggleUserStatus(userId: number, isActive: boolean) {
    return this.fetchWithErrorHandling(`/api/superadmin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
    })
  }

  // Create new user
  async createUser(userData: {
    first_name: string
    middle_name?: string
    last_name: string
    email: string
    company_id?: number
    role?: string
    is_super_admin?: boolean
    is_active?: boolean
  }) {
    return this.fetchWithErrorHandling("/api/superadmin/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  // Get all available roles
  async getRoles() {
    return this.fetchWithErrorHandling("/api/superadmin/roles")
  }
}

// Create and export a singleton instance
const superAdminApi = new SuperAdminApiService()
export default superAdminApi
