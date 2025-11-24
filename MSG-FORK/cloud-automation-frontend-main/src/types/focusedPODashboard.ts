// TypeScript interfaces for Focused Product Owner Dashboard (Max 10 Widgets)
// Focus: Cloud Cost Optimization + Gamification

export interface DeploymentFrequency {
  deploymentsPerWeek: number;
  trend: number; // percentage change vs last week
  lastWeek: number;
  target?: number;
}

export interface CloudCostPerUser {
  costPerUser: number;
  activeUsers: number;
  target: number;
  trend: number; // percentage change
  breakdown?: {
    compute: number;
    storage: number;
    network: number;
  };
}

export interface TotalCloudCost {
  currentMonth: number;
  lastMonth: number;
  budget: number;
  yearToDate: number;
  projectedMonth: number;
  breakdown: {
    compute: number;
    storage: number;
    database: number;
    network: number;
    other: number;
  };
}

export interface SavingsOpportunity {
  id: number;
  title: string;
  saving: number; // monthly savings in dollars
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'compute' | 'storage' | 'network' | 'database';
  estimatedHours?: number;
}

export interface SavingsOpportunities {
  potentialSavings: number; // total monthly potential
  opportunities: SavingsOpportunity[];
  completedThisMonth: number;
  totalOpportunities: number;
  averageSavingsPerOpportunity: number;
}

export interface OptimizationRate {
  score: number; // percentage 0-100
  optimized: number; // number of issues resolved
  remaining: number; // number of issues remaining
  rank: number; // company ranking
  totalTeams: number;
  badge?: string; // achievement badge
  monthlyTrend: Array<{
    month: string;
    score: number;
  }>;
  target: number; // target score
}

export interface LeaderboardTeam {
  rank: number;
  team: string;
  savings: number; // monthly savings achieved
  badge: string; // emoji badge
  highlight?: boolean; // if this is current user's team
  trend?: number; // change in ranking
}

export interface CostSavingsLeaderboard {
  teams: LeaderboardTeam[];
  currentTeamRank: number;
  totalSavings: number; // company-wide savings
}

export interface PipelineStage {
  name: string;
  count: number;
  color?: string;
}

export interface ReleasePipeline {
  development: number;
  testing: number;
  ready: number;
  released: number;
  stages?: PipelineStage[];
}

export interface DeploymentSuccess {
  rate: number; // percentage
  successful: number;
  failed: number;
  total: number;
  trend: number; // change vs last period
  mttr?: number; // mean time to recovery in hours
}

export interface ResourceUsage {
  name: string;
  usage: number; // percentage 0-100
  cost: number; // monthly cost
  capacity: number; // total capacity
  trend: number; // percentage change vs last month
}

export interface ResourceUtilization {
  resources: ResourceUsage[];
  totalCost: number;
  averageUtilization: number;
  wastePercentage: number;
}

export interface MonthlyCostPoint {
  month: string;
  cost: number;
  budget?: number;
  savings?: number;
}

export interface MonthlyCostTrend {
  data: MonthlyCostPoint[];
  trend: number; // 6-month trend percentage
  averageMonthlyCost: number;
  projectedNextMonth: number;
}

export interface CustomerSavings {
  currentMonth: number;
  target: number;
  percentOfTarget: number;
  trend: number;
  trendDirection: 'up' | 'down';
}

export interface ProductionHealth {
  uptime: number;
  incidents: {
    critical: number;
    major: number;
    minor: number;
  };
  mttr: number;
  systemStatus: 'operational' | 'degraded' | 'down';
}

export interface TeamRanking {
  rank: number;
  totalTeams: number;
  teamName: string;
  savings: number;
  companyTotal: number;
  teams: Array<{
    rank: number;
    name: string;
    savings: number;
    trend?: 'up' | 'down';
    isCurrentTeam?: boolean;
  }>;
}

export interface DeploymentPerformance {
  deploymentsPerWeek: number;
  successRate: number;
  featuresShipped: number;
  timeToMarket: number;
}

// Main dashboard data interface
export interface FocusedPODashboardData {
  customerSavings: CustomerSavings;
  totalCloudCost: TotalCloudCost;
  optimizationRate: OptimizationRate;
  deploymentFrequency: DeploymentFrequency;
  savingsOpportunities: SavingsOpportunities;
  costSavingsLeaderboard: TeamRanking;
  productionHealth: ProductionHealth;
  monthlyCostTrend: MonthlyCostTrend;
  deploymentPerformance: DeploymentPerformance;
  lastUpdated: string;
}

// Calculation formulas for real data integration
export interface CalculationFormulas {
  deploymentFrequency: {
    source: 'GitHub Actions API';
    formula: 'COUNT(workflow_runs WHERE event_type="deployment" AND created_at >= last_7_days)';
    endpoint: '/repos/{owner}/{repo}/actions/runs';
  };
  cloudCostPerUser: {
    source: 'AWS Cost Explorer + User Analytics';
    formula: 'total_monthly_cloud_cost / active_users_count';
    endpoints: ['/aws/cost-explorer/monthly-cost', '/analytics/active-users'];
  };
  totalCloudCost: {
    source: 'AWS/Azure/GCP Billing APIs';
    formula: 'SUM(all_service_costs) WHERE billing_period = current_month';
    endpoint: '/aws/cost-explorer/total-cost';
  };
  savingsOpportunities: {
    source: 'AWS Trusted Advisor + Custom Analysis';
    formula: 'ANALYZE(unused_resources, oversized_instances, idle_services)';
    endpoint: '/aws/trusted-advisor/cost-optimization';
  };
  optimizationRate: {
    source: 'Cost Optimization Tracking System';
    formula: '(resolved_cost_issues / total_cost_issues) * 100';
    endpoint: '/cost-optimization/score';
  };
  releasePipeline: {
    source: 'Jira API';
    formula: 'COUNT(issues) GROUP BY status WHERE project = current_project';
    endpoint: '/jira/issues/pipeline-status';
  };
  deploymentSuccess: {
    source: 'GitHub Actions API';
    formula: '(successful_deployments / total_deployments) * 100';
    endpoint: '/repos/{owner}/{repo}/actions/runs';
  };
  resourceUtilization: {
    source: 'CloudWatch/Azure Monitor';
    formula: 'AVG(cpu_utilization, memory_utilization) WHERE period = last_30_days';
    endpoint: '/cloudwatch/resource-utilization';
  };
}
