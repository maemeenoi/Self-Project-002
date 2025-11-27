// Admin Activity API Service - Real Data Only

interface ActivityLogEntry {
  id: number
  timestamp: string
  type: string
  description: string
  user_email: string
  company_name: string
  details?: any
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  // process.env.NEXT_PUBLIC_BACKEND_URL ||
  // "https://app-makestuffgo-test-001-backend.azurewebsites.net"

class AdminActivityApiService {
  /**
   * Get authentication headers with JWT token
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    }

    const token = localStorage.getItem("auth_token")
    console.log(
      "🔑 Auth token from localStorage:",
      token ? `Present (${token.substring(0, 20)}...)` : "Missing"
    )

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
      console.log(
        "🔑 Authorization header set:",
        `Bearer ${token.substring(0, 20)}...`
      )
    } else {
      console.error("❌ No auth token found in localStorage!")
    }

    console.log("📋 Final headers:", headers)
    return headers
  }

  /**
   * Fetch admin activities
   */
  async fetchActivities(limit: number = 20): Promise<ActivityLogEntry[]> {
    try {
      console.log("🔍 Fetching admin activities with proper auth headers...")

      const response = await fetch(
        `${API_BASE_URL}/api/widgets/admin/activities?limit=${limit}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      )

      console.log("📡 Admin activities response status:", response.status)
      console.log(
        "📡 Admin activities response headers:",
        Object.fromEntries(response.headers.entries())
      )

      if (response.status === 401) {
        throw new Error("Authentication failed - please log in again")
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const activities = await response.json()
      console.log("✅ Admin activities fetched successfully:", activities)

      return activities
    } catch (error) {
      console.error("❌ Error fetching admin activities:", error)
      throw error
    }
  }

  /**
   * Test backend connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      return response.ok
    } catch (error) {
      console.error("Backend connection test failed:", error)
      return false
    }
  }
}

// Export singleton instance
export const adminActivityApi = new AdminActivityApiService()
