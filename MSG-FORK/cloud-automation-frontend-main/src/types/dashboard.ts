// TypeScript interfaces for Product Owner Dashboard

export interface KPICard {
  title: string;
  value: number | string;
  target?: number | string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'success' | 'warning' | 'danger';
  icon?: string;
}

export interface BoardColumn {
  name: string;
  count: number;
  color?: string;
  wipLimit?: number;
}

export interface Story {
  id: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: string;
  blockedDays?: number;
  blockedReason?: string;
  owner?: string;
  readyToPull?: boolean;
}

export interface FlowMetrics {
  week: string;
  throughput: number;
  cycleTime: number;
}

export interface Blocker {
  storyId: string;
  title: string;
  reason: string;
  daysBlocked: number;
  owner: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Bottleneck {
  column: string;
  storiesWaiting: number;
  avgWaitTime: string;
  action: string;
}

export interface DeploymentStats {
  totalDeployments: number;
  successRate: number;
  rollbacks: number;
  storiesDeployed: number;
  featuresLive: number;
  productionHealth: 'healthy' | 'degraded' | 'down';
  uptime: number;
}

export interface BacklogHealth {
  readyToStart: number;
  needsRefinement: number;
  blocked: number;
  totalBacklog: number;
  coverageWeeks: number;
}

export interface DeploymentMetricsWidget {
  deploymentsThisWeek: number;
  successRate: string;
  averageDeployTime: string;
  rollbackRate: string;
}

export interface DashboardData {
  kpis: KPICard[];
  boardColumns: BoardColumn[];
  flowMetrics: FlowMetrics[];
  backlogHealth: BacklogHealth;
  topPriorities: Story[];
  blockers: Blocker[];
  bottlenecks: Bottleneck[];
  deploymentStats: DeploymentStats;
  deploymentMetricsWidget: DeploymentMetricsWidget;
  lastUpdated: string;
}
