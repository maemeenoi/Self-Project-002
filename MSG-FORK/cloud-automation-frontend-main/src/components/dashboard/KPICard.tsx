import React from 'react';
import { KPICard as KPICardType } from '@/types/dashboard';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface KPICardProps {
  data: KPICardType;
}

const iconMap = {
  'activity': Activity,
  'trending-up': TrendingUp,
  'clock': Clock,
  'alert-triangle': AlertTriangle,
};

const KPICard: React.FC<KPICardProps> = ({ data }) => {
  const Icon = data.icon ? iconMap[data.icon as keyof typeof iconMap] : Activity;
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'danger':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4" />;
      case 'down':
        return <ArrowDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 ${getStatusColor(data.status)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white bg-opacity-50">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">{data.title}</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">{data.value}</span>
              {data.target && (
                <span className="text-sm text-gray-500">/ {data.target}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {(data.trend || data.trendValue) && (
        <div className="mt-4 flex items-center space-x-1">
          <div className={`flex items-center ${getTrendColor(data.trend)}`}>
            {getTrendIcon(data.trend)}
            {data.trendValue && (
              <span className="text-sm font-medium ml-1">{data.trendValue}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KPICard;
