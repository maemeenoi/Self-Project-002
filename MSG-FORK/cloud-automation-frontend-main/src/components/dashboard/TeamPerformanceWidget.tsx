import React from 'react';
import { TeamPerformance } from '@/types/cloudDashboard';
import { Users, Clock, TrendingUp, Battery, Calendar } from 'lucide-react';

interface TeamPerformanceWidgetProps {
  data: TeamPerformance;
}

const TeamPerformanceWidget: React.FC<TeamPerformanceWidgetProps> = ({ data }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCapacityColor = (utilization: number) => {
    if (utilization <= 70) return 'bg-green-500';
    if (utilization <= 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCapacityStatus = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'At Risk':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Overloaded':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-600" />
          Team Performance
        </h3>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{data.weeklyOutput}</div>
          <div className="text-sm text-blue-700 font-medium">Weekly Output</div>
          <div className="text-xs text-blue-600">stories</div>
        </div>

        <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{data.cycleTime}</div>
          <div className="text-sm text-purple-700 font-medium">Cycle Time</div>
          <div className="text-xs text-purple-600">days</div>
        </div>
      </div>

      {/* Throughput Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              {getTrendIcon(data.throughput.trend)}
            </div>
            <div>
              <span className="text-sm font-medium text-green-900">Throughput</span>
              <div className="text-xs text-green-700">{data.throughput.status}</div>
            </div>
          </div>
          <div className={`flex items-center space-x-1 ${getTrendColor(data.throughput.trend)}`}>
            {getTrendIcon(data.throughput.trend)}
            <span className="text-sm font-medium">{data.throughput.status}</span>
          </div>
        </div>
      </div>

      {/* Team Capacity */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Battery className="w-4 h-4 mr-1" />
          Team Capacity
        </h4>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Utilization</span>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getCapacityStatus(data.teamCapacity.status)}`}>
              {data.teamCapacity.status}
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Current Load</span>
              <span className="text-xs font-medium text-gray-700">{data.teamCapacity.utilization}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getCapacityColor(data.teamCapacity.utilization)}`}
                style={{ width: `${data.teamCapacity.utilization}%` }}
              />
            </div>
          </div>
          
          <div className="text-center mt-3">
            <span className="text-lg font-bold text-gray-900">{data.teamCapacity.utilization}%</span>
            <div className="text-xs text-gray-500">of capacity used</div>
          </div>
        </div>
      </div>

      {/* Backlog Coverage */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-orange-900">Backlog Coverage</span>
              <div className="text-xs text-orange-700">at current velocity</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">{data.backlogCoverage}</div>
            <div className="text-sm text-orange-700">weeks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPerformanceWidget;
