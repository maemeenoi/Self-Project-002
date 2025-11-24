import React from 'react';
import { DeploymentStats as DeploymentStatsType } from '@/types/dashboard';
import { Rocket, CheckCircle, AlertCircle, XCircle, Activity, TrendingUp } from 'lucide-react';

interface DeploymentStatsProps {
  data: DeploymentStatsType;
}

const DeploymentStats: React.FC<DeploymentStatsProps> = ({ data }) => {
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Rocket className="w-5 h-5 mr-2 text-blue-600" />
          Deployment Status
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-2 ${getHealthColor(data.productionHealth)}`}>
          {getHealthIcon(data.productionHealth)}
          <span>{data.productionHealth.charAt(0).toUpperCase() + data.productionHealth.slice(1)}</span>
        </div>
      </div>

      {/* This Week's Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{data.totalDeployments}</div>
          <div className="text-sm text-blue-700">Total Deployments</div>
        </div>

        <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className={`text-2xl font-bold ${getSuccessRateColor(data.successRate)}`}>
            {data.successRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-700">Success Rate</div>
        </div>

        <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="text-2xl font-bold text-red-600">{data.rollbacks}</div>
          <div className="text-sm text-red-700">Rollbacks</div>
        </div>

        <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{data.uptime.toFixed(1)}%</div>
          <div className="text-sm text-green-700">Uptime</div>
        </div>
      </div>

      {/* Feature Delivery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-green-900">Stories Deployed</div>
              <div className="text-sm text-green-700">This week</div>
            </div>
          </div>
          <span className="text-2xl font-bold text-green-600">{data.storiesDeployed}</span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-purple-900">Features Live</div>
              <div className="text-sm text-purple-700">In production</div>
            </div>
          </div>
          <span className="text-2xl font-bold text-purple-600">{data.featuresLive}</span>
        </div>
      </div>

      {/* Production Health Indicator */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Production Health</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                data.productionHealth === 'healthy' ? 'bg-green-500' : 
                data.productionHealth === 'degraded' ? 'bg-orange-500' : 'bg-red-500'
              } animate-pulse`} />
              <span className="text-sm text-gray-600">
                {data.productionHealth === 'healthy' ? 'All systems operational' :
                 data.productionHealth === 'degraded' ? 'Minor issues detected' : 'System down'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Uptime bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Uptime (30 days)</span>
            <span className="text-xs font-medium text-gray-700">{data.uptime.toFixed(2)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                data.uptime >= 99.5 ? 'bg-green-500' : 
                data.uptime >= 99 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(data.uptime, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentStats;
