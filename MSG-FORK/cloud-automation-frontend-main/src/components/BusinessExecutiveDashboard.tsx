'use client'

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Zap,
  BarChart3,
  Shield,
  Clock,
  Gauge,
  Building2,
  Rocket,
  Globe,
  AlertTriangle,
  ArrowRight,
  Activity,
  PieChart,
  Loader2,
  RefreshCw,
  Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DRSData {
  executiveSummary: any;
  revenueImpact: any;
  timeToMarket: any;
  operatingEfficiency: any;
  marketAgility: any;
  strategicInitiatives: any;
  financialImpact: any;
  competitiveAdvantages: any;
  riskMitigation: any;
  transformationImpact: any;
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
    outline: 'border border-gray-300 text-gray-700'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};

const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full ${className}`}>
    <div 
      className="bg-blue-600 h-full rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export const BusinessExecutiveDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [drsData, setDrsData] = useState<DRSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Check if user has executive access (CEO, CFO only)
  const hasExecutiveAccess = () => {
    if (!isAuthenticated || !user) return false;
    
    const executiveRoles = ['CEO', 'CFO'];
    const userRoleNames = user.roles?.map(role => role.name) || [];
    const primaryRoleName = user.primaryRole?.name || '';
    
    const allRoles = [...userRoleNames, primaryRoleName].filter(Boolean);
    
    return executiveRoles.some(role => 
      allRoles.includes(role as any) || 
      allRoles.some(userRole => userRole.toLowerCase().includes(role.toLowerCase()))
    );
  };

  // Fetch DRS data from all endpoints
  const fetchDRSData = async (showRefreshLoader = false) => {
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

      // Fetch all DRS endpoints in parallel
      const endpoints = [
        'executive-summary',
        'revenue-impact', 
        'time-to-market',
        'operating-efficiency',
        'market-agility',
        'strategic-initiatives',
        'financial-impact',
        'competitive-advantages',
        'risk-mitigation',
        'transformation-impact'
      ];

      const responses = await Promise.allSettled(
        endpoints.map(endpoint => 
          fetch(`${baseUrl}/api/drs/${endpoint}?company_id=${companyId}`, { headers })
            .then(res => res.json())
        )
      );

      // Extract successful responses
      const extractData = (result: PromiseSettledResult<any>) => 
        result.status === 'fulfilled' && result.value?.success ? result.value.data : null;

      const drs: DRSData = {
        executiveSummary: extractData(responses[0]) || { revenue_impact: 0, cost_savings_percent: 0, global_regions: 0, active_initiatives: 0 },
        revenueImpact: extractData(responses[1]) || { cloud_enabled_revenue: 0, baseline_revenue: 0, growth_percent: 0, currency: 'NZD' },
        timeToMarket: extractData(responses[2]) || { current_ttm_days: 0, baseline_ttm_days: 90, improvement_percent: 0 },
        operatingEfficiency: extractData(responses[3]) || { efficiency_percent: 0, improvement_delta: 0, annual_savings: 0, current_cost: 0, baseline_cost: 0, currency: 'NZD' },
        marketAgility: extractData(responses[4]) || { agility_score: 0, score_delta: 0, max_score: 10, components: { delivery_responsiveness: 0, release_cadence: 0, cloud_flexibility: 0 }, metrics: { avg_cycle_time_hours: 0, monthly_features: 0, regions: 0, services: 0 } },
        strategicInitiatives: extractData(responses[5]) || { initiatives: [], total_count: 0, high_impact_count: 0 },
        financialImpact: extractData(responses[6]) || { total_business_value: 0, three_year_roi_percent: 0, payback_period_months: 'N/A', annual_savings: 0, total_investment: 0, currency: 'NZD' },
        competitiveAdvantages: extractData(responses[7]) || { advantages: [] },
        riskMitigation: extractData(responses[8]) || { risk_areas: [] },
        transformationImpact: extractData(responses[9]) || { transformation_outcomes: [], overall_transformation_score: 0 }
      };

      setDrsData(drs);
      
    } catch (err) {
      console.error('Error fetching DRS data:', err);
      setError('Failed to load executive dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch AI-powered transformation insights
  const fetchAIInsights = async () => {
    if (!user?.organizationId) return;
    
    try {
      setAiLoading(true);
      
      const companyId = user.organizationId || '1';
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const response = await fetch(
        `${baseUrl}/api/drs/transformation-insights-ai?company_id=${companyId}&analysis_depth=comprehensive`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAiInsights(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (hasExecutiveAccess()) {
      fetchDRSData();
    }
  }, [user]);

  // Auto-fetch AI insights after DRS data is loaded
  useEffect(() => {
    if (drsData && !aiInsights && !aiLoading) {
      fetchAIInsights();
    }
  }, [drsData]);

  // Access control check
  if (!isAuthenticated || !hasExecutiveAccess()) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="text-center py-12">
          <CardContent>
            <Lock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Business Executive Access Required</h2>
            <p className="text-gray-600 mb-4">
              This Business Executive Dashboard is restricted to CEO and CFO roles only.
            </p>
            <p className="text-sm text-gray-500">
              {!isAuthenticated 
                ? "Please log in with business executive credentials." 
                : `Your current role (${user?.primaryRole?.name || 'Unknown'}) does not have access to this dashboard.`
              }
            </p>
            <p className="text-xs text-gray-400 mt-3">
              Technology leaders (CTO, CIO, CISO) will have access to the dedicated Technology Executive Dashboard.
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
          <span>Loading Executive Dashboard...</span>
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
                  onClick={() => fetchDRSData()}
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

  if (!drsData) return null;

  // Business KPIs from real DRS data
  const businessKPIs = [
    {
      title: 'Revenue Impact',
      value: `$${(drsData.revenueImpact.cloud_enabled_revenue / 1000).toFixed(1)}K`,
      change: `${drsData.revenueImpact.growth_percent > 0 ? '+' : ''}${drsData.revenueImpact.growth_percent.toFixed(1)}%`,
      trend: drsData.revenueImpact.growth_percent >= 0 ? 'up' : 'down',
      icon: DollarSign,
      description: 'Annual revenue enabled by cloud capabilities'
    },
    {
      title: 'Time to Market',
      value: `${drsData.timeToMarket.improvement_percent.toFixed(0)}%`,
      change: 'Faster',
      trend: drsData.timeToMarket.improvement_percent > 0 ? 'up' : 'down',
      icon: Rocket,
      description: `${drsData.timeToMarket.current_ttm_days} vs ${drsData.timeToMarket.baseline_ttm_days} days baseline`
    },
    {
      title: 'Operating Efficiency',
      value: `${drsData.operatingEfficiency.efficiency_percent.toFixed(1)}%`,
      change: `${drsData.operatingEfficiency.improvement_delta > 0 ? '+' : ''}${drsData.operatingEfficiency.improvement_delta.toFixed(1)}%`,
      trend: drsData.operatingEfficiency.efficiency_percent > 0 ? 'up' : 'down',
      icon: Gauge,
      description: `$${drsData.operatingEfficiency.annual_savings.toFixed(0)} annual savings`
    },
    {
      title: 'Market Agility',
      value: `${drsData.marketAgility.agility_score.toFixed(1)}/10`,
      change: `${drsData.marketAgility.score_delta > 0 ? '+' : ''}${drsData.marketAgility.score_delta.toFixed(1)}`,
      trend: drsData.marketAgility.score_delta >= 0 ? 'up' : 'down',
      icon: Zap,
      description: 'Ability to respond to market changes'
    }
  ];

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

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'strong':
      case 'active': 
      case 'protected':
      case 'compliant': 
      case 'inprogress': return 'bg-green-500';
      case 'moderate':
      case 'growing': return 'bg-blue-500';
      case 'developing':
      case 'planning': return 'bg-yellow-500';
      case 'at risk': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength.toLowerCase()) {
      case 'strong': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'moderate': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'developing': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Business Executive Dashboard</h2>
          <p className="text-muted-foreground">
            Strategic cloud benefits, ROI, and competitive advantages • Company: {user?.organizationName}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-600">
            {user?.primaryRole?.name || 'Executive'}
          </Badge>
          <button
            onClick={() => fetchDRSData(true)}
            disabled={refreshing}
            className="flex items-center space-x-1 px-3 py-1 text-sm border rounded hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {renderKPICards(businessKPIs)}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Strategic Cloud Initiatives
              <Badge variant="secondary" className="ml-auto">
                {drsData.strategicInitiatives.high_impact_count} High Impact
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drsData.strategicInitiatives.initiatives.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No strategic initiatives found. Consider adding cloud transformation projects.
                </p>
              ) : (
                drsData.strategicInitiatives.initiatives.slice(0, 4).map((initiative: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-sm">{initiative.name}</h4>
                      <Badge className={getImpactColor(initiative.impact_level)}>
                        {initiative.impact_level} Impact
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Progress: {initiative.progress_percent}%</span>
                      <span>Value: {initiative.target_value > 0 ? `${initiative.target_value.toFixed(0)} ${initiative.value_unit}` : 'TBD'}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Owner: {initiative.owner}</span>
                      <span>Status: {initiative.status}</span>
                    </div>
                    <Progress value={initiative.progress_percent} className="h-2" />
                  </div>
                ))
              )}
              {drsData.strategicInitiatives.total_count > 4 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{drsData.strategicInitiatives.total_count - 4} more initiatives
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Financial Impact Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-lg font-bold text-green-600">
                  ${(drsData.financialImpact.total_business_value / 1000).toFixed(1)}K
                </div>
                <div className="text-xs text-muted-foreground">Total Business Value</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-lg font-bold text-blue-600">
                  {drsData.financialImpact.three_year_roi_percent.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">3-Year ROI</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-lg font-bold text-purple-600">
                  {typeof drsData.financialImpact.payback_period_months === 'number' 
                    ? `${drsData.financialImpact.payback_period_months.toFixed(1)}m` 
                    : drsData.financialImpact.payback_period_months}
                </div>
                <div className="text-xs text-muted-foreground">Payback Period</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                <Activity className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-lg font-bold text-orange-600">
                  ${drsData.financialImpact.annual_savings.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">Annual Savings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Rocket className="h-5 w-5 mr-2" />
              Competitive Advantages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drsData.competitiveAdvantages.advantages.map((advantage: any, index: number) => (
                <div key={index} className="border border-border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">{advantage.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {advantage.score}/10
                      </Badge>
                      <Badge className={getStrengthColor(advantage.strength)}>
                        {advantage.strength}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{advantage.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Business Risk Mitigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drsData.riskMitigation.risk_areas.map((risk: any, index: number) => (
                <div key={index} className="border border-border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">{risk.area}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {risk.score}/10
                      </Badge>
                      <Badge className={getStatusColor(risk.mitigation_level)}>
                        {risk.mitigation_level}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{risk.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Business Transformation Impact
            <Badge variant="secondary" className="ml-auto">
              {drsData.transformationImpact.overall_transformation_score}/10 Overall Score
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {drsData.transformationImpact.transformation_outcomes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Transformation impact data is being calculated. Please check back shortly.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {drsData.transformationImpact.transformation_outcomes.map((outcome: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="mb-4">
                    {outcome.outcome === 'Speed to Market' && <Zap className="h-12 w-12 mx-auto text-blue-500" />}
                    {outcome.outcome === 'Global Reach' && <Globe className="h-12 w-12 mx-auto text-green-500" />}
                    {outcome.outcome === 'Cost Optimisation' && <PieChart className="h-12 w-12 mx-auto text-purple-500" />}
                  </div>
                  <h3 className="font-semibold mb-2">{outcome.outcome}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{outcome.description}</p>
                  <div className="flex items-center justify-center text-green-600">
                    <span className="text-lg font-bold">{outcome.value}</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Trend: {outcome.trend}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance metrics summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Cloud Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{drsData.executiveSummary.global_regions}</div>
              <div className="text-sm text-muted-foreground">Global Regions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {drsData.marketAgility.metrics.services}
              </div>
              <div className="text-sm text-muted-foreground">Cloud Services</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {drsData.marketAgility.metrics.monthly_features}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Features</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {drsData.marketAgility.metrics.avg_cycle_time_hours > 0 
                  ? `${(drsData.marketAgility.metrics.avg_cycle_time_hours / 24).toFixed(1)}d`
                  : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Avg Cycle Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI-Powered Strategic Insights */}
      {aiInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Rocket className="h-5 w-5 mr-2" />
                AI-Powered Strategic Insights
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Activity className="h-4 w-4 mr-1" />
                Confidence: {Math.round((aiInsights.ai_insights?.ai_confidence_score || 0) * 100)}%
              </div>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {aiInsights.ai_insights?.executive_summary}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Strategic Recommendations */}
              {aiInsights.ai_insights?.strategic_recommendations && aiInsights.ai_insights.strategic_recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Strategic Recommendations
                  </h3>
                  <div className="space-y-3">
                    {aiInsights.ai_insights.strategic_recommendations.map((rec: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{rec.action}</span>
                          <Badge 
                            variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                          >
                            {rec.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.rationale}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Expected: {rec.expected_outcome}</span>
                          <span>Timeline: {rec.timeline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Insights */}
              {aiInsights.ai_insights?.transformation_insights && aiInsights.ai_insights.transformation_insights.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Business Impact Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiInsights.ai_insights.transformation_insights.slice(0, 4).map((insight: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          {insight.category === 'Speed to Market' && <Clock className="h-4 w-4 mr-2 text-blue-500" />}
                          {insight.category === 'Global Reach' && <Globe className="h-4 w-4 mr-2 text-green-500" />}
                          {insight.category === 'Cost Optimisation' && <DollarSign className="h-4 w-4 mr-2 text-purple-500" />}
                          {insight.category === 'Innovation' && <Rocket className="h-4 w-4 mr-2 text-orange-500" />}
                          {insight.category === 'Risk Management' && <Shield className="h-4 w-4 mr-2 text-red-500" />}
                          <span className="font-medium text-sm">{insight.category}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{insight.insight}</p>
                        <p className="text-xs font-medium text-gray-800">{insight.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Metrics */}
              {aiInsights.ai_insights?.success_indicators && aiInsights.ai_insights.success_indicators.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Gauge className="h-4 w-4 mr-2" />
                    Success Indicators
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {aiInsights.ai_insights.success_indicators.map((indicator: any, index: number) => (
                      <div key={index} className="text-center p-3 border rounded-lg">
                        <div className="text-lg font-bold text-blue-600 mb-1">{indicator.target}</div>
                        <div className="text-sm font-medium mb-1">{indicator.metric}</div>
                        <div className="text-xs text-gray-500">{indicator.timeframe}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Loading State */}
      {aiLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Generating AI-powered strategic insights...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};