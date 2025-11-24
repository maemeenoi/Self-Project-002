'use client';

import React from 'react';
import { ExecutiveKPI } from '@/types/cfoDashboard';
import { formatCurrencyExecutive, formatLargeNumber } from '@/utils/ceoFormatters';

interface ExecutiveKPISummaryProps {
  data: ExecutiveKPI | null;
  loading?: boolean;
  selectedProvider?: string;
}

const ExecutiveKPISummary: React.FC<ExecutiveKPISummaryProps> = ({ 
  data, 
  loading, 
  selectedProvider = 'all' 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Executive KPI Summary</h2>
          <p className="text-sm text-gray-500 mt-1">Key performance indicators at a glance</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="text-center p-6 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-blue-800">Executive KPI Summary</h2>
          <p className="text-sm text-gray-500 mt-1">Key performance indicators at a glance</p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-500">No KPI data available</p>
        </div>
      </div>
    );
  }

  // Get provider display name
  const getProviderDisplayName = (provider: string) => {
    const names = {
      'azure': 'Microsoft Azure',
      'aws': 'Amazon Web Services', 
      'gcp': 'Google Cloud Platform',
      'all': 'All Cloud Providers'
    };
    return names[provider as keyof typeof names] || 'All Providers';
  };

  // CFO KPIs using CEO backend data structure
  const kpiMetrics = [
    {
      id: 'total_cost',
      label: 'Total Cost',
      value: formatCurrencyExecutive(data.total_cost),
      subtext: `${getProviderDisplayName(selectedProvider)} costs`,
      color: 'bg-blue-50 border-blue-200',
      valueColor: 'text-blue-900'
    },
    {
      id: 'cost_trend',
      label: 'Cost Trend',
      value: `${data.cost_trend >= 0 ? '+' : ''}${data.cost_trend.toFixed(1)}%`,
      subtext: 'Month over month change',
      color: data.cost_trend >= 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200',
      valueColor: data.cost_trend >= 0 ? 'text-red-900' : 'text-blue-900'
    },
    {
      id: 'total_deployments',
      label: 'Deployments',
      value: formatLargeNumber(data.total_deployments),
      subtext: 'Total deployments',
      color: 'bg-blue-50 border-blue-200',
      valueColor: 'text-blue-900'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-blue-800">Executive KPI Summary</h2>
        <p className="text-sm text-gray-500 mt-1">Key financial performance indicators</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiMetrics.map((kpi) => (
          <div 
            key={kpi.id} 
            className={`relative p-6 rounded-lg border-2 ${kpi.color} hover:shadow-md transition-shadow`}
          >
            {/* Content */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">{kpi.label}</h3>
              <p className={`text-2xl font-bold ${kpi.valueColor} mb-1`}>{kpi.value}</p>
              <p className="text-xs text-gray-500">{kpi.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Provider Context */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Current View: {getProviderDisplayName(selectedProvider)}</span>
          <span>Financial Performance Overview</span>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveKPISummary;