// Product Owner Dashboard TypeScript Interfaces

export interface CostBreakdownItem {
  category: string
  total_cost: number
}

export interface CostTrendItem {
  period: string
  total_cost: number
}

export interface SavingsSummary {
  total_list_cost: number
  total_effective_cost: number
  total_savings: number
  savings_percent: number
}

export interface TeamPerformanceItem {
  Assignee: string
  items_completed: number
  avg_lead: number
  avg_cycle: number
}

export interface SystemHealthItem {
  ItemType: string
  failed: number
  successful: number
}

export interface DeploymentMetric {
  date: string
  deployments: number
  success_rate: number
}

export interface Provider {
  name: string
  display_name: string
  cost: number
  percentage: number
}

export interface ProductOwnerDashboardData {
  costBreakdown: CostBreakdownItem[]
  costTrend: CostTrendItem[]
  savingsSummary: SavingsSummary
  teamPerformance: TeamPerformanceItem[]
  systemHealth: SystemHealthItem[]
  deploymentMetrics: DeploymentMetric[]
  availableProviders?: Provider[]
}

export interface PerformanceRanking {
  badge: string
  color: "gold" | "green" | "blue" | "orange"
}

export interface HealthStatus {
  status: "Excellent" | "Good" | "Needs Attention" | "Critical"
  color: "green" | "blue" | "yellow" | "red"
  icon: string
}

export interface DeploymentVelocity {
  deploymentsPerWeek: number
  avgSuccessRate: string
  trend: {
    percent: string
    direction: "up" | "down" | "neutral"
    message: string
  }
}
