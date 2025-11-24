// CEO Dashboard TypeScript Interfaces

export interface ExecutiveKPI {
  total_cost: number
  cost_trend: number
  total_deployments: number
  deployment_success_rate: number
  avg_lead_time: number
}

export interface CostBreakdownItem {
  category: string
  amount: number
  percentage: number
}

export interface CostTrendItem {
  date: string
  amount: number
}

export interface OptimizationProgressItem {
  category: string
  current: number
  target: number
  progress: number
}

export interface SavingsSummary {
  total_savings: number
  monthly_savings: number
  projected_annual_savings: number
  savings_percent: number
  total_effective_cost: number
  total_list_cost: number
}

export interface CEODashboardData {
  executiveKPI: ExecutiveKPI
  costBreakdown: CostBreakdownItem[]
  costTrend: CostTrendItem[]
  optimizationProgress: OptimizationProgressItem[]
  savingsSummary: SavingsSummary
}

export interface TrendAnalysis {
  change: string
  color: "red" | "green"
  context: string
}

export interface PriorityLevel {
  level: "High" | "Medium" | "Low"
  color: string
}
