/**
 * Widget 7: Resource Allocation
 * Shows costs by Resource and Location
 */

import React from 'react';
import { WidgetProps, ResourceAllocation } from '@/types/cfoDashboard';
import { formatCurrency, truncateResourceId } from '@/utils/cfoFormatters';

const ResourceAllocationWidget: React.FC<WidgetProps<ResourceAllocation[]>> = ({ 
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
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
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
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Resource Allocation</h3>
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
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Resource Allocation</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No resource data available</p>
        </div>
      </div>
    );
  }

  // Sort resources by cost (descending) and take top 10
  const sortedResources = [...data]
    .sort((a, b) => (b?.used || 0) - (a?.used || 0))
    .slice(0, 10);
  
  // Calculate total cost
  const totalCost = sortedResources.reduce((sum, resource) => sum + (resource?.used || 0), 0);

  return (
    <div className="bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-150 p-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-blue-800 mb-6">Resource Allocation</h3>

      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-200 text-sm font-medium text-gray-500">
        <div>Resource Type</div>
        <div>Allocated</div>
        <div>Used</div>
        <div className="text-right">Usage %</div>
      </div>

      {/* Resource List */}
      <div className="space-y-0">
        {sortedResources.map((resource, index) => (
          <div 
            key={index} 
            className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
          >
            {/* Resource Type */}
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900">
                {resource?.resource || 'Unknown Resource'}
              </span>
            </div>

            {/* Allocated */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600">
                {formatCurrency(resource?.allocated || 0)}
              </span>
            </div>

            {/* Used */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600">
                {formatCurrency(resource?.used || 0)}
              </span>
            </div>

            {/* Usage Percentage */}
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">
                {resource?.percentage?.toFixed(1) || '0.0'}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div></div>
          <div className="font-medium text-gray-900">Total Allocated</div>
          <div className="font-medium text-gray-900">Total Used</div>
          <div className="text-right">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(totalCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Resources Tracked</div>
          <div className="text-lg font-semibold text-gray-900">
            {sortedResources.length}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Avg Usage</div>
          <div className="text-lg font-semibold text-gray-900">
            {sortedResources.length > 0 ? 
              (sortedResources.reduce((sum, r) => sum + (r?.percentage || 0), 0) / sortedResources.length).toFixed(1) + '%' : 
              '0.0%'
            }
          </div>
        </div>
      </div>

      {/* Top Resource Highlight */}
      {sortedResources.length > 0 && sortedResources[0] && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            Highest usage: <span className="font-medium">
              {sortedResources[0]?.resource || 'Unknown Resource'}
            </span> at <span className="font-medium">
              {sortedResources[0]?.percentage?.toFixed(1) || '0.0'}% utilization
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceAllocationWidget;
