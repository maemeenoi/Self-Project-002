/**
 * Widget 5: Budget Tracking & Forecasting
 * Shows current spend vs budget with forecast
 */

import React from 'react';
import { WidgetProps, CostTrendItem, BudgetInfo } from '@/types/cfoDashboard';
import { 
  formatCurrency, 
  formatPercent, 
  getBudgetStatus, 
  getBudgetStatusColor 
} from '@/utils/cfoFormatters';

const BudgetTracking: React.FC<WidgetProps<CostTrendItem[]>> = ({ 
  data, 
  loading = false, 
  error = null 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Budget Tracking</h3>
        <div className="text-center py-8">
          <p className="text-red-600 mb-2 font-semibold">Error loading data</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate budget information
  const calculateBudgetInfo = (costTrend: CostTrendItem[]): BudgetInfo => {
    if (!costTrend || costTrend.length === 0) {
      return {
        currentSpend: 0,
        budget: 50000, // Default budget
        remaining: 50000,
        percentUsed: 0,
        status: 'on-track'
      };
    }

    // Get current month spend (latest data point)
    const currentSpend = costTrend[costTrend.length - 1]?.total_cost || 0;
    
    // Set budget (in real app, this would come from API or config)
    const budget = 50000; // $50,000 monthly budget
    
    const remaining = Math.max(budget - currentSpend, 0);
    const percentUsed = (currentSpend / budget) * 100;
    const status = getBudgetStatus(percentUsed);

    return {
      currentSpend,
      budget,
      remaining,
      percentUsed,
      status
    };
  };

  const budgetInfo = calculateBudgetInfo(data || []);

  // Calculate forecast based on trend
  const calculateForecast = (costTrend: CostTrendItem[]): string => {
    if (!costTrend || costTrend.length < 2) return 'Insufficient data';

    const recent = costTrend.slice(-2);
    const growth = ((recent[1].total_cost - recent[0].total_cost) / recent[0].total_cost) * 100;

    if (budgetInfo.percentUsed >= 100) return 'Over budget';
    if (budgetInfo.percentUsed >= 95) return 'At risk';
    if (growth > 10) return 'Trending up';
    if (growth < -5) return 'Trending down';
    return 'On track';
  };

  const forecast = calculateForecast(data || []);

  // Get progress bar color
  const getProgressBarColor = (percentUsed: number): string => {
    if (percentUsed >= 100) return 'bg-red-500';
    if (percentUsed >= 95) return 'bg-red-400';
    if (percentUsed >= 80) return 'bg-yellow-500';
    return 'bg-blue-600';
  };

  return (
    <div className="bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-150 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-800">Budget Tracking</h3>
      </div>

      {/* Current Spend vs Budget */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Current Spend</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(budgetInfo.currentSpend)} / {formatCurrency(budgetInfo.budget)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(budgetInfo.percentUsed)}`}
            style={{ width: `${Math.min(budgetInfo.percentUsed, 100)}%` }}
          ></div>
        </div>

        {/* Percentage Used */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {formatPercent(budgetInfo.percentUsed)} used
          </span>
          <span className={`text-sm font-medium ${getBudgetStatusColor(budgetInfo.status)}`}>
            {budgetInfo.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </div>

      {/* Budget Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Remaining</div>
          <div className={`text-lg font-bold ${budgetInfo.remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(budgetInfo.remaining)}
          </div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600 mb-1">Forecast</div>
          <div className="text-lg font-bold text-blue-900">
            {forecast}
          </div>
        </div>
      </div>

      {/* Budget Status Alert */}
      {budgetInfo.percentUsed >= 80 && (
        <div className={`p-3 rounded-lg mb-4 ${
          budgetInfo.percentUsed >= 100 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className={`text-sm ${
            budgetInfo.percentUsed >= 100 ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {budgetInfo.percentUsed >= 100 ? (
              <>
                <span className="font-semibold">Budget Exceeded:</span> You've spent{' '}
                {formatCurrency(budgetInfo.currentSpend - budgetInfo.budget)} over budget this month.
              </>
            ) : (
              <>
                <span className="font-semibold">Budget Warning:</span> You've used{' '}
                {formatPercent(budgetInfo.percentUsed)} of your monthly budget.
              </>
            )}
          </div>
        </div>
      )}

      {/* Monthly Trend (if data available) */}
      {data && data.length >= 2 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Recent Trend</div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">
              Previous: {formatCurrency(data[data.length - 2]?.total_cost || 0)}
            </span>
            <span className="text-sm text-gray-900">
              Current: {formatCurrency(data[data.length - 1]?.total_cost || 0)}
            </span>
          </div>
          {data.length >= 2 && (
            <div className="text-xs text-gray-500 mt-1 text-center">
              {(() => {
                const prev = data[data.length - 2]?.total_cost || 0;
                const curr = data[data.length - 1]?.total_cost || 0;
                const change = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
                const isIncrease = change > 0;
                return (
                  <span className={isIncrease ? 'text-red-600' : 'text-green-600'}>
                    {isIncrease ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs last period
                  </span>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetTracking;
