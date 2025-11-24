import React from 'react';
import { ProductPerformance } from '@/types/costOptimizationDashboard';
import { Zap, Target, Clock, Users, PieChart } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface OptimizationEngineWidgetProps {
  data: ProductPerformance;
}

const OptimizationEngineWidget: React.FC<OptimizationEngineWidgetProps> = ({ data }) => {
  // Prepare pie chart data
  const pieData = [
    { name: 'Compute', value: data.recommendationBreakdown.compute, color: '#3B82F6' },
    { name: 'Storage', value: data.recommendationBreakdown.storage, color: '#10B981' },
    { name: 'Database', value: data.recommendationBreakdown.database, color: '#8B5CF6' },
    { name: 'Network', value: data.recommendationBreakdown.network, color: '#F59E0B' }
  ];

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getAdoptionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-600" />
          Optimization Engine Performance
        </h3>
        <div className="text-sm text-blue-600 font-medium">
          Product Analytics
        </div>
      </div>

      {/* Core Performance Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {data.recommendationsGenerated}
          </div>
          <div className="text-sm font-medium text-blue-800">Recommendations Generated</div>
          <div className="text-xs text-blue-600">This Month</div>
        </div>

        <div className={`rounded-lg p-4 text-center border ${getSuccessRateColor(data.implementationSuccessRate)}`}>
          <div className="text-2xl font-bold mb-1">
            {data.implementationSuccessRate}%
          </div>
          <div className="text-sm font-medium">Implementation Success Rate</div>
          <div className="text-xs">Above Target</div>
        </div>
      </div>

      {/* Time to Realise Savings & Adoption */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-green-900">Avg Time to Realise Savings</span>
              <div className="text-xs text-green-700">Days from recommendation</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">{data.avgTimeToRealizeSavings}</div>
            <div className="text-xs text-green-600">days</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-purple-900">Customer Adoption Rate</span>
              <div className="text-xs text-purple-700">Recommendations accepted</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${getAdoptionColor(data.customerAdoptionRate)}`}>
              {data.customerAdoptionRate}%
            </div>
            <div className="text-xs text-purple-600">adoption</div>
          </div>
        </div>
      </div>

      {/* Recommendation Categories */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
          <PieChart className="w-4 h-4 mr-1" />
          Recommendation Categories (This Month)
        </h4>
        
        <div className="flex items-center space-x-6">
          {/* Pie Chart */}
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Percentage']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {data.recommendationBreakdown.compute + data.recommendationBreakdown.storage}%
              </div>
              <div className="text-xs text-gray-600">Infrastructure Focus</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {data.recommendationBreakdown.database + data.recommendationBreakdown.network}%
              </div>
              <div className="text-xs text-gray-600">Service Optimization</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationEngineWidget;
