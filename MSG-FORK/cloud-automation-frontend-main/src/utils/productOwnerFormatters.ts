// Product Owner Dashboard Utility Functions

import { PerformanceRanking, HealthStatus, DeploymentVelocity } from '@/types/productOwnerDashboard';

/**
 * Calculate overall health score from system health data
 */
export function calculateHealthScore(systemHealthData: any[]): string {
  if (!systemHealthData || systemHealthData.length === 0) return '0';
  
  let totalSuccessRate = 0;
  systemHealthData.forEach(item => {
    const total = (item.successful || 0) + (item.failed || 0);
    const successRate = total > 0 ? ((item.successful || 0) / total) * 100 : 0;
    totalSuccessRate += successRate;
  });
  
  return (totalSuccessRate / systemHealthData.length).toFixed(1);
}

/**
 * Get health status based on score
 */
export function getHealthStatus(score: number): HealthStatus {
  if (score >= 95) return { status: 'Excellent', color: 'green', icon: '✅' };
  if (score >= 90) return { status: 'Good', color: 'blue', icon: '👍' };
  if (score >= 85) return { status: 'Needs Attention', color: 'yellow', icon: '⚠️' };
  return { status: 'Critical', color: 'red', icon: '🚨' };
}

/**
 * Calculate performance ranking for team members
 */
export function calculatePerformanceRanking(teamMember: any, allMembers: any[]): PerformanceRanking {
  const sorted = [...allMembers].sort((a, b) => (b.items_completed || 0) - (a.items_completed || 0));
  const rank = sorted.findIndex(m => m.Assignee === teamMember.Assignee) + 1;
  
  if (rank === 1) return { badge: '⭐ Top Performer', color: 'gold' };
  if (rank <= 3) return { badge: '✅ Good', color: 'green' };
  if (rank <= allMembers.length * 0.7) return { badge: '✅ Good', color: 'blue' };
  return { badge: '⚠️ Needs Support', color: 'orange' };
}

/**
 * Format cycle time for product owners (convert hours to days if needed)
 */
export function formatCycleTime(hours: number | null | undefined): string {
  if (hours === null || hours === undefined || isNaN(hours)) {
    return '0h';
  }
  
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = hours / 24;
  return `${days.toFixed(1)} days`;
}

/**
 * Calculate customer value message based on savings
 */
export function getCustomerValueMessage(savings: number | null | undefined): string {
  if (!savings || savings <= 0) return '✅ Customer value delivered';
  
  if (savings > 20000) return '🌟 Exceptional customer value delivered!';
  if (savings > 10000) return '💜 Strong customer value delivered';
  if (savings > 5000) return '👍 Good customer value delivered';
  return '✅ Customer value delivered';
}

/**
 * Calculate deployment velocity from deployment data
 */
export function calculateDeploymentVelocity(deploymentData: any[]): DeploymentVelocity {
  if (!deploymentData || deploymentData.length === 0) {
    return {
      deploymentsPerWeek: 0,
      avgSuccessRate: '0.0',
      trend: { percent: '0', direction: 'neutral', message: 'no data' }
    };
  }

  const last7Days = deploymentData.filter(d => {
    const date = new Date(d.date);
    const now = new Date();
    const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });
  
  const totalDeployments = last7Days.reduce((sum, d) => sum + (d.deployments || 0), 0);
  const avgSuccessRate = last7Days.length > 0 
    ? (last7Days.reduce((sum, d) => sum + (d.success_rate || 0), 0) / last7Days.length).toFixed(1)
    : '0.0';
  
  const trend = calculateTrend(deploymentData);
  
  return {
    deploymentsPerWeek: totalDeployments,
    avgSuccessRate,
    trend
  };
}

/**
 * Calculate trend for deployment metrics
 */
function calculateTrend(deploymentData: any[]): { percent: string; direction: 'up' | 'down' | 'neutral'; message: string } {
  if (!deploymentData || deploymentData.length === 0) {
    return { percent: '0', direction: 'neutral', message: 'no data' };
  }

  const now = new Date();
  
  const last7Days = deploymentData.filter(d => {
    const date = new Date(d.date);
    const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });

  const prev7Days = deploymentData.filter(d => {
    const date = new Date(d.date);
    const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 7 && daysDiff <= 14;
  });

  const thisWeekTotal = last7Days.reduce((sum, d) => sum + (d.deployments || 0), 0);
  const lastWeekTotal = prev7Days.reduce((sum, d) => sum + (d.deployments || 0), 0);

  if (lastWeekTotal === 0) return { percent: '0', direction: 'neutral', message: 'no comparison data' };

  const percentChange = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100);

  return {
    percent: Math.abs(percentChange).toFixed(1),
    direction: percentChange >= 0 ? 'up' : 'down',
    message: percentChange >= 0 ? 'acceleration!' : 'deceleration'
  };
}

/**
 * Format currency for display
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
 * Format compact currency (e.g., $1.2K, $1.5M)
 */
export function formatCompactCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0';
  }
  
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else {
    return `$${amount.toFixed(0)}`;
  }
}

/**
 * Format percentage with sign
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${value.toFixed(1)}%`;
}

/**
 * Get trend color for costs (lower is better)
 */
export function getCostTrendColor(isIncreasing: boolean): string {
  return isIncreasing ? 'text-red-600' : 'text-green-600';
}

/**
 * Get trend arrow
 */
export function getTrendArrow(isIncreasing: boolean): string {
  return isIncreasing ? '↑' : '↓';
}

