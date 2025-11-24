// TypeScript interfaces for Cloud Cost Optimization Service Dashboard

export interface CustomerImpact {
  totalSavings: number;
  averageSavingsPercent: number;
  activeCustomers: number;
  cloudSpendManaged: number;
  savingsByCategory: {
    compute: number;
    storage: number;
    database: number;
    other: number;
  };
  monthlyTrend: Array<{
    month: string;
    savings: number;
  }>;
}

export interface ProductPerformance {
  recommendationsGenerated: number;
  implementationSuccessRate: number;
  avgTimeToRealizeSavings: number;
  customerAdoptionRate: number;
  recommendationBreakdown: {
    compute: number;
    storage: number;
    database: number;
    network: number;
  };
}

export interface OurCloudCost {
  current: number;
  budget: number;
  breakdown: {
    compute: number;
    storage: number;
    database: number;
    other: number;
  };
  efficiency: {
    costPerCustomer: number;
    costPerThousandSavings: number;
    costAsPercentRevenue: number;
  };
  optimizations: Array<{
    description: string;
    savings: number;
  }>;
}

export interface CustomerHealth {
  activeUsers: number;
  weeklyActivePercent: number;
  avgSessionDuration: number;
  featureAdoption: number;
  topRequests: Array<{
    feature: string;
    votes: number;
  }>;
}

export interface DeliveryPerformance {
  deploymentFrequency: number;
  successRate: number;
  avgDeployTime: number;
  featuresShipped: number;
  timeToMarket: {
    current: number;
    target: number;
    status: 'on-track' | 'behind' | 'ahead';
  };
  teamVelocity: {
    storiesPerWeek: number;
    cycleTime: number;
    trend: 'improving' | 'stable' | 'declining';
  };
}

export interface InfrastructureHealth {
  resourceUtilization: {
    cpu: number;
    memory: number;
    disk: number;
    networkLatency: number;
  };
  regionalDistribution: {
    usEast: number;
    euWest: number;
    apac: number;
  };
  status: string;
}

export interface ProductionStatus {
  uptime: number;
  incidents: {
    critical: number;
    major: number;
    minor: number;
  };
  mttr: number;
  featuresLive: number;
  customerFacingStatus: string;
}

export interface BacklogHealth {
  readyStories: number;
  backlogCoverage: number;
  status: 'healthy' | 'at-risk' | 'critical';
}

export interface OptimizationKPICard {
  title: string;
  value: string | number;
  secondaryValue?: string | number;
  target?: number;
  progress?: number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
  };
  status?: 'success' | 'warning' | 'danger' | 'info';
  color: 'green' | 'orange' | 'blue' | 'red';
}

export interface CostOptimizationDashboardData {
  kpis: OptimizationKPICard[];
  customerImpact: CustomerImpact;
  ourCloudCost: OurCloudCost;
  productPerformance: ProductPerformance;
  deliveryPerformance: DeliveryPerformance;
  customerHealth: CustomerHealth;
  infrastructureHealth: InfrastructureHealth;
  productionStatus: ProductionStatus;
  backlogHealth: BacklogHealth;
  topPriorities: Array<{
    id: string;
    title: string;
    priority: 'P0' | 'P1' | 'P2' | 'P3';
    status: string;
    readyToPull: boolean;
  }>;
  lastUpdated: string;
}
