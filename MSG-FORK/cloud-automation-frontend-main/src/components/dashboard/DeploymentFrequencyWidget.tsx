import React from 'react';
import { DeploymentFrequency } from '@/types/focusedPODashboard';
import { Rocket, TrendingUp, TrendingDown, Target } from 'lucide-react';

interface DeploymentFrequencyWidgetProps {
  data: DeploymentFrequency;
}

const DeploymentFrequencyWidget: React.FC<DeploymentFrequencyWidgetProps> = ({ data }) => {
  const getTrendIcon = () => {
    if (data.trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (data.trend < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  const getTrendColor = () => {
    if (data.trend > 0) return 'trend-up';
    if (data.trend < 0) return 'trend-down';
    return 'trend-stable';
  };

  const getTargetStatus = () => {
    if (data.target && data.deploymentsPerWeek >= data.target) return 'success';
    if (data.target && data.deploymentsPerWeek >= data.target * 0.8) return 'warning';
    return 'danger';
  };

  return (
    <div className="widget-card">
      <h2 className="widget-title flex items-center gap-2">
        <Rocket className="w-5 h-5 text-blue-600" />
        Deployment Frequency
      </h2>
      
      <div className="frequency-metrics">
        <div className="primary-metric mb-4">
          <div className="metric-value text-4xl font-bold text-gray-900 mb-1">
            {data.deploymentsPerWeek}
          </div>
          <div className="metric-label text-gray-600">
            Deployments/Week
          </div>
        </div>
        
        <div className="trend-indicator mb-4">
          <span className={`${getTrendColor()} text-sm font-medium flex items-center gap-1`}>
            {getTrendIcon()}
            {data.trend > 0 ? '+' : ''}{data.trend}% vs last week
          </span>
          <div className="text-xs text-gray-500 mt-1">
            Last week: {data.lastWeek} deployments
          </div>
        </div>

        {data.target && (
          <div className="target-comparison">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Target className="w-4 h-4" />
                Target
              </span>
              <span className="text-sm font-medium text-gray-900">
                {data.target}/week
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  getTargetStatus() === 'success' ? 'bg-green-500' :
                  getTargetStatus() === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min((data.deploymentsPerWeek / data.target) * 100, 100)}%` 
                }}
              />
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              {((data.deploymentsPerWeek / data.target) * 100).toFixed(0)}% of target
            </div>
          </div>
        )}

        {/* Calculation Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-800 font-medium mb-1">
            📊 Data Source
          </div>
          <div className="text-xs text-blue-700">
            GitHub Actions deployments (last 7 days)
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentFrequencyWidget;
