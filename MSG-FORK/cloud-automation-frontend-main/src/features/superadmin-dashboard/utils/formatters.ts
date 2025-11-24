// Super Admin Dashboard Formatters
// Utility functions for formatting data in the Super Admin Dashboard

// Format date for display
export function formatDate(dateString: string): string {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Format bytes to human readable format
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get activity icon based on activity type
export function getActivityIcon(activityType: string): string {
  const icons = {
    'company_created': '🏢',
    'company_updated': '✏️',
    'company_deactivated': '🚫',
    'company_activated': '✅',
    'user_login': '👤',
    'user_created': '➕',
    'user_deleted': '➖',
    'integration_added': '🔌',
    'integration_error': '⚠️',
    'billing_updated': '💰',
    'system_config': '⚙️'
  };
  return icons[activityType as keyof typeof icons] || '📋';
}

// Get severity style for alerts
export function getSeverityStyle(severity: string) {
  const styles = {
    'critical': { color: '#DC2626', icon: '🚨', bgColor: '#FEE2E2' },
    'high': { color: '#F59E0B', icon: '⚠️', bgColor: '#FFEDD5' },
    'medium': { color: '#EAB308', icon: '💡', bgColor: '#FEF3C7' },
    'low': { color: '#3B82F6', icon: 'ℹ️', bgColor: '#DBEAFE' }
  };
  return styles[severity.toLowerCase() as keyof typeof styles] || styles['low'];
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Format time duration
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

// Get status color class
export function getStatusColorClass(status: string): string {
  const colors = {
    'active': 'success',
    'inactive': 'danger',
    'operational': 'success',
    'degraded': 'warning',
    'down': 'danger',
    'paid': 'success',
    'pending': 'warning',
    'overdue': 'danger',
    'connected': 'success',
    'syncing': 'info',
    'warning': 'warning',
    'error': 'danger',
    'disabled': 'muted'
  };
  return colors[status.toLowerCase() as keyof typeof colors] || 'unknown';
}

// Format subscription tier display
export function formatSubscriptionTier(tier: string): { icon: string; color: string; label: string } {
  const tiers = {
    'Free': { icon: '🆓', color: 'gray', label: 'Free' },
    'Basic': { icon: '⭐', color: 'blue', label: 'Basic' },
    'Pro': { icon: '💎', color: 'purple', label: 'Pro' },
    'Enterprise': { icon: '👑', color: 'gold', label: 'Enterprise' }
  };
  return tiers[tier as keyof typeof tiers] || tiers['Free'];
}

// Format company size
export function formatCompanySize(size: string): string {
  const sizes = {
    'Small': 'Small (1-50)',
    'Medium': 'Medium (51-200)',
    'Large': 'Large (201-1000)',
    'Enterprise': 'Enterprise (1000+)'
  };
  return sizes[size as keyof typeof sizes] || size;
}

// Get relative time string
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Format time ago (alias for getRelativeTime for consistency)
export function formatTimeAgo(dateString: string): string {
  return getRelativeTime(dateString);
}

// Format API calls count
export function formatApiCalls(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
}

// Format storage size
export function formatStorageSize(gb: number): string {
  if (gb < 1) return `${(gb * 1024).toFixed(0)} MB`;
  if (gb < 1024) return `${gb.toFixed(1)} GB`;
  return `${(gb / 1024).toFixed(1)} TB`;
}
