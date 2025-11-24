/**
 * Utility functions for CFO Dashboard formatting
 */

/**
 * Format currency with proper USD formatting
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format currency in compact form for large numbers
 * @param amount - The amount to format
 * @returns Compact currency string (e.g., "$1.2M", "$45.6K")
 */
export function formatCompactCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else {
    return formatCurrency(amount);
  }
}

/**
 * Format percentage with one decimal place
 * @param value - The percentage value (e.g., 15.567)
 * @returns Formatted percentage string (e.g., "15.6%")
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${value.toFixed(1)}%`;
}

/**
 * Format percentage with sign for trends
 * @param value - The percentage value
 * @returns Formatted percentage with + or - sign (e.g., "+15.6%", "-5.2%")
 */
export function formatPercentWithSign(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '+0.0%';
  }
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Get color class based on percentage value
 * @param value - The percentage value
 * @param isGoodWhenPositive - Whether positive values are good (default: true)
 * @returns CSS color class
 */
export function getPercentageColor(value: number | null | undefined, isGoodWhenPositive: boolean = true): string {
  if (value === null || value === undefined || isNaN(value) || value === 0) {
    return 'text-gray-600';
  }
  
  if (isGoodWhenPositive) {
    return value > 0 ? 'text-green-600' : 'text-red-600';
  } else {
    return value > 0 ? 'text-red-600' : 'text-green-600';
  }
}

/**
 * Get trend arrow based on percentage value
 * @param value - The percentage value
 * @returns Arrow character
 */
export function getTrendArrow(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '→';
  }
  if (value > 0) return '↑';
  if (value < 0) return '↓';
  return '→';
}

/**
 * Format large numbers with K/M suffixes
 * @param value - The number to format
 * @returns Formatted number string (e.g., "1.2K", "45.6M")
 */
export function formatLargeNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return value.toString();
  }
}

/**
 * Calculate percentage of total
 * @param value - The value
 * @param total - The total
 * @returns Percentage (0-100)
 */
export function calculatePercentage(value: number | null | undefined, total: number | null | undefined): number {
  if (value === null || value === undefined || total === null || total === undefined || total === 0) {
    return 0;
  }
  return (value / total) * 100;
}

/**
 * Get alert severity based on growth percentage
 * @param growthPercent - The growth percentage
 * @returns Severity level
 */
export function getAlertSeverity(growthPercent: number): 'low' | 'medium' | 'high' {
  if (growthPercent >= 30) return 'high';
  if (growthPercent >= 20) return 'medium';
  return 'low';
}

/**
 * Get alert color based on severity
 * @param severity - The severity level
 * @returns CSS color classes
 */
export function getAlertColor(severity: 'low' | 'medium' | 'high'): {
  bg: string;
  text: string;
  border: string;
} {
  switch (severity) {
    case 'high':
      return {
        bg: 'bg-red-50',
        text: 'text-red-800',
        border: 'border-red-200'
      };
    case 'medium':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200'
      };
    default:
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200'
      };
  }
}

/**
 * Get budget status based on percentage used
 * @param percentUsed - Percentage of budget used (0-100)
 * @returns Budget status
 */
export function getBudgetStatus(percentUsed: number): 'on-track' | 'warning' | 'over-budget' {
  if (percentUsed >= 100) return 'over-budget';
  if (percentUsed >= 80) return 'warning';
  return 'on-track';
}

/**
 * Get budget status color
 * @param status - Budget status
 * @returns CSS color class
 */
export function getBudgetStatusColor(status: 'on-track' | 'warning' | 'over-budget'): string {
  switch (status) {
    case 'over-budget':
      return 'text-red-600';
    case 'warning':
      return 'text-yellow-600';
    default:
      return 'text-green-600';
  }
}

/**
 * Truncate resource ID for display
 * @param resourceId - Full resource ID
 * @param maxLength - Maximum length (default: 12)
 * @returns Truncated resource ID
 */
export function truncateResourceId(resourceId: string, maxLength: number = 12): string {
  if (resourceId.length <= maxLength) return resourceId;
  return `${resourceId.substring(0, maxLength)}...`;
}
