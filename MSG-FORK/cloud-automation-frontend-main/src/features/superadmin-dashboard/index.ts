// Super Admin Dashboard Feature - Public API
// This file exports the public interface for the Super Admin Dashboard feature

// Main dashboard component
export { default as SuperAdminDashboard } from './components/SuperAdminDashboard'

// Stat Cards
export { default as TotalCompaniesCard } from './components/TotalCompaniesCard'
export { default as ActiveCompaniesCard } from './components/ActiveCompaniesCard'
export { default as TotalUsersCard } from './components/TotalUsersCard'
export { default as SystemHealthCard } from './components/SystemHealthCard'

// Main Management Widget
export { default as CompanyManagementTable } from './components/CompanyManagementTable'

// Modals
export { default as CreateCompanyModal } from './components/CreateCompanyModal'
export { default as EditCompanyModal } from './components/EditCompanyModal'
export { default as LoginAsModal } from './components/LoginAsModal'

// Monitoring Widgets
export { default as RecentCompanies } from './components/RecentCompanies'
export { default as SystemActivityLog } from './components/SystemActivityLog'
export { default as CriticalAlerts } from './components/CriticalAlerts'

// Data Widgets
export { default as CompanyUsageBilling } from './components/CompanyUsageBilling'
export { default as IntegrationStatus } from './components/IntegrationStatus'

// Services
export { default as superAdminApi } from './services/superAdminApi'

// Types
export type {
  Company,
  TotalCompaniesData,
  ActiveCompaniesData,
  TotalUsersData,
  SystemHealthData,
  CompanyManagementData,
  RecentCompany,
  ActivityItem,
  CompanyUsage,
  Alert,
  CreateCompanyData,
  UpdateCompanyData,
  UpdateBillingData,
  DashboardData,
  DashboardState,
  SubscriptionTier,
  CompanySize,
  BillingStatus,
  AlertSeverity,
  AlertStatus,
  IntegrationStatus as IntegrationStatusType,
  SystemStatus,
  ActivityType,
  ApiError
} from './types/superAdmin'

// Utils
export {
  formatDate,
  formatNumber,
  formatCurrency,
  formatBytes,
  getActivityIcon,
  getSeverityStyle,
  formatPercentage,
  formatDuration,
  getStatusColorClass,
  formatSubscriptionTier,
  formatCompanySize,
  getRelativeTime,
  formatApiCalls,
  formatStorageSize
} from './utils/formatters'

// Internal components are NOT exported to maintain encapsulation
