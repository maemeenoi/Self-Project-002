/**
 * Widget 3: Savings Summary Card
 * Shows total savings (ListCost vs EffectiveCost)
 */

import React from 'react';
import { WidgetProps, SavingsSummary } from '@/types/cfoDashboard';
import { formatCurrency, formatPercent } from '@/utils/cfoFormatters';

const SavingsSummaryCard: React.FC<WidgetProps<SavingsSummary>> = ({ 
  data, 
  loading = false, 
  error = null 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-36"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Savings Summary</h3>
        <div className="text-center py-8">
          <p className="text-red-600 mb-2 font-semibold">Error loading data</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Savings Summary</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No savings data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-150 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-800">Savings Summary</h3>
      </div>

      {/* Main Savings Display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-blue-700 mb-2">
          {formatCurrency(data?.total_savings)}
        </div>
        <div className="text-sm text-gray-600 mb-4">Total Savings</div>
        
        {/* Savings Percentage Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {formatPercent(data?.savings_percent)} saved
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">List Cost:</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(data?.total_list_cost)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Effective Cost:</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(data?.total_effective_cost)}
          </span>
        </div>
      </div>

      {/* Savings Visualization */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Savings Rate</span>
          <span>{formatPercent(data?.savings_percent)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(data?.savings_percent || 0, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SavingsSummaryCard;
