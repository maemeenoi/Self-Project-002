import React from 'react';
import { CloudKPICard as CloudKPICardType } from '@/types/cloudDashboard';
import { 
  DollarSign, 
  Zap, 
  Clock, 
  Users,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface CloudKPICardProps {
  data: CloudKPICardType;
}

const iconMap = {
  'dollar-sign': DollarSign,
  'zap': Zap,
  'clock': Clock,
  'users': Users,
};

const CloudKPICard: React.FC<CloudKPICardProps> = ({ data }) => {
  const getCardColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'orange':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'red':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'green':
        return 'text-green-600 bg-green-50 border-green-200';
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

  const getTrendColor = (direction?: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 ${getCardColor(data.color)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{data.title}</h3>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-2xl font-bold text-gray-900">{data.value}</span>
          {data.secondaryValue && (
            <span className="text-sm text-gray-500">/ {data.secondaryValue}</span>
          )}
        </div>
        
        {/* Progress bar for budget-related cards */}
        {data.progress && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  data.progress <= 70 ? 'bg-green-500' : 
                  data.progress <= 85 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${data.progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">{data.progress}% of budget used</div>
          </div>
        )}
      </div>
      
      {data.trend && (
        <div className="flex items-center space-x-1">
          <div className={`flex items-center ${getTrendColor(data.trend.direction)}`}>
            {getTrendIcon(data.trend.direction)}
            <span className="text-sm font-medium ml-1">{data.trend.value}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudKPICard;
