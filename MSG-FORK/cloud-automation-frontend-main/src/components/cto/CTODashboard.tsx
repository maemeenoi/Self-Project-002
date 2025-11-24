'use client';

import React, { useState, useEffect } from 'react';
import ctoApi from '../../services/ctoApi';
import type { RecentActivity, DeploymentMetric, SystemMetrics } from '../../services/ctoApi';

// Helper functions for formatting and calculations
const formatDuration = (hours: number): string => {
  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours.toFixed(0)}h`;
  }
};

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  }
};

const getQualityBadgeColor = (score: string | number): string => {
  if (typeof score === 'string') {
    if (score.includes('A')) return 'high';
    if (score.includes('B')) return 'medium';
    return 'low';
  }
  if (score >= 90) return 'high';
  if (score >= 70) return 'medium';
  return 'low';
};

// Type definitions
interface TeamMetric {
  team: string;
  velocity: number;
  completed_tasks: number;
  avg_cycle_time: number;
  quality_score: string;
}

const CTODashboard: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Dashboard data state
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [deploymentMetrics, setDeploymentMetrics] = useState<DeploymentMetric[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetric[]>([]);
  const [technicalDebt, setTechnicalDebt] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const tabs = [
    { id: "dashboard", name: "Dashboard" },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [activity, deployments] = await Promise.all([
        ctoApi.getRecentActivity(20),
        ctoApi.getDeploymentMetrics()
      ]);

      setRecentActivity(activity);
      setDeploymentMetrics(deployments);
      
      // Calculate derived metrics
      const sysMetrics = ctoApi.calculateSystemMetrics(deployments, activity);
      setSystemMetrics(sysMetrics);
      
      const teamPerf = ctoApi.calculateTeamMetrics(deployments);
      setTeamMetrics(teamPerf);
      
      const debt = ctoApi.calculateTechnicalDebt(deployments);
      setTechnicalDebt(debt);
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CTO dashboard data');
      console.error('Error fetching CTO dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getSystemStatus = () => {
    if (!systemMetrics) return { status: 'Unknown', color: 'text-gray-600' };
    
    if (systemMetrics.uptime_percentage >= 99.5) {
      return { status: 'All Systems Operational', color: 'text-blue-600' };
    } else if (systemMetrics.uptime_percentage >= 95) {
      return { status: 'Minor Issues', color: 'text-yellow-600' };
    } else {
      return { status: 'Service Degraded', color: 'text-red-600' };
    }
  };

  const getQualityBadgeColor = (score: string) => {
    if (score.startsWith('A')) return 'bg-green-100 text-green-800';
    if (score.startsWith('B')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const getRecentDeployments = () => {
    return recentActivity
      .filter(activity => 
        activity.item_type.toLowerCase().includes('deploy') ||
        activity.item_type.toLowerCase().includes('release') ||
        activity.status.toLowerCase() === 'deployed'
      )
      .slice(0, 4);
  };

  const systemStatus = getSystemStatus();
  const recentDeployments = getRecentDeployments();
  const totalDeployments = deploymentMetrics.reduce((sum, metric) => sum + metric.deployments_count, 0);
  const avgSuccessRate = deploymentMetrics.length > 0 
    ? deploymentMetrics.reduce((sum, metric) => sum + metric.success_rate, 0) / deploymentMetrics.length 
    : 0;

  if (loading) {
    return (
      <div className="cto-dashboard space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading CTO Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Note: Removed error return to show static dashboard with fallback data instead of disappearing
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboardContent();
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => (
    <div className="cto-dashboard space-y-8">
      {/* Real System Status Banner */}
      <div className="bg-white border-2 border-blue-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-blue-800 font-semibold text-lg mb-2">
              {error ? 'Dashboard (Offline Mode)' : systemStatus.status}
            </h3>
            <p className="text-gray-600 text-sm">
              {error ? (
                <>Error loading live data - showing static view • Configure cloud services to see real metrics</>
              ) : (
                systemMetrics && (
                  <>
                    {systemMetrics.uptime_percentage}% uptime • 
                    {systemMetrics.deployments_today} deployments today • 
                    {systemMetrics.avg_response_time_ms}ms avg response time
                  </>
                )
              )}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button 
              className="btn btn-primary btn-sm"
              onClick={fetchAllData}
            >
              {error ? 'Configure Services' : 'Refresh Data'}
            </button>
            <span className="text-xs text-gray-500">
              {error ? 'Click to set up cloud connections' : `Last updated: ${lastUpdated.toLocaleTimeString()}`}
            </span>
          </div>
        </div>
      </div>

      {/* Real Top Metrics Row - 5 Cards with Real Data */}
      <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
        <div className="top-metrics-row">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Overall Success Rate</span>
              <span className="metric-badge">Deployments</span>
            </div>
            <div className="metric-value">
              {error ? '95' : avgSuccessRate.toFixed(1)}<span className="metric-unit">%</span>
            </div>
          <div className="metric-context">{error ? 'Sample deployment metric' : 'Based on deployment metrics'}</div>
          <div className="metric-trend">
            <span className="text-gray-600 text-sm">
              {error ? 'Sample data - configure services for real metrics' : 
               (avgSuccessRate >= 95 ? 'Excellent' : avgSuccessRate >= 85 ? 'Good' : 'Needs attention')}
            </span>
          </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Technical Debt</span>
              <span className="metric-badge">Hours</span>
            </div>
            <div className="metric-value">{error ? '15' : technicalDebt}<span className="metric-unit">h</span></div>
          <div className="metric-context">{error ? 'Sample estimation' : 'Estimated effort required'}</div>
          <div className="metric-trend">
            <span className="text-gray-600 text-sm">
              {error ? 'Sample data - configure services for real metrics' :
               (technicalDebt <= 10 ? 'Low debt' : technicalDebt <= 20 ? 'Manageable' : 'High debt')}
            </span>
          </div>
          </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Deployments</span>
            <span className="metric-badge">All Time</span>
          </div>
          <div className="metric-value">{error ? '24' : totalDeployments}</div>
          <div className="metric-context">{error ? 'Sample deployment count' : 'Across all providers'}</div>
          <div className="metric-trend">
            <span className="text-gray-600 text-sm">{error ? 'Sample data' : 'Cumulative'}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">System Uptime</span>
            <span className="metric-badge">Real-time</span>
          </div>
          <div className="metric-value">
            {error ? '99.8' : (systemMetrics ? systemMetrics.uptime_percentage : 0)}<span className="metric-unit">%</span>
          </div>
          <div className="metric-context">{error ? 'Sample uptime metric' : 'Based on deployment success'}</div>
          <div className="metric-trend">
            <span className="text-gray-600 text-sm">
              {error ? 'Sample data - configure services' : 
               (systemMetrics && systemMetrics.uptime_percentage >= 99.5 ? 'Excellent' : 'Monitor')}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Active Projects</span>
            <span className="metric-badge">Live</span>
          </div>
          <div className="metric-value">
            {error ? '8' : [...new Set(recentActivity.map(a => a.project_or_repo))].filter(p => p).length}
          </div>
          <div className="metric-context">{error ? 'Sample active projects' : 'Projects with recent activity'}</div>
          <div className="metric-trend">
            <span className="text-gray-600 text-sm">{error ? 'Sample data' : 'Tracking'}</span>
          </div>
        </div>
        </div>
      </section>

      {/* Row 1: Real Data 3-Column Layout */}
      <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
        <div className="dashboard-row">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real Team Capacity from Deployment Metrics */}
          <div className="widget-card">
            <h3 className="widget-title">Team Performance Overview</h3>
            
            <div className="capacity-overview mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Overall Team Velocity</span>
                <span className="text-xl font-bold text-blue-600">
                  {error ? '87' : avgSuccessRate.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
                     style={{ width: `${error ? 87 : Math.min(100, avgSuccessRate)}%` }}></div>
              </div>
              <span className="text-xs text-gray-600 mt-1 block">
                {error ? 'Sample performance data - configure services for real metrics' :
                 (avgSuccessRate >= 90 ? 'Optimal performance' : avgSuccessRate >= 75 ? 'Good performance' : 'Needs improvement')}
              </span>
            </div>

            <div className="capacity-breakdown">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Team Distribution</h4>
              
              {error ? (
                // Sample team data when there's an error
                [
                  { team: 'Frontend', completed_tasks: 12, velocity: 92 },
                  { team: 'Backend', completed_tasks: 8, velocity: 87 },
                  { team: 'DevOps', completed_tasks: 15, velocity: 95 }
                ].map((team, index) => (
                  <div key={team.team} className="capacity-item">
                    <div className="flex items-center justify-between mb-2">
                      <span className="team-name">{team.team} Team</span>
                      <span className="capacity-value">
                        {team.completed_tasks} deployments
                      </span>
                    </div>
                    <div className="capacity-bar">
                      <div className="bg-blue-500 h-full rounded transition-all duration-300" 
                           style={{width: `${Math.min(100, team.velocity)}%`}}></div>
                    </div>
                  </div>
                ))
              ) : (
                teamMetrics.slice(0, 3).map((team, index) => (
                  <div key={team.team} className="capacity-item">
                    <div className="flex items-center justify-between mb-2">
                      <span className="team-name">{team.team} Team</span>
                      <span className="capacity-value">
                        {team.completed_tasks} deployments
                      </span>
                    </div>
                    <div className="capacity-bar">
                      <div className="bg-blue-500 h-full rounded transition-all duration-300" 
                           style={{width: `${Math.min(100, team.velocity)}%`}}></div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="capacity-insights mt-4">
              {error ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
                    Sample data: 3 teams actively deploying - configure cloud services to see real metrics
                  </div>
                </>
              ) : (
                <>
                  {teamMetrics.some(t => t.velocity < 80) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2 text-sm text-gray-700">
                      Some teams showing low performance
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
                    {teamMetrics.length} teams actively deploying
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Real Technical Debt from Deployment Data */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Technical Debt Analysis</h3>
              <span className="debt-total">{error ? '15' : technicalDebt} hours</span>
            </div>
            
            <div className="space-y-3">
              {error ? (
                // Sample technical debt data
                [
                  { provider: 'AWS', debtHours: 8, priority: 'Medium' },
                  { provider: 'Azure', debtHours: 5, priority: 'Low' },
                  { provider: 'Infrastructure', debtHours: 2, priority: 'Low' }
                ].map((debt, index) => (
                  <div key={debt.provider} className="bg-white border border-blue-100 rounded-lg p-4 flex items-center justify-between hover:border-blue-200 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{debt.provider} Optimization</div>
                      <div className="text-sm text-gray-600">
                        Priority: {debt.priority}
                      </div>
                    </div>
                    <div className="text-blue-700 font-semibold text-lg">{debt.debtHours}h</div>
                  </div>
                ))
              ) : (
                <>
                  {deploymentMetrics.map((metric, index) => {
                    const debtHours = Math.round(metric.avg_cycle_time_hours);
                    
                    return (
                      <div key={metric.provider} className="bg-white border border-blue-100 rounded-lg p-4 flex items-center justify-between hover:border-blue-200 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{metric.provider} Optimization</div>
                          <div className="text-sm text-gray-600">
                            Priority: {debtHours > 10 ? 'High' : debtHours > 5 ? 'Medium' : 'Low'}
                          </div>
                        </div>
                        <div className="text-blue-700 font-semibold text-lg">{debtHours}h</div>
                      </div>
                    );
                  })}
                  
                  {deploymentMetrics.length === 0 && (
                    <div className="bg-white border border-blue-100 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">No deployment data</div>
                        <div className="text-sm text-gray-600">Info</div>
                      </div>
                      <div className="text-blue-700 font-semibold text-lg">0h</div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-700 mb-2">
                {error ? 'Sample data: No critical technical debt items - configure services for real analysis' :
                 (deploymentMetrics.filter(m => m.avg_cycle_time_hours > 10).length > 0 ? (
                   `${deploymentMetrics.filter(m => m.avg_cycle_time_hours > 10).length} high priority items requiring immediate attention`
                 ) : (
                   'No critical technical debt items'
                 ))
                }
              </div>
              <div className="text-xs text-gray-500">
                {error ? 'Sample analysis' : 'Based on cycle time analysis'}
              </div>
            </div>
          </div>

          {/* Real System Performance from Metrics */}
          <div className="widget-card">
            <h3 className="widget-title">System Performance</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600 flex-1">Overall Success Rate</span>
                <span className="text-blue-700 font-semibold mx-3">
                  {error ? '95.2' : avgSuccessRate.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 text-right min-w-[100px]">Target: &gt;95%</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600 flex-1">Avg Response Time</span>
                <span className="text-blue-700 font-semibold mx-3">
                  {error ? '145' : (systemMetrics ? systemMetrics.avg_response_time_ms : 0)}ms
                </span>
                <span className="text-xs text-gray-500 text-right min-w-[100px]">Target: &lt;200ms</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600 flex-1">Error Rate</span>
                <span className="text-blue-700 font-semibold mx-3">
                  {error ? '0.8' : (systemMetrics ? systemMetrics.error_rate_percentage.toFixed(2) : 0)}%
                </span>
                <span className="text-xs text-gray-500 text-right min-w-[100px]">Target: &lt;1%</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-600 flex-1">Active Teams</span>
                <span className="text-blue-700 font-semibold mx-3">{error ? '3' : teamMetrics.length}</span>
                <span className="text-xs text-gray-500 text-right min-w-[100px]">{error ? 'Sample teams' : 'Teams deploying'}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <div className="text-sm text-gray-600">
                Overall Health: <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-medium">
                  {error ? 'Sample Data' : 
                   (avgSuccessRate >= 95 ? 'Excellent' : avgSuccessRate >= 85 ? 'Good' : 'Needs Attention')}
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Row 2: Real Team Performance Data */}
      <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
        <div className="widget-card">
        <h3 className="widget-title">Team Performance </h3>
        
        {teamMetrics.length > 0 ? (
          <div className="team-performance-table">
            <div className="table-header">
              <div className="header-cell">Team</div>
              <div className="header-cell">Success Rate</div>
              <div className="header-cell">Deployments</div>
              <div className="header-cell">Avg Cycle Time</div>
              <div className="header-cell">Quality Score</div>
            </div>
            
            <div className="table-body">
              {teamMetrics.map((team) => (
                <div key={team.team} className="team-row">
                  <div className="team-cell">
                    <span className="team-name">{team.team} Team</span>
                    <span className="team-size">Active deployment team</span>
                  </div>
                  <div className="velocity-cell">
                    <div className="velocity-bar">
                      <div className="velocity-fill" style={{width: `${Math.min(100, team.velocity)}%`}}></div>
                    </div>
                    <span className="velocity-value">{team.velocity.toFixed(0)}%</span>
                  </div>
                  <div className="completed-cell">
                    <span className="completed-count">{team.completed_tasks} deployments</span>
                  </div>
                  <div className="cycle-time-cell">
                    <span className="cycle-time">{formatDuration(team.avg_cycle_time)}</span>
                  </div>
                  <div className="quality-cell">
                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-medium text-sm">
                      {team.quality_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="performance-insights">
              <div className="insight">
                {teamMetrics.find(t => t.velocity === Math.max(...teamMetrics.map(m => m.velocity)))?.team || 'No'} team leading in success rate
              </div>
              <div className="insight">
                {teamMetrics.filter(t => t.avg_cycle_time > 5).length} teams with cycle time &gt; 5h - investigate bottlenecks
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No team performance data available</p>
            <p className="text-sm text-gray-400">Deploy some projects to see team metrics</p>
          </div>
        )}
        </div>
      </section>

      {/* Row 3: Enhanced 2-Column Layout */}
      <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
        <div className="dashboard-row">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real Architecture & Innovation Pipeline from Deployment Data */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Architecture & Innovation Pipeline</h3>
              <p className="pipeline-summary">
                {deploymentMetrics.length} active initiatives • Based on deployment metrics
              </p>
              {/* Legend for status symbols */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                <span>✓ Completed</span>
                <span>• In Progress</span>
                <span>○ Pending</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {deploymentMetrics.length > 0 ? (
                deploymentMetrics.map((metric, index) => {
                  const progress = Math.round(metric.success_rate);
                  const statusText = metric.success_rate >= 95 ? 'Ahead of Schedule' : 
                                   metric.success_rate >= 85 ? 'On Track' : 'Needs Attention';
                  
                  return (
                    <div key={metric.provider} className="bg-white border-l-4 border-blue-500 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-base">{metric.provider} Platform Optimization</h4>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-md font-semibold text-sm">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Optimizing {metric.provider} deployment pipeline - {metric.deployments_count} deployments completed
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500">Avg Cycle Time: {metric.avg_cycle_time_hours.toFixed(1)}h</span>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">{statusText}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200">✓ Infrastructure Setup</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200">✓ Pipeline Configuration</span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${metric.success_rate >= 85 ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {metric.success_rate >= 85 ? '✓' : '•'} Deployment Optimization
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${metric.success_rate >= 95 ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {metric.success_rate >= 95 ? '✓' : '○'} Performance Tuning
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No deployment initiatives found</p>
                  <p className="text-sm text-gray-400">Start deploying to see pipeline metrics</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Recent Deployments & Innovation Metrics */}
          <div className="space-y-6">
            {/* Real Recent Deployments from API */}
            <div className="widget-card">
              <div className="widget-header">
                <h3 className="widget-title">Recent Deployments </h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-medium">
                  Deployment health: {avgSuccessRate >= 95 ? 'Excellent' : avgSuccessRate >= 85 ? 'Good' : 'Needs Attention'}
                </span>
              </div>
              
              {recentActivity.length > 0 ? (
                <div className="deployment-list">
                  {recentActivity.slice(0, 6).map((activity: RecentActivity, index: number) => (
                    <div key={index} className={`deployment-item ${activity.status?.toLowerCase() || 'unknown'}`}>
                      <div className="deployment-info">
                        <span className="version">{activity.title || 'Unknown Activity'}</span>
                        <span className={`environment ${activity.provider?.toLowerCase() || 'unknown'}`}>
                          {activity.provider || 'Unknown Provider'}
                        </span>
                        <span className="deployer">{activity.item_type || 'Unknown Type'}</span>
                      </div>
                      <span className="deployment-time">
                        {activity.created_at ? formatTimeAgo(activity.created_at) : 'Unknown time'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent deployments found</p>
                  <p className="text-sm text-gray-400">Start deploying to see deployment history</p>
                </div>
              )}
              
              <div className="deployment-stats">
                <div className="stat">
                  <span className="stat-label">Success Rate</span>
                  <span className="stat-value">{avgSuccessRate.toFixed(0)}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Avg Lead Time</span>
                  <span className="stat-value">
                    {deploymentMetrics.length > 0 
                      ? Math.round(deploymentMetrics.reduce((sum, m) => sum + m.avg_lead_time_hours, 0) / deploymentMetrics.length) + 'h'
                      : '0h'
                    }
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total Deployments</span>
                  <span className="stat-value">{totalDeployments}</span>
                </div>
              </div>
            </div>

            {/* Real Innovation Metrics from Deployment Data */}
            <div className="widget-card">
              <h3 className="widget-title">Innovation Metrics </h3>
              
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-blue-600 mb-1">
                  {deploymentMetrics.length}
                </div>
                <div className="text-sm text-gray-600">Active Platforms</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-lg p-3 text-center border border-blue-200">
                  <div className="text-lg font-bold">
                    {deploymentMetrics.filter(m => m.success_rate >= 90).length}
                  </div>
                  <div className="text-xs">High Performance</div>
                </div>
                <div className="bg-white text-gray-700 rounded-lg p-3 text-center border border-blue-100">
                  <div className="text-lg font-bold">
                    {deploymentMetrics.filter(m => m.success_rate < 90 && m.success_rate >= 75).length}
                  </div>
                  <div className="text-xs">Optimizing</div>
                </div>
              </div>
              
              <div className="mt-3 text-center">
                <span className="text-xs text-gray-500">Innovation pipeline health:</span>
                <span className="text-xs font-bold ml-1 text-blue-700">
                  {avgSuccessRate >= 90 ? 'Excellent' : avgSuccessRate >= 75 ? 'Good' : 'Needs Attention'}
                </span>
              </div>
              
              {deploymentMetrics.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No innovation metrics available</p>
                  <p className="text-gray-400 text-xs">Deploy projects to see metrics</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CTODashboard;
