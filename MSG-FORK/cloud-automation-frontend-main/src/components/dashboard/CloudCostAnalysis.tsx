import React from 'react';
import { CloudCost } from '@/types/cloudDashboard';
import { DollarSign, TrendingUp, Lightbulb } from 'lucide-react';

interface CloudCostAnalysisProps {
  data: CloudCost;
}

const CloudCostAnalysis: React.FC<CloudCostAnalysisProps> = ({ data }) => {
  const totalOptimizationSavings = data.optimizations.reduce((sum, opt) => sum + opt.savings, 0);
  
  const getPercentage = (value: number) => {
    return ((value / data.current) * 100).toFixed(0);
  };

  const getBarWidth = (value: number) => {
    return (value / data.current) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
          Cloud Cost Analysis
        </h3>
        <div className="flex items-center space-x-2 text-sm text-orange-600">
          <TrendingUp className="w-4 h-4" />
          <span>{data.trend}</span>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly Breakdown</h4>
        
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
              ${data.breakdown.compute.toLocaleString()} ({getPercentage(data.breakdown.compute)}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-green-50">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Storage</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              ${data.breakdown.storage.toLocaleString()} ({getPercentage(data.breakdown.storage)}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-purple-50">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Database</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              ${data.breakdown.database.toLocaleString()} ({getPercentage(data.breakdown.database)}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-orange-50">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Other</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              ${data.breakdown.other.toLocaleString()} ({getPercentage(data.breakdown.other)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Cost Efficiency Metrics */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Cost Efficiency</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <div className="text-lg font-bold text-gray-900">${data.costEfficiency.perDeployment}</div>
            <div className="text-xs text-gray-600">per deployment</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <div className="text-lg font-bold text-gray-900">${data.costEfficiency.perStory}</div>
            <div className="text-xs text-gray-600">per story</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <div className="text-lg font-bold text-gray-900">${data.costEfficiency.perUser}</div>
            <div className="text-xs text-gray-600">per active user</div>
          </div>
        </div>
      </div>

      {/* Optimization Opportunities */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h4 className="text-sm font-medium text-yellow-900">Optimization Opportunities</h4>
        </div>
        
        <div className="space-y-2 mb-3">
          {data.optimizations.map((optimization, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-yellow-800">{optimization.description}</span>
              <span className="font-medium text-yellow-900">
                Save ${optimization.savings.toLocaleString()}/mo
              </span>
            </div>
          ))}
        </div>
        
        <div className="pt-2 border-t border-yellow-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-900">Total Potential Savings:</span>
            <span className="text-lg font-bold text-yellow-900">
              ${totalOptimizationSavings.toLocaleString()}/mo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudCostAnalysis;
