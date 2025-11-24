/**
 * Widget 4: Financial Alerts
 * Detect cost spikes (>20% increase)
 */

import React from 'react';
import { WidgetProps, FinancialAlert } from '@/types/cfoDashboard';
import { 
  formatCurrency, 
  formatPercentWithSign, 
  getAlertSeverity, 
  getAlertColor 
} from '@/utils/cfoFormatters';

const FinancialAlerts: React.FC<WidgetProps<FinancialAlert[]>> = ({ 
  data, 
  loading = false, 
  error = null 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Financial Alerts</h3>
        <div className="text-center py-8">
          <p className="text-red-600 mb-2 font-semibold">Error loading data</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // Filter alerts for significant increases (>= 20%)
  const significantAlerts = data?.filter(alert => alert.growth_percent >= 20) || [];

  // Sort by growth percentage (descending)
  const sortedAlerts = [...significantAlerts].sort((a, b) => b.growth_percent - a.growth_percent);

  // Format date for display
  const formatAlertDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-150 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-blue-800">Financial Alerts</h3>
        <div className="text-sm text-gray-500">
          {sortedAlerts.length} alert{sortedAlerts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Alerts List */}
      {sortedAlerts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-blue-600 font-semibold mb-2">No alerts - costs are stable</p>
          <p className="text-sm text-gray-500 mt-1">
            No cost spikes detected (≥20% increase)
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAlerts.map((alert, index) => {
            const severity = getAlertSeverity(alert.growth_percent);
            const colors = getAlertColor(severity);
            
            return (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${colors.bg} ${colors.border} hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  {/* Alert Info */}
                  <div className="flex-1">
                    <div className={`font-medium ${colors.text}`}>
                      {formatAlertDate(alert.period)}
                    </div>
                    <div className={`text-sm ${colors.text} font-semibold`}>
                      {formatPercentWithSign(alert.growth_percent)} spike
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatCurrency(alert.prev_cost)} → {formatCurrency(alert.total_cost)}
                    </div>
                  </div>

                  {/* Severity Badge */}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${colors.text} ${colors.bg} border ${colors.border}`}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </div>
                </div>

                {/* Cost Increase Visualization */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Cost Increase</span>
                    <span>{formatCurrency(alert.total_cost - alert.prev_cost)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        severity === 'high' ? 'bg-red-500' : 
                        severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(alert.growth_percent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alert Summary */}
      {sortedAlerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600">Highest Spike</div>
              <div className="text-lg font-bold text-red-600">
                {formatPercentWithSign(Math.max(...sortedAlerts.map(a => a.growth_percent)))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Impact</div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(
                  sortedAlerts.reduce((sum, alert) => sum + (alert.total_cost - alert.prev_cost), 0)
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Threshold Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600">
          <span className="font-medium">Alert Threshold:</span> Showing cost increases ≥20%. 
          Monitor these spikes to identify optimization opportunities.
        </div>
      </div>
    </div>
  );
};

export default FinancialAlerts;
