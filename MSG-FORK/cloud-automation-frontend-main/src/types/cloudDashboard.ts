// TypeScript interfaces for Cloud-focused Product Owner Dashboard

export interface CloudCost {
  current: number;
  budget: number;
  breakdown: {
    compute: number;
    storage: number;
    database: number;
    other: number;
  };
  trend: string;
  costEfficiency: {
    perDeployment: number;
    perStory: number;
    perUser: number;
  };
  optimizations: Array<{
    description: string;
    savings: number;
  }>;
}

export interface DeliverySpeed {
  deploymentFrequency: number;
  avgDeployTime: number;
  successRate: number;
  timeToMarket: {
    current: number;
    target: number;
    status: 'on-track' | 'behind' | 'ahead';
  };
  featureDelivery: {
    thisMonth: number;
    average: number;
    trend: number;
  };
}

export interface InfrastructureHealth {
  resourceUtilization: {
    cpu: number;
    memory: number;
    disk: number;
    networkLatency: number;
  };
  autoScalingEvents: number;
  performance: string;
  regionalDistribution: {
    usEast: number;
    euWest: number;
    apac: number;
  };
}

export interface TeamPerformance {
  weeklyOutput: number;
  cycleTime: number;
  throughput: {
    status: string;
    trend: 'up' | 'down' | 'stable';
  };
  teamCapacity: {
    status: string;
    utilization: number;
  };
  backlogCoverage: number;
}

export interface ProductionHealth {
  uptime: number;
  incidents: {
    critical: number;
    major: number;
    minor: number;
  };
  mttr: number;
  featuresLive: number;
}

export interface CloudKPICard {
  title: string;
  value: string | number;
  secondaryValue?: string | number;
  progress?: number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
  };
  status?: 'success' | 'warning' | 'danger' | 'info';
  color: 'blue' | 'orange' | 'red' | 'green';
}

export interface CloudDashboardData {
  kpis: CloudKPICard[];
  cloudCost: CloudCost;
  deliverySpeed: DeliverySpeed;
  infrastructureHealth: InfrastructureHealth;
  teamPerformance: TeamPerformance;
  productionHealth: ProductionHealth;
  topPriorities: Array<{
    id: string;
    title: string;
    priority: 'P0' | 'P1' | 'P2' | 'P3';
    status: string;
    readyToPull: boolean;
  }>;
  lastUpdated: string;
}
