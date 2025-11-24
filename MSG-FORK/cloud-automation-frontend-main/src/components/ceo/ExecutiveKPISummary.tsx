'use client';

import React from 'react';
import { ExecutiveKPI } from '@/types/ceoDashboard';
import { formatCurrencyExecutive, formatLargeNumber } from '@/utils/ceoFormatters';
import { DollarSign, TrendingUp, TrendingDown, Rocket, CheckCircle, BarChart3 } from 'lucide-react';

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
      <div className="ceo-card-pro">
        <div className="ceo-card-header">
          <h2 className="ceo-card-title">Executive KPI Summary</h2>
          <p className="ceo-card-subtitle">Key performance indicators at a glance</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-6 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ceo-card-pro">
        <div className="ceo-card-header">
          <h2 className="ceo-card-title">Executive KPI Summary</h2>
          <p className="ceo-card-subtitle">Key performance indicators at a glance</p>
        </div>
        
        <div className="text-center py-12">
          <BarChart3 size={48} className="mx-auto mb-3 text-gray-300" />
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

  // Financial KPIs (provider-specific)
  const financialKPIs = [
    {
      id: 'total_cost',
      icon: DollarSign,
      label: 'Total Spend',
      value: formatCurrencyExecutive(data.total_cost),
      subtext: `${getProviderDisplayName(selectedProvider)} costs`
    },
    {
      id: 'cost_trend',
      icon: data.cost_trend >= 0 ? TrendingUp : TrendingDown,
      label: 'Cost Trend',
      value: `${data.cost_trend >= 0 ? '+' : ''}${data.cost_trend.toFixed(1)}%`,
      subtext: 'Month over month'
    }
  ];

  // Development KPIs (always global)
  const developmentKPIs = [
    {
      id: 'deployments',
      icon: Rocket,
      label: 'Deployments',
      value: formatLargeNumber(data.total_deployments),
      subtext: 'Overall dev workflow'
    },
    {
      id: 'success_rate',
      icon: CheckCircle,
      label: 'Success Rate',
      value: `${data.deployment_success_rate.toFixed(1)}%`,
      subtext: 'Development pipeline'
    }
  ];

  return (
    <div className="ceo-card-pro">
      {/* Header */}
      <div className="ceo-card-header">
        <h2 className="ceo-card-title">Executive KPI Summary</h2>
        <p className="ceo-card-subtitle">Key performance indicators at a glance</p>
      </div>

      {/* Financial Metrics Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Financial Metrics</h3>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
            {getProviderDisplayName(selectedProvider)}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {financialKPIs.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.id}
                className="bg-white border border-blue-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg border border-blue-100">
                    <Icon size={20} />
                  </div>
                </div>
                <div className="mb-1">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {kpi.label}
                  </h4>
                </div>
                <div className="mb-1">
                  <div className="text-2xl font-bold text-blue-700">
                    {kpi.value}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {kpi.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Development Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Development Metrics</h3>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
            Overall Performance
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {developmentKPIs.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.id}
                className="bg-white border border-blue-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg border border-blue-100">
                    <Icon size={20} />
                  </div>
                </div>
                <div className="mb-1">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {kpi.label}
                  </h4>
                </div>
                <div className="mb-1">
                  <div className="text-2xl font-bold text-blue-700">
                    {kpi.value}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {kpi.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with explanation */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg flex-shrink-0">
              <BarChart3 size={16} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">Metrics Explanation</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Financial metrics</strong> are filtered by your selected cloud provider and show costs specific to that platform. 
                <strong> Development metrics</strong> represent overall workflow performance across all projects and are not provider-specific 
                since development processes are cross-platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveKPISummary;
