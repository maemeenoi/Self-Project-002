/**
 * Unified Backend API Service
 * 
 * This service connects the frontend to the unified backend running on port 8000.
 * Handles authentication, dashboard data, admin functions, and real-time data fetching.
 */

import config from '../config/environment.js';

// ============================================================================
// Type Definitions
// ============================================================================

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    organizationId: string | null;
    roleIds: number[];
    isSuperAdmin: boolean;
    companyId: number | null;
  };
  roles: {
    roles: Array<{
      id: string;
      name: string;
      displayName: string;
    }>;
    permissions: Array<{
      resource: string;
      actions: string[];
    }>;
  };
  company: {
    id: string | null;
    name: string | null;
    description: string | null;
  };
}

interface DashboardMetrics {
  deploymentFrequency: {
    deploymentsPerWeek: number;
    trend: number;
  };
  releaseMetrics: {
    development: number;
    testing: number;
    ready: number;
    released: number;
  };
  issuesByStatus: Record<string, number>;
  issuesByType: Record<string, number>;
  issuesByPriority: Record<string, number>;
  totalIssues: number;
  activeProjects: string[];
  recentActivity: {
    created: number;
    resolved: number;
    inProgress: number;
  };
}

interface SuperAdminStats {
  total_companies: number;
  active_companies: number;
  inactive_companies: number;
  growth_this_month: number;
}

interface SuperAdminCompany {
  company_id: number;
  name: string;
  size_label?: string;
  subscription_tier: string;
  is_active: boolean;
  created_at: string;
  total_users: number;
  admin_email?: string;
  admin_name?: string;
  admin_phone?: string;
  integrations_count: number;
  last_login?: string;
  storage_used_gb: number;
  monthly_cost: number;
  billing_status: string;
}

interface CompanyCreateRequest {
  name: string;
  size_label?: string;
  subscription_tier?: string;
  admin_first_name: string;
  admin_middle_name?: string;
  admin_last_name: string;
  admin_email: string;
  admin_phone?: string;
  admin_password: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  database_connected: boolean;
}

class UnifiedBackendApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = config.API_URL;
    // Try to load token from localStorage
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('auth_token');
    }
  }

  // ============================================================================
  // HTTP CLIENT METHODS
  // ============================================================================

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Merge with any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  private async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  /**
   * Login user and get authentication token
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.post<LoginResponse>('/auth/login', credentials);
      
      if (response.access_token) {
        this.authToken = response.access_token;
        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', response.access_token);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Let the calling code handle the error
    }
  }

  /**
   * Logout user and clear authentication
   */
  async logout(): Promise<void> {
    try {
      if (this.authToken) {
        await this.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.authToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<any> {
    return this.get('/auth/me');
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  /**
   * Check backend health status
   */
  async getHealthStatus(): Promise<HealthResponse> {
    try {
      return await this.get<HealthResponse>('/health');
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database_connected: false,
      };
    }
  }

  // ============================================================================
  // DASHBOARD DATA
  // ============================================================================

  /**
   * Get dashboard metrics for the authenticated user's role
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // This would call different endpoints based on user role
      // For now, we'll use a generic endpoint that returns role-appropriate data
      return await this.get<DashboardMetrics>('/dashboard/metrics');
    } catch (error) {
      console.error('Failed to get dashboard metrics:', error);
      // Return default metrics on error
      return {
        deploymentFrequency: { deploymentsPerWeek: 0, trend: 0 },
        releaseMetrics: { development: 0, testing: 0, ready: 0, released: 0 },
        issuesByStatus: {},
        issuesByType: {},
        issuesByPriority: {},
        totalIssues: 0,
        activeProjects: [],
        recentActivity: { created: 0, resolved: 0, inProgress: 0 },
      };
    }
  }

  // ============================================================================
  // SUPER ADMIN ENDPOINTS
  // ============================================================================

  /**
   * Get super admin statistics
   */
  async getSuperAdminStats(): Promise<SuperAdminStats> {
    return this.get<SuperAdminStats>('/api/superadmin/companies/count');
  }

  /**
   * Get all companies for super admin dashboard
   */
  async getSuperAdminCompanies(skip: number = 0, limit: number = 50): Promise<SuperAdminCompany[]> {
    return this.get<SuperAdminCompany[]>(`/api/superadmin/companies?skip=${skip}&limit=${limit}`);
  }

  /**
   * Create a new company with admin user
   */
  async createCompany(companyData: CompanyCreateRequest): Promise<SuperAdminCompany> {
    return this.post<SuperAdminCompany>('/api/superadmin/companies', companyData);
  }

  /**
   * Update company information
   */
  async updateCompany(companyId: number, updateData: Partial<SuperAdminCompany>): Promise<SuperAdminCompany> {
    return this.put<SuperAdminCompany>(`/api/superadmin/companies/${companyId}`, updateData);
  }

  /**
   * Delete a company
   */
  async deleteCompany(companyId: number): Promise<{ message: string; company_id: number }> {
    return this.delete(`/api/superadmin/companies/${companyId}`);
  }

  /**
   * Reset company admin password
   */
  async resetCompanyAdminPassword(companyId: number, newPassword: string): Promise<any> {
    return this.post(`/api/superadmin/companies/${companyId}/reset-password`, {
      new_password: newPassword,
    });
  }

  /**
   * Get company admin information
   */
  async getCompanyAdminInfo(companyId: number): Promise<any> {
    return this.get(`/api/superadmin/companies/${companyId}/admin`);
  }

  /**
   * Get system health for super admin
   */
  async getSuperAdminSystemHealth(): Promise<any> {
    return this.get('/api/superadmin/system/health');
  }

  // ============================================================================
  // COMPANY ADMIN ENDPOINTS
  // ============================================================================

  /**
   * Get company dashboard data
   */
  async getCompanyDashboard(companyId: number): Promise<any> {
    return this.get(`/api/general-admin/company/${companyId}/dashboard`);
  }

  /**
   * Get company users
   */
  async getCompanyUsers(companyId: number): Promise<any[]> {
    return this.get(`/api/general-admin/company/${companyId}/users`);
  }

  /**
   * Create user in company
   */
  async createCompanyUser(companyId: number, userData: any, currentUserId: number): Promise<any> {
    return this.post(`/api/admin/company/${companyId}/users?current_user_id=${currentUserId}`, userData);
  }

  // ============================================================================
  // WORKFLOW & FINANCIAL DATA
  // ============================================================================

  /**
   * Get workflow data
   */
  async getWorkflowData(): Promise<any> {
    return this.get('/api/workflow-processor/data');
  }

  /**
   * Get financial data
   */
  async getFinancialData(): Promise<any> {
    return this.get('/api/focus-converter/data');
  }

  /**
   * Get sync batches
   */
  async getSyncBatches(): Promise<any[]> {
    return this.get('/api/admin/sync-batches');
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Set auth token manually
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }
}

// Export singleton instance
export const unifiedApi = new UnifiedBackendApiService();
export default unifiedApi;

// Export types for use in components
export type {
  LoginCredentials,
  LoginResponse,
  DashboardMetrics,
  SuperAdminStats,
  SuperAdminCompany,
  CompanyCreateRequest,
  HealthResponse,
};