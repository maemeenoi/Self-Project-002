// CEO Dashboard Utility Functions

/**
 * Format currency for executive view (simplified, larger numbers)
 */
export function formatCurrencyExecutive(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0';
  }
  
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;  // $1.5M
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;     // $15K
  }
  return `$${amount.toFixed(0)}`;                 // $500
}

/**
 * Format currency with full precision for detailed views
 */
export function formatCurrencyDetailed(amount: number | null | undefined): string {
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
 * Calculate annual projection from monthly amount
 */
export function calculateAnnualProjection(monthlyAmount: number | null | undefined): number {
  if (monthlyAmount === null || monthlyAmount === undefined || isNaN(monthlyAmount)) {
    return 0;
  }
  return monthlyAmount * 12;
}

/**
 * Calculate revenue equivalent (assume 25% profit margin by default)
 */
export function calculateRevenueEquivalent(savings: number | null | undefined, profitMargin: number = 0.25): number {
  if (savings === null || savings === undefined || isNaN(savings) || profitMargin <= 0) {
    return 0;
  }
  return savings / profitMargin;
}

/**
 * Determine priority level based on cost and task count
 */
export function getPriorityLevel(cost: number | null | undefined, tasks: number | null | undefined): { level: 'High' | 'Medium' | 'Low'; color: string } {
  const safeCost = cost || 0;
  const safeTasks = tasks || 0;
  
  if (safeCost > 10000 && safeTasks > 3) {
    return { level: 'High', color: 'bg-red-100 text-red-800 border-red-200' };
  }
  if (safeCost > 5000 || safeTasks > 2) {
    return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  }
  return { level: 'Low', color: 'bg-green-100 text-green-800 border-green-200' };
}

/**
 * Format trend analysis with direction and context
 */
export function formatTrendAnalysis(currentCost: number | null | undefined, previousCost: number | null | undefined): { change: string; color: 'red' | 'green'; context: string } {
  if (!currentCost || !previousCost || previousCost === 0) {
    return { change: '0%', color: 'green', context: 'No change' };
  }
  
  const changePercent = ((currentCost - previousCost) / previousCost * 100);
  const direction = changePercent >= 0 ? '↑' : '↓';
  const color = changePercent >= 0 ? 'red' : 'green';
  const context = changePercent >= 0 ? 'Monitor closely' : 'Cost savings working';
  
  return {
    change: `${direction} ${Math.abs(changePercent).toFixed(1)}%`,
    color,
    context
  };
}

/**
 * Format percentage with sign
 */
export function formatPercentWithSign(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format large numbers for display
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
 * Get color class for trend indicators
 */
export function getTrendColor(isPositive: boolean, context: 'cost' | 'savings' | 'deployments' = 'cost'): string {
  if (context === 'cost') {
    // For costs: lower is better (green), higher is worse (red)
    return isPositive ? 'text-red-600' : 'text-green-600';
  } else if (context === 'savings') {
    // For savings: higher is better (green), lower is worse (red)
    return isPositive ? 'text-green-600' : 'text-red-600';
  } else {
    // For deployments: higher is generally better (green)
    return isPositive ? 'text-green-600' : 'text-red-600';
  }
}
