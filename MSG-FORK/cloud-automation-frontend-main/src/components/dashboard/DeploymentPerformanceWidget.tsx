import React from 'react';
import { DeploymentPerformance } from '@/types/focusedPODashboard';
import { Zap, CheckCircle, Package, Clock } from 'lucide-react';

interface DeploymentPerformanceWidgetProps {
  data: DeploymentPerformance;
}

const DeploymentPerformanceWidget: React.FC<DeploymentPerformanceWidgetProps> = ({ data }) => {
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTimeToMarketColor = (weeks: number) => {
    if (weeks <= 2) return 'text-green-600';
    if (weeks <= 3) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-gray-500" />
          <h3>Feature Delivery Performance</h3>
        </div>
      </div>

      <div className="performance-metrics grid grid-cols-2 gap-4">
        {/* Deployments per Week */}
        <div className="metric-item text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{data.deploymentsPerWeek}</div>
          <div className="text-sm text-blue-700">Deployments/Week</div>
        </div>

        {/* Success Rate */}
        <div className="metric-item text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className={`text-2xl font-bold ${getSuccessRateColor(data.successRate)}`}>
            {data.successRate}%
          </div>
          <div className="text-sm text-green-700">Success Rate</div>
        </div>

        {/* Features Shipped */}
        <div className="metric-item text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-center mb-2">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">{data.featuresShipped}</div>
          <div className="text-sm text-purple-700">Features This Month</div>
        </div>

        {/* Time to Market */}
        <div className="metric-item text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div className={`text-2xl font-bold ${getTimeToMarketColor(data.timeToMarket)}`}>
            {data.timeToMarket}w
          </div>
          <div className="text-sm text-orange-700">Time to Market</div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="widget-footer mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className={`font-semibold ${getSuccessRateColor(data.successRate)}`}>
              {data.successRate >= 95 ? 'Excellent' : data.successRate >= 90 ? 'Good' : 'Needs Focus'}
            </div>
            <div className="text-gray-600">Deployment Health</div>
          </div>
          <div className="text-center">
            <div className={`font-semibold ${getTimeToMarketColor(data.timeToMarket)}`}>
              {data.timeToMarket <= 2 ? 'Fast' : data.timeToMarket <= 3 ? 'Average' : 'Slow'}
            </div>
            <div className="text-gray-600">Delivery Speed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentPerformanceWidget;
