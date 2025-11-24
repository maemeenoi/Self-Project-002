'use client';

import React from 'react';
import { SystemHealthItem } from '@/types/productOwnerDashboard';
import { calculateHealthScore, getHealthStatus } from '@/utils/productOwnerFormatters';

interface ProductionHealthProps {
  data: SystemHealthItem[] | null;
  loading?: boolean;
}

const ProductionHealth: React.FC<ProductionHealthProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="widget-card">
        <div className="animate-pulse">
          <div className="widget-header">
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 bg-gray-300 rounded mr-3"></div>
                  <div className="h-4 bg-gray-300 rounded flex-1"></div>
                </div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="widget-card">
        <div className="widget-header">
          <h3 className="widget-title">Production Health (Real Data)</h3>
          <div className="flex items-center space-x-2 text-gray-500">
            <span>❓</span>
            <span className="text-sm">No Data</span>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500">No production health data available</p>
          <p className="text-sm text-gray-400">Configure CI/CD integrations to see system health</p>
        </div>
      </div>
    );
  }

  const overallScore = parseFloat(calculateHealthScore(data));
  const healthStatus = getHealthStatus(overallScore);

  // Calculate metrics for each item type
  const metrics = data.map(item => {
    const total = (item.successful || 0) + (item.failed || 0);
    const successRate = total > 0 ? (((item.successful || 0) / total) * 100) : 0;
    const status = getHealthStatus(successRate);
    
    return {
      ...item,
      total,
      successRate: successRate.toFixed(1),
      status
    };
  });

  // Icon mapping
  const iconMap: { [key: string]: string } = {
    'build': '🔨',
    'deployment': '🚀',
    'pull_request': '🔵'
  };

  // Format item type names
  const formatItemType = (itemType: string): string => {
    return itemType
      .replace('_', ' ')
      .replace(/\b\w/g, l => l.toUpperCase()) + ' Success Rate';
  };

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h3 className="widget-title">Production Health (Real Data)</h3>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <span>Overall: {overallScore.toFixed(1)}% {healthStatus.status}</span>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map(metric => (
          <div key={metric.ItemType} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{iconMap[metric.ItemType] || '📊'}</span>
                <span className="font-medium text-gray-900">
                  {formatItemType(metric.ItemType)}
                </span>
              </div>
              <div className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {metric.successRate}%
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="h-2 rounded-full transition-all duration-300 bg-blue-500"
                style={{width: `${metric.successRate}%`}}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Success: {metric.successful}/{metric.total}
              </span>
              <span className="text-gray-600">
                {(metric.failed || 0) > 0 
                  ? `${metric.failed} failed this week` 
                  : 'All successful'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-xl">🎯</span>
          <span className="font-medium text-blue-900">Customer Impact:</span>
        </div>
        <div className="text-sm text-gray-700">
          {overallScore >= 95 
            ? '✓ Minimal - No customer-facing incidents' 
            : 'ℹ Some incidents detected - monitor closely'}
        </div>
      </div>
    </div>
  );
};

export default ProductionHealth;

