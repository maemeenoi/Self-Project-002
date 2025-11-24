import React from 'react';
import { OptimizationKPICard as OptimizationKPICardType } from '@/types/costOptimizationDashboard';
import { 
  DollarSign, 
  Zap, 
  Target, 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface OptimizationKPICardProps {
  data: OptimizationKPICardType;
}

const OptimizationKPICard: React.FC<OptimizationKPICardProps> = ({ data }) => {
  const getCardColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'orange':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'blue':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'red':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (direction?: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (direction?: string, status?: string) => {
    // For customer savings, up is always good
    if (data.title.includes('Customer Savings') && direction === 'up') {
      return 'text-green-600';
    }
    // For our costs, up might be warning
    if (data.title.includes('Our Cloud Cost') && direction === 'up') {
      return 'text-orange-600';
    }
    // Default trend colors
    switch (direction) {
      case 'up':
        return status === 'success' ? 'text-green-600' : 'text-orange-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getIcon = (title: string) => {
    if (title.includes('Customer Savings')) {
      return <DollarSign className="w-5 h-5 text-green-600" />;
    }
    if (title.includes('Cloud Cost')) {
      return <DollarSign className="w-5 h-5 text-orange-600" />;
    }
    if (title.includes('Optimization')) {
      return <Target className="w-5 h-5 text-blue-600" />;
    }
    if (title.includes('Deployment')) {
      return <Zap className="w-5 h-5 text-blue-600" />;
    }
    return null;
  };

  const getProgressColor = (progress?: number, target?: number) => {
    if (!progress || !target) return 'bg-gray-300';
    
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 85) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 ${getCardColor(data.color)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{data.title}</h3>
        {getIcon(data.title)}
      </div>

      <div className="mb-4">
        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-3xl font-bold text-gray-900">{data.value}</span>
          {data.secondaryValue && (
            <span className="text-sm text-gray-500">/ {data.secondaryValue}</span>
          )}
        </div>
        
        {/* Progress bar for target-based cards */}
        {data.progress && data.target && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress to target</span>
              <span>{data.progress}% of {typeof data.target === 'number' ? `$${data.target.toLocaleString()}` : data.target}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(data.progress, typeof data.target === 'number' ? data.target : 100)}`}
                style={{ width: `${Math.min(data.progress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {data.trend && (
        <div className="flex items-center space-x-1">
          <div className={`flex items-center ${getTrendColor(data.trend.direction, data.status)}`}>
            {getTrendIcon(data.trend.direction)}
            <span className="text-sm font-medium ml-1">{data.trend.value}</span>
          </div>
        </div>
      )}

      {/* Special highlighting for customer savings */}
      {data.title.includes('Customer Savings') && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <div className="text-xs text-green-700 font-medium">
            💰 Primary Value Metric
          </div>
        </div>
      )}

      {/* Warning for our costs */}
      {data.title.includes('Our Cloud Cost') && data.status === 'warning' && (
        <div className="mt-3 pt-3 border-t border-orange-200">
          <div className="text-xs text-orange-700 font-medium">
            ⚠️ Monitor & Optimize
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizationKPICard;
