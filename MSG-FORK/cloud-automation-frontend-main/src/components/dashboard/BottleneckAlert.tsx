import React from 'react';
import { Bottleneck } from '@/types/dashboard';
import { TrendingUp, AlertTriangle, Clock } from 'lucide-react';

interface BottleneckAlertProps {
  bottlenecks: Bottleneck[];
}

const BottleneckAlert: React.FC<BottleneckAlertProps> = ({ bottlenecks }) => {
  if (bottlenecks.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <div>
            <h4 className="text-sm font-medium text-green-900">Flow is Healthy</h4>
            <p className="text-sm text-green-700">No bottlenecks detected in your workflow</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          Bottleneck Alert
        </h3>
        <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
          {bottlenecks.length} detected
        </div>
      </div>

      <div className="space-y-4">
        {bottlenecks.map((bottleneck, index) => (
          <div 
            key={index}
            className="bg-orange-50 border border-orange-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-medium text-orange-900 mb-1">
                    {bottleneck.column} Column Bottleneck
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-orange-700 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Avg wait: {bottleneck.avgWaitTime}</span>
                    </div>
                    <div>
                      {bottleneck.storiesWaiting} stories waiting
                    </div>
                  </div>
                  <div className="bg-white border border-orange-200 rounded-md p-3">
                    <div className="text-sm font-medium text-orange-900 mb-1">
                      💡 Suggested Action:
                    </div>
                    <div className="text-sm text-orange-800">
                      {bottleneck.action}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {bottleneck.storiesWaiting}
                </div>
                <div className="text-xs text-orange-700">stories</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Impact Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Impact Analysis</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Stories Affected:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {bottlenecks.reduce((sum, b) => sum + b.storiesWaiting, 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Columns Affected:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {bottlenecks.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottleneckAlert;
