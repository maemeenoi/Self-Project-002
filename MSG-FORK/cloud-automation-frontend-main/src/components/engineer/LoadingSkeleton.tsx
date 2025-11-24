/**
 * Loading skeleton component for widgets
 */

import React from 'react';
import { LoadingSkeletonProps } from '@/types/engineerDashboard';

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  lines = 3, 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="mb-3 last:mb-0">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
