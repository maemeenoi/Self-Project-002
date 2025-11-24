'use client';

import React from 'react';
import { SavingsSummary } from '@/types/ceoDashboard';
import { 
  formatCurrencyExecutive, 
  formatCurrencyDetailed, 
  calculateAnnualProjection, 
  calculateRevenueEquivalent,
  formatPercentWithSign
} from '@/utils/ceoFormatters';
import { DollarSign, TrendingUp, Zap, CheckCircle, TrendingDown } from 'lucide-react';

interface RevenueImpactAnalysisProps {
  data: SavingsSummary | null;
  loading?: boolean;
}

const RevenueImpactAnalysis: React.FC<RevenueImpactAnalysisProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="ceo-card-pro">
        <div className="ceo-card-header">
          <h2 className="ceo-card-title">Revenue Impact Analysis</h2>
          <p className="ceo-card-subtitle">Cost savings translated to business impact</p>
        </div>
        
        <div className="space-y-6 animate-pulse">
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
          
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 bg-gray-50 rounded-lg">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
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
          <h2 className="ceo-card-title">Revenue Impact Analysis</h2>
          <p className="ceo-card-subtitle">Cost savings translated to business impact</p>
        </div>
        
        <div className="text-center py-12">
          <DollarSign size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No savings data available</p>
        </div>
      </div>
    );
  }

  const annualSavings = calculateAnnualProjection(data.total_savings);
  const revenueEquivalent = calculateRevenueEquivalent(annualSavings);

  return (
    <div className="ceo-card-pro">
      {/* Header */}
      <div className="ceo-card-header">
        <h2 className="ceo-card-title">Revenue Impact Analysis</h2>
        <p className="ceo-card-subtitle">Cost savings translated to business impact</p>
      </div>

      {/* Main Savings Display */}
      <div className="text-center mb-8 p-6 bg-white rounded-xl border-2 border-blue-200">
        <div className="mb-4 flex justify-center">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <TrendingDown size={32} className="text-blue-600" />
          </div>
        </div>
        <div className="mb-2">
          <div className="text-5xl font-bold text-blue-700 mb-2">
            {formatCurrencyExecutive(data.total_savings)}
          </div>
          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">Monthly Savings</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-lg border border-blue-200">
          <CheckCircle size={16} className="text-blue-700" />
          <span className="text-sm font-semibold text-blue-700">
            {formatPercentWithSign(data.savings_percent)} cost reduction
          </span>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="space-y-4">
        {/* Annual Impact */}
        <div className="p-5 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Annual Impact</h3>
                <p className="text-xs text-gray-500">Projected yearly savings</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrencyExecutive(annualSavings)}
              </div>
              <div className="text-xs text-gray-500">
                {formatCurrencyDetailed(annualSavings)}/year
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Equivalent */}
        <div className="p-5 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                <DollarSign size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Revenue Equivalent</h3>
                <p className="text-xs text-gray-500">At 25% profit margin</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrencyExecutive(revenueEquivalent)}
              </div>
              <div className="text-xs text-gray-500">
                in revenue impact
              </div>
            </div>
          </div>
        </div>

        {/* Cost Efficiency */}
        <div className="p-5 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <Zap size={20} className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Cost Efficiency</h3>
                <p className="text-xs text-gray-500">Effective vs list cost</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrencyExecutive(data.total_effective_cost)}
              </div>
              <div className="text-xs text-gray-500">
                vs {formatCurrencyExecutive(data.total_list_cost)} list
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg flex-shrink-0">
              <TrendingUp size={16} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">Executive Summary</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Our cost optimization efforts are saving <strong>{formatCurrencyExecutive(data.total_savings)}/month</strong>, 
                equivalent to generating <strong>{formatCurrencyExecutive(revenueEquivalent)}</strong> in additional revenue annually.
                This represents a <strong>{data.savings_percent?.toFixed(1)}%</strong> improvement in cost efficiency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueImpactAnalysis;
