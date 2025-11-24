import React from 'react';
import { CustomerImpact } from '@/types/costOptimizationDashboard';
import { DollarSign, Users, TrendingUp, Target, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CustomerImpactWidgetProps {
  data: CustomerImpact;
}

const CustomerImpactWidget: React.FC<CustomerImpactWidgetProps> = ({ data }) => {
  const totalSavings = data.savingsByCategory.compute + data.savingsByCategory.storage + 
                      data.savingsByCategory.database + data.savingsByCategory.other;

  const getPercentage = (value: number) => {
    return ((value / totalSavings) * 100).toFixed(0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatLargeCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return formatCurrency(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Customer Impact & Savings Delivered
        </h3>
        <div className="text-sm text-green-600 font-medium">
          Core Value Delivered
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {formatCurrency(data.totalSavings)}
          </div>
          <div className="text-sm font-medium text-green-800">Total Customer Savings</div>
          <div className="text-xs text-green-600">This Month</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {data.averageSavingsPercent}%
          </div>
          <div className="text-sm font-medium text-blue-800">Average % Savings</div>
          <div className="text-xs text-blue-600">per Customer</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {data.activeCustomers}
          </div>
          <div className="text-sm font-medium text-purple-800">Active Customers</div>
          <div className="text-xs text-purple-600">Under Management</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-1">
            {formatLargeCurrency(data.cloudSpendManaged)}
          </div>
          <div className="text-sm font-medium text-orange-800">Cloud Spend Managed</div>
          <div className="text-xs text-orange-600">per Month</div>
        </div>
      </div>

      {/* Monthly Savings Trend Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-1" />
          Monthly Savings Trend (Last 6 Months)
        </h4>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '4px' 
                }}
                labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                formatter={(value: number) => [formatCurrency(value), 'Savings']}
              />
              <Line 
                type="monotone" 
                dataKey="savings" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Savings Categories */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
          <PieChart className="w-4 h-4 mr-1" />
          Top Savings Categories This Month
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Compute optimization</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(data.savingsByCategory.compute)}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                ({getPercentage(data.savingsByCategory.compute)}%)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Storage cleanup</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(data.savingsByCategory.storage)}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                ({getPercentage(data.savingsByCategory.storage)}%)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Database rightsizing</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(data.savingsByCategory.database)}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                ({getPercentage(data.savingsByCategory.database)}%)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Other optimizations</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(data.savingsByCategory.other)}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                ({getPercentage(data.savingsByCategory.other)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-4">
          <div className="flex h-3 rounded-lg overflow-hidden bg-gray-200">
            <div 
              className="bg-green-500"
              style={{ width: `${getPercentage(data.savingsByCategory.compute)}%` }}
            />
            <div 
              className="bg-blue-500"
              style={{ width: `${getPercentage(data.savingsByCategory.storage)}%` }}
            />
            <div 
              className="bg-purple-500"
              style={{ width: `${getPercentage(data.savingsByCategory.database)}%` }}
            />
            <div 
              className="bg-orange-500"
              style={{ width: `${getPercentage(data.savingsByCategory.other)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerImpactWidget;
