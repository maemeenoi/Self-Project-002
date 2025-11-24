'use client';

import React from 'react';
import { SavingsSummary } from '@/types/productOwnerDashboard';
import { formatCurrency, formatCompactCurrency, getCustomerValueMessage } from '@/utils/productOwnerFormatters';

interface CustomerSavingsCardProps {
  data: SavingsSummary | null;
  loading?: boolean;
}

const CustomerSavingsCard: React.FC<CustomerSavingsCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="widget-card">
        <div className="animate-pulse">
          <div className="widget-header">
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
          
          <div className="text-center mb-6">
            <div className="h-12 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
          </div>

          <div className="space-y-4">
            <div className="h-8 bg-gray-300 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="widget-card">
        <div className="widget-header">
          <h3 className="widget-title">Customer Savings This Month</h3>
        </div>
        
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">💰</div>
          <p className="text-gray-500">No savings data available</p>
          <p className="text-sm text-gray-400">Configure financial integrations to see customer savings</p>
        </div>
      </div>
    );
  }

  const monthlySavings = data.total_savings || 0;
  const annualProjection = monthlySavings * 12;
  const customerValueMessage = getCustomerValueMessage(monthlySavings);
  const savingsPercent = data.savings_percent || 0;

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h3 className="widget-title">Customer Savings This Month</h3>
      </div>
      
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-blue-700 mb-2">
          {formatCompactCurrency(monthlySavings)}
        </div>
        <div className="text-gray-600">This Month</div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-center">
        <span className="text-blue-800 font-semibold">Customer Value Delivered</span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Annual Projection:</span>
          <span className="font-semibold text-gray-900">{formatCompactCurrency(annualProjection)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Savings Rate:</span>
          <span className="font-semibold text-blue-700">{savingsPercent.toFixed(1)}%</span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Impact:</h4>
        <ul className="space-y-2">
          <li className="flex items-center text-sm text-gray-700">
            <span className="text-blue-600 mr-2">✓</span>
            Lower customer costs
          </li>
          <li className="flex items-center text-sm text-gray-700">
            <span className="text-blue-600 mr-2">✓</span>
            Improved margins
          </li>
          <li className="flex items-center text-sm text-gray-700">
            <span className="text-blue-600 mr-2">✓</span>
            Competitive advantage
          </li>
        </ul>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <span className="text-sm text-gray-600">{customerValueMessage}</span>
      </div>
    </div>
  );
};

export default CustomerSavingsCard;

