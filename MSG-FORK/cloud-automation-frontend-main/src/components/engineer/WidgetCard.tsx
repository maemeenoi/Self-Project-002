/**
 * Reusable widget card wrapper component
 */

import React from 'react';
import { WidgetCardProps } from '@/types/engineerDashboard';

const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  children,
  className = '',
  showMockDataIndicator = false,
  onRefresh,
  loading = false
}) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-150 p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showMockDataIndicator && (
            <span className="text-xs px-2 py-1 rounded-full text-orange-600 bg-orange-50">
              🔄 Mock Data
            </span>
          )}
        </div>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default WidgetCard;
