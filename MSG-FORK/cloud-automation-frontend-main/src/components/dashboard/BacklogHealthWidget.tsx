import React from 'react';
import { BacklogHealth } from '@/types/dashboard';
import { Package, CheckCircle, AlertTriangle, XCircle, Calendar } from 'lucide-react';

interface BacklogHealthWidgetProps {
  data: BacklogHealth;
}

const BacklogHealthWidget: React.FC<BacklogHealthWidgetProps> = ({ data }) => {
  const readyPercentage = (data.readyToStart / data.totalBacklog) * 100;
  const refinementPercentage = (data.needsRefinement / data.totalBacklog) * 100;
  const blockedPercentage = (data.blocked / data.totalBacklog) * 100;

  const getHealthStatus = () => {
    if (readyPercentage >= 60) return 'healthy';
    if (readyPercentage >= 40) return 'warning';
    return 'critical';
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Package className="w-5 h-5 mr-2 text-blue-600" />
          Backlog Health
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getHealthColor(healthStatus)}`}>
          {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Backlog Readiness</span>
          <span className="text-sm text-gray-500">{data.totalBacklog} total items</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="relative h-3 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-green-500"
              style={{ width: `${readyPercentage}%` }}
            />
            <div 
              className="absolute top-0 h-full bg-orange-400"
              style={{ 
                left: `${readyPercentage}%`, 
                width: `${refinementPercentage}%` 
              }}
            />
            <div 
              className="absolute top-0 h-full bg-red-500"
              style={{ 
                left: `${readyPercentage + refinementPercentage}%`, 
                width: `${blockedPercentage}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <span className="font-medium text-green-900">Ready to Start</span>
              <div className="text-sm text-green-700">
                {readyPercentage.toFixed(0)}% of backlog
              </div>
            </div>
          </div>
          <span className="text-xl font-bold text-green-600">{data.readyToStart}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div>
              <span className="font-medium text-orange-900">Needs Refinement</span>
              <div className="text-sm text-orange-700">
                {refinementPercentage.toFixed(0)}% of backlog
              </div>
            </div>
          </div>
          <span className="text-xl font-bold text-orange-600">{data.needsRefinement}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <span className="font-medium text-red-900">Blocked</span>
              <div className="text-sm text-red-700">
                {blockedPercentage.toFixed(0)}% of backlog
              </div>
            </div>
          </div>
          <span className="text-xl font-bold text-red-600">{data.blocked}</span>
        </div>
      </div>

      {/* Coverage */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Coverage</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{data.coverageWeeks} weeks</div>
            <div className="text-sm text-gray-500">at current velocity</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacklogHealthWidget;
