// Super Admin Dashboard Types
// TypeScript interfaces for the Super Admin Dashboard

// Company Types
export interface Company {
  company_id: number;
  name: string;
  size_label: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  subscription_tier: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  is_active: boolean;
  created_at: string;
  total_users: number;
  admin_email: string;
  admin_name?: string;
  admin_phone?: string;
  integrations_count: number;
  last_login: string;
  storage_used_gb: number;
  monthly_cost: number;
  billing_status: 'paid' | 'pending' | 'overdue';
  next_billing_date: string;
}

// Company Creation Types
export interface CreateCompanyFormData {
  name: string;
  size_label: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  subscription_tier: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  admin_first_name: string;
  admin_middle_name?: string;
  admin_last_name: string;
  admin_email: string;
  admin_phone?: string;
  admin_password: string;
}

// Dashboard Data Types
export interface TotalCompaniesData {
  total_companies: number;
  active_companies: number;
  inactive_companies: number;
  growth_this_month?: number;
}

export interface ActiveCompaniesData {
  active_companies: number;
  growth_this_month?: number;
  growth_percent?: number;
}

export interface TotalUsersData {
  total_users: number;
  admin_users: number;
  regular_users: number;
  growth_this_month?: number;
}

export interface SystemHealthData {
  overall_status: 'operational' | 'degraded' | 'down';
  database_status: 'operational' | 'degraded' | 'down';
  api_status: 'operational' | 'degraded' | 'down';
  storage_status: 'operational' | 'degraded' | 'down';
  uptime_percent: number;
  last_incident?: string;
}

export interface CompanyManagementData {
  total: number;
  companies: Company[];
}

// Recent Companies
export interface RecentCompany {
  company_id: number;
  name: string;
  created_at: string;
  admin_name: string;
  admin_email: string;
  subscription_tier: string;
  created_by: string;
}

// Activity Log
export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: string;
}

// Company Usage & Billing
export interface CompanyUsage {
  company_id: number;
  company_name: string;
  storage_used_gb: number;
  api_calls_this_month: number;
  monthly_cost: number;
  users_active_last_30_days: number;
  last_activity: string;
}

// Integration Status
export interface CloudProviderIntegration {
  status: string;
  connected_companies: number;
  last_sync: string;
  errors_last_24h: number;
}

export interface IntegrationStatusData {
  azure: CloudProviderIntegration;
  aws: CloudProviderIntegration;
  gcp: CloudProviderIntegration;
}

// Critical Alerts
export interface Alert {
  alert_id: string;
  company_id: number;
  company_name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  status: 'open' | 'resolved';
}

// Form Data Types
export interface CreateCompanyData {
  name: string;
  size_label: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  subscription_tier: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  admin_first_name: string;
  admin_last_name: string;
  admin_email: string;
  admin_phone?: string;
}

export interface UpdateCompanyData {
  name?: string;
  size_label?: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  subscription_tier?: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  is_active?: boolean;
}

export interface UpdateBillingData {
  monthly_cost?: number;
  billing_status?: 'paid' | 'pending' | 'overdue';
  next_billing_date?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// Filter and Search Types
export interface CompanyFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  subscription?: string;
  size?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sort_by?: 'cost' | 'usage' | 'storage' | 'name' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Dashboard State Types
export interface DashboardData {
  totalCompanies?: TotalCompaniesData;
  activeCompanies?: ActiveCompaniesData;
  totalUsers?: TotalUsersData;
  systemHealth?: SystemHealthData;
  companies?: CompanyManagementData;
  recentCompanies?: RecentCompany[];
  activityLog?: ActivityItem[];
  usage?: CompanyUsage[];
  integrations?: IntegrationStatusData;
  alerts?: Alert[];
}

export interface DashboardState {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
}

// Widget Props Types
export interface StatCardProps {
  data?: any;
  loading?: boolean;
  error?: string;
}

export interface TableWidgetProps {
  data?: any;
  onRefresh: () => void;
  loading?: boolean;
  error?: string;
}

export interface ListWidgetProps {
  data?: any[];
  loading?: boolean;
  error?: string;
}

// Modal Props Types
export interface ModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export interface CreateCompanyModalProps extends ModalProps {}

export interface EditCompanyModalProps extends ModalProps {
  company: Company;
}

export interface LoginAsModalProps extends ModalProps {
  company: Company;
  onConfirm: () => void;
}

// Utility Types
export type SubscriptionTier = 'Free' | 'Basic' | 'Pro' | 'Enterprise';
export type CompanySize = 'Small' | 'Medium' | 'Large' | 'Enterprise';
export type BillingStatus = 'paid' | 'pending' | 'overdue';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'resolved';
export type IntegrationStatus = 'connected' | 'syncing' | 'warning' | 'error' | 'disabled';
export type SystemStatus = 'operational' | 'degraded' | 'down';
export type ActivityType = 
  | 'company_created'
  | 'company_updated'
  | 'company_deactivated'
  | 'company_activated'
  | 'user_login'
  | 'user_created'
  | 'user_deleted'
  | 'integration_added'
  | 'integration_error'
  | 'billing_updated'
  | 'system_config';

// Theme Types
export interface SuperAdminTheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  dark: string;
  purpleLight: string;
  pinkLight: string;
}

// API Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  status?: number;
}

// All types are already exported individually above
