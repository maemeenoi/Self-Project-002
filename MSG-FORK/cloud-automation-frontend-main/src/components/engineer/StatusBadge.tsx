/**
 * Status badge component with color coding
 */

import React from 'react';
import { StatusBadgeProps, StatusType } from '@/types/engineerDashboard';

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusStyles = (status: string): string => {
    const normalizedStatus = status.toLowerCase().replace(/[_\s]/g, '_') as StatusType;
    
    const statusStyles: Record<StatusType, string> = {
      merged: 'bg-green-100 text-green-800',
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      in_review: 'bg-purple-100 text-purple-800',
      done: 'bg-gray-100 text-gray-800',
      closed: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      default: 'bg-gray-100 text-gray-800'
    };

    return statusStyles[normalizedStatus] || statusStyles.default;
  };

  const formatStatusText = (status: string): string => {
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(status)} ${className}`}>
      {formatStatusText(status)}
    </span>
  );
};

export default StatusBadge;
