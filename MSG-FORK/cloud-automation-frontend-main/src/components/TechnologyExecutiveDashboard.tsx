'use client'

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  Shield,
  Code,
  Cloud,
  Database,
  Server,
  Zap,
  BarChart3,
  Target,
  Clock,
  Gauge,
  Building2,
  Globe,
  AlertTriangle,
  ArrowRight,
  Activity,
  PieChart,
  Loader2,
  RefreshCw,
  Lock,
  Cpu,
  HardDrive,
  Network,
  CheckCircle,
  XCircle,
  GitBranch,
  Rocket
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  CloudNativeWidget,
  TechnicalDebtWidget,
  MultiCloudReliabilityWidget,
  SecurityScoreWidget,
  MigrationDeliveryWidget,
  ServiceQualityWidget,
  GovernanceWidget
} from './TechExecutiveWidgets';

interface TechDashboardData {
  techExecutiveSummary: any;
  cloudNativeScore: any;
  multiCloudReliability: any;
  cloudTechnicalDebt: any;
  cloudEngineeringVelocity: any;
  cloudSecurityScore: any;
  cloudCompliance: any;
  cloudMigrationDelivery: any;
  cloudServiceQuality: any;
  cloudGovernanceScore: any;
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow border ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b ${className}`}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
);

const Badge: React.FC<{ children: React.ReactNode; className?: string; variant?: string }> = ({ children, className = '', variant = 'default' }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 text-gray-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};

const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-full rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export const TechnologyExecutiveDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [techData, setTechData] = useState<TechDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get current user's role for widget filtering
  const getCurrentUserRole = (): string => {
    if (!user) return '';
    const primaryRole = user.primaryRole?.name || '';
    const userRoles = user.roles?.map(role => role.name) || [];
    const allRoles = [...userRoles, primaryRole];
    
    // Return the first executive role found
    const executiveRoles = ['CTO', 'CIO', 'CISO', 'Delivery Executive'];
    return executiveRoles.find(role => 
      allRoles.some(userRole => userRole.toLowerCase().includes(role.toLowerCase().replace(' executive', '')))
    ) || '';
  };

  // Check if user has technology executive access
  const hasTechExecutiveAccess = () => {
    if (!isAuthenticated || !user) return false;
    
    const techExecutiveRoles = ['CTO', 'CIO', 'CISO', 'Delivery Executive'];
    const userRoleNames = user.roles?.map(role => role.name) || [];
    const primaryRoleName = user.primaryRole?.name || '';
    
    const allRoles = [...userRoleNames, primaryRoleName].filter(Boolean);
    
    return techExecutiveRoles.some(role => 
      allRoles.includes(role as any) || 
      allRoles.some(userRole => userRole.toLowerCase().includes(role.toLowerCase().replace(' executive', '')))
    );
  };

  // Fetch technology dashboard data
  const fetchTechData = async (showRefreshLoader = false) => {
    if (!user?.organizationId) return;
    
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const companyId = user.organizationId || '1';
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      // Get auth token
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Fetch all tech executive endpoints in parallel
      const endpoints = [
        'tech-executive-summary',
        'cloud-native-score',
        'multi-cloud-reliability', 
        'cloud-technical-debt',
        'cloud-engineering-velocity',
        'cloud-security-score',
        'cloud-compliance',
        'cloud-migration-delivery',
        'cloud-service-quality',
        'cloud-governance-score'
      ];

      const responses = await Promise.allSettled(
        endpoints.map(endpoint => 
          fetch(`${baseUrl}/api/tech-executive/${endpoint}?company_id=${companyId}`, { headers })
            .then(res => res.json())
        )
      );

      // Extract successful responses
      const extractData = (result: PromiseSettledResult<any>) => 
        result.status === 'fulfilled' && result.value?.success ? result.value.data : null;

      const tech: TechDashboardData = {
        techExecutiveSummary: extractData(responses[0]) || { 
          overall_technology_score: 0, cloud_native_score: 0, reliability_score: 0, 
          security_score: 0, governance_score: 0, provider_count: 0, region_count: 0 
        },
        cloudNativeScore: extractData(responses[1]) || { 
          cloud_native_score: 0, cloud_native_percentage: 0, breakdown: {}, service_mix: [] 
        },
        multiCloudReliability: extractData(responses[2]) || { 
          reliability_score: 0, provider_count: 0, region_count: 0, provider_breakdown: {}, geographic_distribution: [] 
        },
        cloudTechnicalDebt: extractData(responses[3]) || { 
          total_debt_items: 0, open_debt_items: 0, total_story_points: 0, debt_by_type: {}, top_debt_projects: [] 
        },
        cloudEngineeringVelocity: extractData(responses[4]) || { 
          monthly_throughput: [], flow_metrics: {}, deployment_frequency: {}, velocity_trend: 'stable' 
        },
        cloudSecurityScore: extractData(responses[5]) || { 
          security_score: 0, total_security_spend: 0, security_services: [], security_issues: {} 
        },
        cloudCompliance: extractData(responses[6]) || { 
          compliance_percentage: 0, compliant_spend: 0, regional_compliance: [], compliance_tasks: {} 
        },
        cloudMigrationDelivery: extractData(responses[7]) || { 
          migration_progress: {}, top_migration_projects: [] 
        },
        cloudServiceQuality: extractData(responses[8]) || { 
          quality_score: 0, defect_metrics: {}, incident_metrics: {}, project_quality: [] 
        },
        cloudGovernanceScore: extractData(responses[9]) || { 
          governance_score: 0, governance_percentage: 0, resource_distribution: [] 
        }
      };

      setTechData(tech);
      
    } catch (err) {
      console.error('Error fetching tech dashboard data:', err);
      setError('Failed to load technology dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (hasTechExecutiveAccess()) {
      fetchTechData();
    }
  }, [user]);

  // Access control check
  if (!isAuthenticated || !hasTechExecutiveAccess()) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="text-center py-12">
          <CardContent>
            <Lock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Technology Executive Access Required</h2>
            <p className="text-gray-600 mb-4">
              This Technology Executive Dashboard is restricted to technology leadership roles only.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {['CTO', 'CIO', 'CISO', 'Delivery Executive'].map(role => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              {!isAuthenticated 
                ? "Please log in with technology executive credentials." 
                : `Your current role (${user?.primaryRole?.name || 'Unknown'}) does not have access to this dashboard.`
              }
            </p>
            <p className="text-xs text-gray-400 mt-3">
              Business executives (CEO, CFO) have access to the Business Executive Dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading Technology Executive Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
                <button 
                  onClick={() => fetchTechData()}
                  className="ml-2 underline hover:no-underline"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!techData) return null;

    const getRoleFocusedKPIs = () => {
    const userRole = getCurrentUserRole();
    
    if (userRole === 'CTO') {
      return [
        {
          title: 'Cloud-Native Score',
          value: `${(techData?.cloudNativeScore?.cloud_native_score || 0).toFixed(1)}/10`,
          change: `${(techData?.cloudNativeScore?.cloud_native_percentage || 0).toFixed(1)}%`,
          trend: (techData?.cloudNativeScore?.cloud_native_percentage || 0) > 50 ? 'up' : 'down',
          icon: Cloud,
          description: 'Serverless and PaaS adoption'
        },
        {
          title: 'Multi-Cloud Reliability',
          value: `${(techData?.multiCloudReliability?.reliability_score || 0).toFixed(1)}/10`,
          change: `${techData?.multiCloudReliability?.provider_count || 0} providers`,
          trend: (techData?.multiCloudReliability?.provider_count || 0) > 1 ? 'up' : 'down',
          icon: Globe,
          description: 'Cross-provider resilience'
        },
        {
          title: 'Technical Debt',
          value: `${techData?.cloudTechnicalDebt?.open_debt_items || 0}`,
          change: `${techData?.cloudTechnicalDebt?.open_story_points || 0} SP`,
          trend: (techData?.cloudTechnicalDebt?.open_debt_items || 0) < 10 ? 'up' : 'down',
          icon: Code,
          description: 'Outstanding technical debt items'
        },
        {
          title: 'Engineering Velocity',
          value: `${techData?.cloudEngineeringVelocity?.deployment_frequency?.deployments_per_week || 0}/wk`,
          change: techData?.cloudEngineeringVelocity?.velocity_trend || 'stable',
          trend: techData?.cloudEngineeringVelocity?.velocity_trend === 'increasing' ? 'up' : 'down',
          icon: Zap,
          description: 'Deployment frequency'
        }
      ];
    } else if (userRole === 'CIO') {
      return [
        {
          title: 'Cloud Governance',
          value: `${(techData?.cloudGovernanceScore?.governance_score || 0).toFixed(1)}/10`,
          change: `${(techData?.cloudGovernanceScore?.governance_percentage || 0).toFixed(1)}%`,
          trend: (techData?.cloudGovernanceScore?.governance_percentage || 0) > 70 ? 'up' : 'down',
          icon: Shield,
          description: 'Policy and tag compliance'
        },
        {
          title: 'Cloud ROI',
          value: `$${((techData?.cloudSecurityScore?.total_security_spend || 0) / 1000).toFixed(0)}K`,
          change: '+15%',
          trend: 'up',
          icon: TrendingUp,
          description: 'Cloud investment returns'
        },
        {
          title: 'Strategic Initiatives',
          value: '8',
          change: '75% complete',
          trend: 'up',
          icon: Target,
          description: 'Active transformation projects'
        },
        {
          title: 'FinOps Maturity',
          value: '7.2/10',
          change: '+0.8',
          trend: 'up',
          icon: BarChart3,
          description: 'Financial operations maturity'
        }
      ];
    } else if (userRole === 'CISO') {
      return [
        {
          title: 'Security Score',
          value: `${(techData?.cloudSecurityScore?.security_score || 0).toFixed(1)}/10`,
          change: `$${(techData?.cloudSecurityScore?.total_security_spend || 0).toFixed(0)}`,
          trend: (techData?.cloudSecurityScore?.security_score || 0) > 7 ? 'up' : 'down',
          icon: Shield,
          description: 'Overall security posture'
        },
        {
          title: 'Compliance Rate',
          value: `${(techData?.cloudCompliance?.compliance_percentage || 0).toFixed(1)}%`,
          change: `${techData?.cloudCompliance?.compliance_tasks?.completion_rate || 0}% tasks`,
          trend: (techData?.cloudCompliance?.compliance_percentage || 0) > 90 ? 'up' : 'down',
          icon: CheckCircle,
          description: 'Regulatory compliance status'
        },
        {
          title: 'Security Issues',
          value: `${techData?.cloudSecurityScore?.security_issues?.open_issues || 0}`,
          change: `${techData?.cloudSecurityScore?.security_issues?.resolution_rate || 0}% resolved`,
          trend: (techData?.cloudSecurityScore?.security_issues?.open_issues || 0) < 5 ? 'up' : 'down',
          icon: AlertTriangle,
          description: 'Open security vulnerabilities'
        },
        {
          title: 'Security Investment',
          value: `$${(techData?.cloudSecurityScore?.total_security_spend || 0).toFixed(0)}`,
          change: '+12%',
          trend: 'up',
          icon: Building2,
          description: 'Security tooling spend'
        }
      ];
    } else if (userRole === 'Delivery Executive') {
      return [
        {
          title: 'Migration Progress',
          value: `${(techData?.cloudMigrationDelivery?.migration_progress?.completion_percentage || 0).toFixed(1)}%`,
          change: `${techData?.cloudMigrationDelivery?.migration_progress?.completed_tasks || 0} tasks`,
          trend: (techData?.cloudMigrationDelivery?.migration_progress?.completion_percentage || 0) > 50 ? 'up' : 'down',
          icon: Rocket,
          description: 'Cloud migration completion'
        },
        {
          title: 'Service Quality',
          value: `${(techData?.cloudServiceQuality?.quality_score || 0).toFixed(1)}/10`,
          change: `${techData?.cloudServiceQuality?.incident_metrics?.mttr_hours || 0}h MTTR`,
          trend: (techData?.cloudServiceQuality?.quality_score || 0) > 7 ? 'up' : 'down',
          icon: Activity,
          description: 'Application reliability score'
        },
        {
          title: 'Team Velocity',
          value: `${techData?.cloudEngineeringVelocity?.deployment_frequency?.deployments_per_week || 0}/wk`,
          change: techData?.cloudEngineeringVelocity?.velocity_trend || 'stable',
          trend: techData?.cloudEngineeringVelocity?.velocity_trend === 'increasing' ? 'up' : 'down',
          icon: TrendingUp,
          description: 'Delivery throughput'
        },
        {
          title: 'Project Health',
          value: `${(techData?.cloudServiceQuality?.project_quality || []).length}`,
          change: 'Active projects',
          trend: 'up',
          icon: Building2,
          description: 'Projects under management'
        }
      ];
    }
    
    // Default fallback
    return [];
  };


  // Role-specific KPIs based on user's executive role
  const roleSpecificKPIs = getRoleFocusedKPIs();
  const userRole = getCurrentUserRole();

  const getDashboardTitle = () => {
    const roleTitles = {
      'CTO': 'Chief Technology Officer Dashboard',
      'CIO': 'Chief Information Officer Dashboard', 
      'CISO': 'Chief Information Security Officer Dashboard',
      'Delivery Executive': 'Delivery Executive Dashboard'
    };
    return roleTitles[userRole as keyof typeof roleTitles] || 'Technology Executive Dashboard';
  };

  const getDashboardSubtitle = () => {
    const roleSubtitles = {
      'CTO': 'Technical Architecture, Engineering Velocity & Cloud-Native Transformation',
      'CIO': 'Technology Investment, Governance & Strategic IT Initiatives',
      'CISO': 'Security Posture, Compliance & Risk Management',
      'Delivery Executive': 'Project Delivery, Service Quality & Team Performance'
    };
    return roleSubtitles[userRole as keyof typeof roleSubtitles] || 'Technology Leadership & Cloud Operations';
  };

  const renderKPICards = (metrics: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {metric.change}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-blue-600 bg-blue-50';
    if (score >= 4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDebtColor = (count: number) => {
    if (count === 0) return 'text-green-600 bg-green-50';
    if (count <= 5) return 'text-blue-600 bg-blue-50';
    if (count <= 15) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Role-specific widget filtering
  const shouldShowWidget = (widgetName: string): boolean => {
    const userRole = getCurrentUserRole();
    
    const roleWidgets: Record<string, string[]> = {
      'CTO': [
        'cloud-native-score',
        'multi-cloud-reliability', 
        'technical-debt',
        'engineering-velocity',
        'tech-summary'
      ],
      'CIO': [
        'governance-score',
        'business-impact',
        'strategic-initiatives',
        'tech-summary'
      ],
      'CISO': [
        'security-score',
        'compliance',
        'risk-assessment',
        'tech-summary'
      ],
      'Delivery Executive': [
        'migration-delivery',
        'service-quality',
        'team-utilization',
        'tech-summary'
      ]
    };
    
    const allowedWidgets = roleWidgets[userRole] || [];
    return allowedWidgets.includes(widgetName);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">{getDashboardTitle()}</h2>
          <p className="text-muted-foreground">
            {getDashboardSubtitle()} • Company: {user?.organizationName}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-600">
            {userRole || user?.primaryRole?.name || 'Executive'}
          </Badge>
          <button
            onClick={() => fetchTechData(true)}
            disabled={refreshing}
            className="flex items-center space-x-1 px-3 py-1 text-sm border rounded hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {renderKPICards(roleSpecificKPIs)}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CTO Widget: Cloud Native Architecture */}
        {shouldShowWidget('cloud-native-score') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cloud className="h-5 w-5 mr-2" />
              Cloud-Native Architecture
              <Badge variant="secondary" className="ml-auto">
                {techData.cloudNativeScore.cloud_native_score}/10
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded">
                  <Server className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                  <div className="text-lg font-bold text-blue-600">
                    ${(techData.cloudNativeScore.breakdown.serverless_spend || 0) / 1000}K
                  </div>
                  <div className="text-xs text-gray-600">Serverless</div>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <Database className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                  <div className="text-lg font-bold text-purple-600">
                    ${(techData.cloudNativeScore.breakdown.paas_spend || 0) / 1000}K
                  </div>
                  <div className="text-xs text-gray-600">PaaS</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Top Cloud Services</div>
                {(techData.cloudNativeScore?.service_mix || []).slice(0, 3).map((service: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{service.service_name}</span>
                    <span className="font-medium">${(service.spend || 0).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* CTO Widget: Engineering Velocity */}
        {shouldShowWidget('engineering-velocity') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Engineering Velocity
              <Badge 
                variant="secondary" 
                className={`ml-auto ${techData.cloudEngineeringVelocity.velocity_trend === 'increasing' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
              >
                {techData.cloudEngineeringVelocity.velocity_trend}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded">
                  <GitBranch className="h-6 w-6 mx-auto mb-1 text-green-600" />
                  <div className="text-lg font-bold text-green-600">
                    {techData.cloudEngineeringVelocity.deployment_frequency.deployments_per_week || 0}
                  </div>
                  <div className="text-xs text-gray-600">Deployments/Week</div>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <Clock className="h-6 w-6 mx-auto mb-1 text-orange-600" />
                  <div className="text-lg font-bold text-orange-600">
                    {techData.cloudEngineeringVelocity.flow_metrics.avg_lead_time_days || 0}d
                  </div>
                  <div className="text-xs text-gray-600">Avg Lead Time</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Recent Monthly Throughput</div>
                {(techData.cloudEngineeringVelocity?.monthly_throughput || []).slice(-3).map((month: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{month.month}</span>
                    <span className="font-medium">{month.completed_story_points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Security & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className={`text-lg font-bold ${getScoreColor(techData.cloudSecurityScore.security_score)}`}>
                    {(techData.cloudSecurityScore?.security_score || 0).toFixed(1)}/10
                  </div>
                  <div className="text-xs text-gray-600">Security Score</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className={`text-lg font-bold ${getScoreColor(techData.cloudCompliance.compliance_percentage / 10)}`}>
                    {(techData.cloudCompliance?.compliance_percentage || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Compliance</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Security Investment</div>
                {(techData.cloudSecurityScore?.security_services || []).slice(0, 3).map((service: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="truncate">{service.service_name}</span>
                    <span className="font-medium">${(service.spend || 0).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              
              {techData.cloudSecurityScore.security_issues.total_issues > 0 && (
                <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                  {techData.cloudSecurityScore.security_issues.open_issues} open security issues of {techData.cloudSecurityScore.security_issues.total_issues} total
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Technical Debt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="h-5 w-5 mr-2" />
              Technical Debt Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 border rounded">
                  <div className={`text-lg font-bold ${getDebtColor(techData.cloudTechnicalDebt.debt_by_type.bugs || 0)}`}>
                    {techData.cloudTechnicalDebt.debt_by_type.bugs || 0}
                  </div>
                  <div className="text-xs text-gray-600">Bugs</div>
                </div>
                <div className="p-2 border rounded">
                  <div className={`text-lg font-bold ${getDebtColor(techData.cloudTechnicalDebt.debt_by_type.refactoring || 0)}`}>
                    {techData.cloudTechnicalDebt.debt_by_type.refactoring || 0}
                  </div>
                  <div className="text-xs text-gray-600">Refactor</div>
                </div>
                <div className="p-2 border rounded">
                  <div className={`text-lg font-bold ${getDebtColor(techData.cloudTechnicalDebt.debt_by_type.technical_debt || 0)}`}>
                    {techData.cloudTechnicalDebt.debt_by_type.technical_debt || 0}
                  </div>
                  <div className="text-xs text-gray-600">Tech Debt</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Top Debt Projects</div>
                {(techData.cloudTechnicalDebt?.top_debt_projects || []).slice(0, 3).map((project: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="truncate">{project.project}</span>
                    <span className="font-medium">{project.story_points} pts</span>
                  </div>
                ))}
              </div>
              
              {techData.cloudTechnicalDebt.avg_resolution_days > 0 && (
                <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                  Avg resolution time: {techData.cloudTechnicalDebt.avg_resolution_days} days
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Migration & Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Migration & Delivery Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {techData.cloudMigrationDelivery.migration_progress.total_tasks > 0 ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {(techData.cloudMigrationDelivery?.migration_progress?.completion_percentage || 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Migration Complete</div>
                  </div>
                  
                  <Progress value={techData.cloudMigrationDelivery.migration_progress.completion_percentage} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="font-bold text-green-600">
                        {techData.cloudMigrationDelivery.migration_progress.completed_tasks}
                      </div>
                      <div className="text-gray-600">Completed</div>
                    </div>
                    <div>
                      <div className="font-bold text-blue-600">
                        {techData.cloudMigrationDelivery.migration_progress.in_progress_tasks}
                      </div>
                      <div className="text-gray-600">In Progress</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600">
                        {techData.cloudMigrationDelivery.migration_progress.total_tasks}
                      </div>
                      <div className="text-gray-600">Total Tasks</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Top Migration Projects</div>
                    {(techData.cloudMigrationDelivery?.top_migration_projects || []).slice(0, 3).map((project: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="truncate">{project.project}</span>
                        <span className="font-medium">{project.completion_rate}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No active migration projects found</p>
                  <p className="text-xs">Migration tracking will appear here when projects are tagged appropriately</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gauge className="h-5 w-5 mr-2" />
              Service Quality Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${getScoreColor(techData.cloudServiceQuality.quality_score)}`}>
                  {(techData.cloudServiceQuality?.quality_score || 0).toFixed(1)}/10
                </div>
                <div className="text-sm text-gray-600">Quality Score</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <XCircle className="h-6 w-6 mx-auto mb-1 text-red-500" />
                  <div className="text-lg font-bold">
                    {techData.cloudServiceQuality.defect_metrics.open_defects || 0}
                  </div>
                  <div className="text-xs text-gray-600">Open Defects</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                  <div className="text-lg font-bold">
                    {techData.cloudServiceQuality.incident_metrics.mttr_hours || 0}h
                  </div>
                  <div className="text-xs text-gray-600">MTTR</div>
                </div>
              </div>
              
              {techData.cloudServiceQuality.project_quality.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Project Quality</div>
                  {techData.cloudServiceQuality.project_quality.slice(0, 3).map((project: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="truncate">{project.project}</span>
                      <span className="font-medium">{project.total_issues} issues</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Cloud Distribution Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Multi-Cloud Infrastructure Overview
            <Badge variant="secondary" className="ml-auto">
              {techData.multiCloudReliability.provider_count} Providers • {techData.multiCloudReliability.region_count} Regions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Provider Breakdown */}
            {Object.keys(techData.multiCloudReliability?.provider_breakdown || {}).length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Provider Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(techData.multiCloudReliability?.provider_breakdown || {}).map(([provider, data]: [string, any]) => (
                    <div key={provider} className="text-center p-4 border rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{data.percentage}%</div>
                      <div className="font-medium">{provider}</div>
                      <div className="text-sm text-gray-600">${(data.spend || 0).toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Geographic Distribution */}
            {(techData.multiCloudReliability?.geographic_distribution || []).length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Geographic Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(techData.multiCloudReliability?.geographic_distribution || []).slice(0, 8).map((region: any, index: number) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm">{region.region}</div>
                      <div className="text-xs text-gray-600">{region.provider}</div>
                      <div className="text-sm font-bold">${(region.spend || 0).toFixed(0)}</div>
                      <div className="text-xs text-gray-500">{region.services} services</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technology Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Technology Health Summary
            <Badge variant="secondary" className="ml-auto">
              Overall Score: {(techData.techExecutiveSummary?.overall_technology_score || 0).toFixed(1)}/10
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${getScoreColor(techData.techExecutiveSummary.cloud_native_score)}`}>
                {(techData.techExecutiveSummary?.cloud_native_score || 0).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Cloud-Native</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${getScoreColor(techData.techExecutiveSummary.reliability_score)}`}>
                {(techData.techExecutiveSummary?.reliability_score || 0).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Reliability</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${getScoreColor(techData.techExecutiveSummary.security_score)}`}>
                {(techData.techExecutiveSummary?.security_score || 0).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Security</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${getScoreColor(techData.techExecutiveSummary.governance_score)}`}>
                {(techData.techExecutiveSummary?.governance_score || 0).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Governance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ${(techData.cloudSecurityScore?.total_security_spend || 0).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Security Spend</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};