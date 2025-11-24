/**
 * Date utility functions for Engineer Dashboard
 */

/**
 * Convert a date string to relative time (e.g., "2 hours ago", "3 days ago")
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

/**
 * Check if a date is within the last 7 days
 */
export function isWithinLast7Days(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= sevenDaysAgo && date <= now;
}

/**
 * Check if a date is between 7 and 14 days ago
 */
export function isBetween7And14DaysAgo(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  return date >= fourteenDaysAgo && date < sevenDaysAgo;
}

/**
 * Format a date to YYYY-MM-DD format
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get date range for the last N days
 */
export function getLastNDays(days: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dates.push(formatDate(date));
  }
  
  return dates.reverse(); // Return in chronological order
}

/**
 * Calculate percentage change between two numbers
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Format percentage with sign and one decimal place
 */
export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(1)}%`;
}
