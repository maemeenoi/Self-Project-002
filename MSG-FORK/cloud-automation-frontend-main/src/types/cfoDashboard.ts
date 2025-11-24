/**
 * TypeScript interfaces for CFO Dashboard widgets
 * Based on the API endpoints from widgetsService.py
 */

// Widget 1: Cost Breakdown Chart
export interface CostBreakdownItem {
  category: string
  total_cost: number
}

export type GroupByType = "ServiceName" | "Region" | "Provider"

// Widget 2: Cost Trend Line
export interface CostTrendItem {
  period: string
  total_cost: number
}

// Widget 3: Savings Summary
export interface SavingsSummary {
  total_list_cost: number
  total_effective_cost: number
  total_savings: number
  savings_percent: number
}

// Widget 4: Financial Alerts
export interface FinancialAlert {
  period: string
  total_cost: number
  prev_cost: number
  growth_percent: number
}

// Widget 5: Budget Tracking (uses CostTrendItem)
export interface BudgetInfo {
  currentSpend: number
  budget: number
  remaining: number
  percentUsed: number
  status: "on-track" | "warning" | "over-budget"
}

// Widget 6: Vendor Management
export interface VendorCost {
  vendor: string
  amount: number
  percentage: number
}

// Widget 7: Resource Allocation
export interface ResourceAllocation {
  resource: string
  allocated: number
  used: number
  percentage: number
}

// Widget 8: Executive KPI Summary (matching backend CEO structure)
export interface ExecutiveKPI {
  total_cost: number
  cost_trend: number
  total_deployments: number
  deployment_success_rate: number
  avg_lead_time: number
}

// Widget 9: Optimisation Progress (matching backend CEO structure)
export interface OptimizationProgress {
  category: string
  current: number
  target: number
  progress: number
}

// Combined dashboard data
export interface CFODashboardData {
  costBreakdown: CostBreakdownItem[]
  costTrend: CostTrendItem[]
  savingsSummary: SavingsSummary
  financialAlerts: FinancialAlert[]
  vendorCosts: VendorCost[]
  resourceAllocation: ResourceAllocation[]
  executiveKPI: ExecutiveKPI
  optimizationProgress: OptimizationProgress[]
}

// Widget component props
export interface WidgetProps<T> {
  data: T
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
}

// Chart configuration
export interface ChartConfig {
  colors: string[]
  height: number
  showLegend: boolean
}
