import React from 'react';
import { OurCloudCost } from '@/types/costOptimizationDashboard';
import { Cloud, DollarSign, Lightbulb, TrendingUp } from 'lucide-react';

interface OurCloudCostWidgetProps {
  data: OurCloudCost;
}

const OurCloudCostWidget: React.FC<OurCloudCostWidgetProps> = ({ data }) => {
  const totalOptimizationSavings = data.optimizations.reduce((sum, opt) => sum + opt.savings, 0);
  const budgetUsagePercent = (data.current / data.budget) * 100;
  
  const getPercentage = (value: number) => {
    return ((value / data.current) * 100).toFixed(0);
  };

  const getBarWidth = (value: number) => {
    return (value / data.current) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBudgetStatusColor = () => {
    if (budgetUsagePercent <= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (budgetUsagePercent <= 85) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Cloud className="w-5 h-5 mr-2 text-orange-600" />
            Our Cloud Infrastructure Cost
          </h3>
          <p className="text-sm text-gray-600 mt-1">Practice what we preach</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getBudgetStatusColor()}`}>
          {budgetUsagePercent.toFixed(0)}% of budget
        </div>
      </div>

      {/* Budget Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Monthly Budget Usage</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(data.current)} / {formatCurrency(data.budget)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full ${
              budgetUsagePercent <= 70 ? 'bg-green-500' : 
              budgetUsagePercent <= 85 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
          />
        </div>
        
        <div className="text-xs text-gray-500">
          Remaining: {formatCurrency(data.budget - data.current)}
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Cost Breakdown</h4>
        
        {/* Stacked Bar Chart */}
        <div className="mb-4">
          <div className="flex h-6 rounded-lg overflow-hidden bg-gray-100">
            <div 
              className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${getBarWidth(data.breakdown.compute)}%` }}
            >
              {getPercentage(data.breakdown.compute)}%
            </div>
            <div 
              className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${getBarWidth(data.breakdown.storage)}%` }}
            >
              {getPercentage(data.breakdown.storage)}%
            </div>
            <div 
              className="bg-purple-500 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${getBarWidth(data.breakdown.database)}%` }}
            >
              {getPercentage(data.breakdown.database)}%
            </div>
            <div 
              className="bg-orange-500 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${getBarWidth(data.breakdown.other)}%` }}
            >
              {getPercentage(data.breakdown.other)}%
            </div>
          </div>
        </div>

        {/* Breakdown Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-2 rounded bg-blue-50">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Compute</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(data.breakdown.compute)} ({getPercentage(data.breakdown.compute)}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-green-50">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Storage</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(data.breakdown.storage)} ({getPercentage(data.breakdown.storage)}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-purple-50">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Database</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(data.breakdown.database)} ({getPercentage(data.breakdown.database)}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-orange-50">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Other</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(data.breakdown.other)} ({getPercentage(data.breakdown.other)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Cost Efficiency Metrics */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Cost Efficiency</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <div className="text-lg font-bold text-gray-900">{formatCurrency(data.efficiency.costPerCustomer)}</div>
            <div className="text-xs text-gray-600">per customer served</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <div className="text-lg font-bold text-gray-900">${data.efficiency.costPerThousandSavings}</div>
            <div className="text-xs text-gray-600">per $1K savings delivered</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <div className="text-lg font-bold text-gray-900">{data.efficiency.costAsPercentRevenue}%</div>
            <div className="text-xs text-gray-600">of revenue</div>
          </div>
        </div>
      </div>

      {/* Our Own Optimization Opportunities */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h4 className="text-sm font-medium text-yellow-900">Our Own Optimization Opportunities</h4>
        </div>
        
        <div className="space-y-2 mb-3">
          {data.optimizations.map((optimization, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-yellow-800">{optimization.description}</span>
              <span className="font-medium text-yellow-900">
                Save {formatCurrency(optimization.savings)}/mo
              </span>
            </div>
          ))}
        </div>
        
        <div className="pt-2 border-t border-yellow-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-900">Potential Monthly Savings:</span>
            <span className="text-lg font-bold text-yellow-900">
              {formatCurrency(totalOptimizationSavings)}/mo
            </span>
          </div>
          <div className="text-xs text-yellow-700 mt-1">
            Would reduce our costs by {((totalOptimizationSavings / data.current) * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurCloudCostWidget;
