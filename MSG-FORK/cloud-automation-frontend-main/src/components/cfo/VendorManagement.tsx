/**
 * Widget 6: Vendor Management
 * Shows costs by Publisher/Vendor
 */

import React from 'react';
import { WidgetProps, VendorCost } from '@/types/cfoDashboard';
import { formatCurrency, calculatePercentage, formatPercent } from '@/utils/cfoFormatters';

const VendorManagement: React.FC<WidgetProps<VendorCost[]>> = ({ 
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
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
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Vendor Management</h3>
        <div className="text-center py-8">
          <p className="text-red-600 mb-2 font-semibold">Error loading data</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Vendor Management</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No vendor data available</p>
        </div>
      </div>
    );
  }

  // Sort vendors by cost (descending)
  const sortedVendors = [...data].sort((a, b) => (b?.amount || 0) - (a?.amount || 0));
  
  // Calculate total cost for percentage calculations
  const totalCost = sortedVendors.reduce((sum, vendor) => sum + (vendor?.amount || 0), 0);

  return (
    <div className="bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-150 p-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-blue-800 mb-6">Vendor Management</h3>

      {/* Vendor List */}
      <div className="space-y-4">
        {sortedVendors.map((vendor, index) => {
          const percentage = vendor?.percentage || 0;
          
          return (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              {/* Vendor Info */}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{vendor?.vendor || 'Unknown Vendor'}</div>
                <div className="text-sm text-gray-500">{formatPercent(percentage)} of total</div>
              </div>

              {/* Cost and Percentage */}
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(vendor?.amount)}
                </div>
                
                {/* Visual percentage bar */}
                <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">Total Vendor Costs</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(totalCost)}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Across {sortedVendors.length} vendor{sortedVendors.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Top Vendor Highlight */}
      {sortedVendors.length > 0 && sortedVendors[0] && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <span className="font-medium">{sortedVendors[0]?.vendor || 'Unknown Vendor'}</span> is your largest vendor, 
            representing <span className="font-medium">
              {formatPercent(sortedVendors[0]?.percentage || 0)}
            </span> of total costs.
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
