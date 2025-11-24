// Integration API service

export interface IntegrationType {
  AWS: "aws"
  AZURE: "azure"
  GITHUB: "github"
  JIRA: "jira"
}

export interface IntegrationConfig {
  [key: string]: any
}

export interface IntegrationSecrets {
  [key: string]: string
}

export interface Integration {
  integration_id: number
  company_id: number
  integration_type: string
  integration_name: string
  config_json?: IntegrationConfig
  created_by?: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface IntegrationWithSecrets extends Integration {
  secrets_json?: IntegrationSecrets
}

export interface CreateIntegrationRequest {
  integration_type: string
  integration_name: string
  config_json?: IntegrationConfig
  secrets_json?: IntegrationSecrets
  is_active?: boolean
}

export interface UpdateIntegrationRequest {
  integration_name?: string
  config_json?: IntegrationConfig
  secrets_json?: IntegrationSecrets
  is_active?: boolean
}

// Common configuration templates
export interface AWSConfig {
  region: string
  account_id?: string
}

export interface AWSSecrets {
  aws_access_key_id: string
  aws_secret_access_key: string
  aws_session_token?: string
}

export interface AzureConfig {
  subscription_id: string
  resource_group?: string
  storage_account?: string
}

export interface AzureSecrets {
  client_id: string
  client_secret: string
  tenant_id: string
}

export interface GitHubConfig {
  owner: string
  repo?: string
}

export interface GitHubSecrets {
  github_token: string
}

export interface JiraConfig {
  base_url: string
  project_keys?: string
}

export interface JiraSecrets {
  email: string
  api_token: string
}

export interface IntegrationStatus {
  integration_type: string
  configured: boolean
  last_sync?: string
  last_sync_status?: string
  records_count: number
  error_message?: string
}

class IntegrationApiService {
  private readonly baseUrl = "/api/integrations/managed"
  private readonly backendUrl =
    process.env.NEXT_PUBLIC_NEXT_PUBLIC_BACKEND_URL ||
    "https://app-makestuffgo-test-001-backend.azurewebsites.net"

  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      console.warn(
        "🔒 IntegrationApiService: No auth_token found in localStorage"
      )
    } else {
      console.log("🔑 IntegrationApiService: Using auth token for request")
    }
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.backendUrl}${url}`, {
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async createIntegration(
    data: CreateIntegrationRequest,
    triggerSync: boolean = false
  ): Promise<Integration> {
    const params = new URLSearchParams()
    if (triggerSync) params.append("trigger_sync", "true")

    return this.makeRequest<Integration>(
      `${this.baseUrl}${params.toString() ? "?" + params.toString() : ""}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    )
  }

  async listIntegrations(integrationType?: string): Promise<Integration[]> {
    const params = new URLSearchParams()
    if (integrationType) {
      params.append("integration_type", integrationType)
    }
    const queryString = params.toString()
    return this.makeRequest<Integration[]>(
      `${this.baseUrl}${queryString ? "?" + queryString : ""}`
    )
  }

  async getIntegration(integrationId: number): Promise<Integration> {
    return this.makeRequest<Integration>(`${this.baseUrl}/${integrationId}`)
  }

  async getIntegrationWithSecrets(
    integrationId: number
  ): Promise<IntegrationWithSecrets> {
    return this.makeRequest<IntegrationWithSecrets>(
      `${this.baseUrl}/${integrationId}/secrets`
    )
  }

  /**
   * Test integration credentials without saving them
   */
  async testIntegrationCredentials(
    config: IntegrationConfig
  ): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(
      "/api/integrations/test-credentials",
      {
        method: "POST",
        body: JSON.stringify(config),
      }
    )
  }

  async updateIntegration(
    integrationId: number,
    data: UpdateIntegrationRequest
  ): Promise<Integration> {
    return this.makeRequest<Integration>(`${this.baseUrl}/${integrationId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteIntegration(integrationId: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      `${this.baseUrl}/${integrationId}`,
      {
        method: "DELETE",
      }
    )
  }

  async getIntegrationTypes(): Promise<string[]> {
    return this.makeRequest<string[]>("/api/integrations/types")
  }

  async getAllIntegrationsStatus(): Promise<IntegrationStatus[]> {
    return this.makeRequest<IntegrationStatus[]>("/api/integrations/status")
  }

  async syncIntegrationByType(
    integrationId: string,
    forceFullSync: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(
      "/api/integrations/sync",
      {
        method: "POST",
        body: JSON.stringify({
          integration_type: integrationId,
          force_full_sync: forceFullSync,
        }),
      }
    )
  }

  async syncIntegration(
    integrationId: number,
    forceFullSync: boolean = false
  ): Promise<{
    success: boolean
    message: string
    integration_id: number
    integration_type: string
  }> {
    const params = new URLSearchParams()
    if (forceFullSync) params.append("force_full_sync", "true")

    return this.makeRequest<{
      success: boolean
      message: string
      integration_id: number
      integration_type: string
    }>(
      `${this.baseUrl}/${integrationId}/sync${
        params.toString() ? "?" + params.toString() : ""
      }`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    )
  }

  // Configuration templates
  getConfigTemplate(integrationType: string): IntegrationConfig {
    switch (integrationType) {
      case "aws":
        return { region: "us-east-1", account_id: "" }
      case "azure":
        return { subscription_id: "", resource_group: "", storage_account: "" }
      case "github":
        return { owner: "", repo: "" }
      case "jira":
        return { base_url: "", project_keys: "" }
      default:
        return {}
    }
  }

  getSecretsTemplate(integrationType: string): IntegrationSecrets {
    switch (integrationType) {
      case "aws":
        return {
          aws_access_key_id: "",
          aws_secret_access_key: "",
          aws_session_token: "",
        }
      case "azure":
        return { client_id: "", client_secret: "", tenant_id: "" }
      case "github":
        return { github_token: "" }
      case "jira":
        return { email: "", api_token: "" }
      default:
        return {}
    }
  }
}

export const integrationApi = new IntegrationApiService()
