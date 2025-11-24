import React from 'react';
import { CloudCostPerUser } from '@/types/focusedPODashboard';
import { DollarSign, Users, TrendingUp, TrendingDown } from 'lucide-react';

interface CloudCostPerUserWidgetProps {
  data: CloudCostPerUser;
}

const CloudCostPerUserWidget: React.FC<CloudCostPerUserWidgetProps> = ({ data }) => {
  const getTrendIcon = () => {
    if (data.trend > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (data.trend < 0) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return null;
  };

  const getTrendColor = () => {
    // For cost per user, negative trend (decreasing cost) is good
    if (data.trend < 0) return 'text-green-600';
    if (data.trend > 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTargetStatus = () => {
    if (data.costPerUser <= data.target) return 'success';
    if (data.costPerUser <= data.target * 1.2) return 'warning';
    return 'danger';
  };

  return (
    <div className="widget-card">
      <h2 className="widget-title flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-600" />
        Cloud Cost per Active User
      </h2>
      
      <div className="cost-breakdown">
        <div className="cost-metric text-center mb-4">
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="currency text-2xl font-bold text-gray-600">$</span>
            <span className="amount text-4xl font-bold text-gray-900">
              {data.costPerUser.toFixed(2)}
            </span>
            <span className="period text-lg text-gray-600">/user/month</span>
          </div>
          
          <div className="user-count text-sm text-gray-600 mb-2">
            {data.activeUsers.toLocaleString()} active users
          </div>
          
          <div className={`cost-trend flex items-center justify-center gap-1 text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>
              {data.trend > 0 ? '+' : ''}{data.trend.toFixed(1)}% vs last month
            </span>
          </div>
        </div>

        {/* Target Comparison */}
        <div className="target-section mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Target</span>
            <span className="text-sm font-medium text-gray-900">
              ${data.target.toFixed(2)}/user
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                getTargetStatus() === 'success' ? 'bg-green-500' :
                getTargetStatus() === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ 
                width: `${Math.min((data.target / data.costPerUser) * 100, 100)}%` 
              }}
            />
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            {data.costPerUser <= data.target ? 'On Target ✅' : 
             `$${(data.costPerUser - data.target).toFixed(2)} over target`}
          </div>
        </div>

        {/* Cost Breakdown */}
        {data.breakdown && (
          <div className="breakdown-section">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Cost Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Compute</span>
                <span className="font-medium">${data.breakdown.compute.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Storage</span>
                <span className="font-medium">${data.breakdown.storage.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Network</span>
                <span className="font-medium">${data.breakdown.network.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Data Source */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-800 font-medium mb-1">
            📊 Calculation
          </div>
          <div className="text-xs text-blue-700">
            Total Monthly Cost ÷ Active Users
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudCostPerUserWidget;
