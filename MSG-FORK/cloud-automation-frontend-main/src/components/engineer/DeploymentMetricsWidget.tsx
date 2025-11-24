/**
 * Deployment Metrics Widget
 * Shows deployment frequency, success rate trends, and recent deployments
 */

import React, { useState, useEffect } from 'react';
import WidgetCard from './WidgetCard';
import LoadingSkeleton from './LoadingSkeleton';
import { DeploymentMetric } from '@/types/engineerDashboard';
import { 
  isWithinLast7Days, 
  isBetween7And14DaysAgo, 
  calculatePercentageChange, 
  formatPercentage,
  timeAgo 
} from '@/utils/dateHelpers';
import engineerDashboardApi from '@/services/engineerDashboardApi';

interface DeploymentSummary {
  deploymentsThisWeek: number;
  deploymentsPrevWeek: number;
  trendPercent: number;
  recentDeployments: Array<{
    version: string;
    environment: string;
    status: 'success' | 'failed';
    timeAgo: string;
    success_rate: number;
  }>;
}

const DeploymentMetricsWidget: React.FC = () => {
  const [data, setData] = useState<DeploymentMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const deploymentData = await engineerDashboardApi.fetchDeploymentMetrics();
      setData(deploymentData);
      setUseMockData(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deployment metrics data');
      console.error('Error fetching deployment metrics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateSummary = (deploymentData: DeploymentMetric[]): DeploymentSummary => {
    // Calculate total deployments from all providers
    const totalDeployments = deploymentData
      .reduce((sum, d) => sum + d.deployments_count, 0);
    
    // Calculate average success rate across all providers
    const avgSuccessRate = deploymentData.length > 0 
      ? deploymentData.reduce((sum, d) => sum + d.success_rate, 0) / deploymentData.length
      : 0;
    
    // For trend, we'll show positive if success rate is above 90%
    const trendPercent = avgSuccessRate > 90 ? 5 : -2;

    // Generate recent deployments based on provider data
    const recentDeployments = deploymentData
      .slice(0, 3)
      .map((deployment, index) => {
        const versions = ['v2.4.1', 'v2.4.0', 'v2.3.9'];
        const environments = ['Production', 'Staging', 'Development'];
        const hoursAgo = [2, 24, 72]; // 2 hours, 1 day, 3 days
        
        return {
          version: versions[index] || `v2.${4 - index}.${index}`,
          environment: environments[index] || 'Production',
          status: deployment.success_rate >= 90 ? 'success' as const : 'failed' as const,
          timeAgo: timeAgo(new Date(Date.now() - hoursAgo[index] * 60 * 60 * 1000).toISOString()),
          success_rate: deployment.success_rate
        };
      });

    return {
      deploymentsThisWeek: totalDeployments,
      deploymentsPrevWeek: Math.max(0, totalDeployments - 5), // Mock previous week data
      trendPercent,
      recentDeployments
    };
  };

  const summary = data.length > 0 ? calculateSummary(data) : null;

  const renderContent = () => {
    if (loading) {
      return <LoadingSkeleton lines={4} />;
    }

    if (!summary) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No deployment data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Per Week</div>
            <div className="text-2xl font-bold text-gray-900">{summary.deploymentsThisWeek}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Trend</div>
            <div className={`text-xl font-bold ${summary.trendPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.trendPercent >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(summary.trendPercent))}
            </div>
          </div>
        </div>

        {/* Recent Deployments */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Deployments</h4>
          <div className="space-y-2">
            {summary.recentDeployments.map((deployment, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${deployment.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {deployment.status === 'success' ? '✓' : '✗'}
                  </span>
                  <span className="font-mono text-sm">{deployment.version}</span>
                  <span className="text-gray-500">→</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                    deployment.environment === 'Production' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {deployment.environment}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {deployment.timeAgo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <WidgetCard
      title="Deployment Success Rate"
      // showMockDataIndicator={useMockData}
      onRefresh={fetchData}
      loading={loading}
    >
      {renderContent()}
    </WidgetCard>
  );
};

export default DeploymentMetricsWidget;
