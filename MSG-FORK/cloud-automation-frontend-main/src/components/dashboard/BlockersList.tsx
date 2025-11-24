import React from 'react';
import { Blocker, Bottleneck } from '@/types/dashboard';
import { AlertTriangle, Clock, User, TrendingUp, CheckCircle } from 'lucide-react';

interface BlockersListProps {
  blockers: Blocker[];
  bottlenecks: Bottleneck[];
}

const BlockersList: React.FC<BlockersListProps> = ({ blockers, bottlenecks }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
          Blockers & Bottlenecks
        </h3>
        <div className="text-sm text-gray-500">
          {blockers.length} active blockers
        </div>
      </div>

      {/* Active Blockers */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          Active Blockers
        </h4>
        
        {blockers.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">No active blockers! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockers.map((blocker, index) => (
              <div 
                key={index}
                className="flex items-start justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1">
                    <span className="text-lg">{getSeverityIcon(blocker.severity)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-blue-600">{blocker.storyId}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(blocker.severity)}`}>
                        {blocker.severity.toUpperCase()}
                      </span>
                    </div>
                    
                    <h5 className="text-sm font-medium text-gray-900 mb-1">
                      {blocker.title}
                    </h5>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {blocker.reason}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{blocker.owner}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{blocker.daysBlocked} days blocked</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottleneck Detection */}
      {bottlenecks.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            Bottleneck Detection
          </h4>
          
          <div className="space-y-3">
            {bottlenecks.map((bottleneck, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-orange-50 border border-orange-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-orange-900">
                      {bottleneck.column} Column
                    </div>
                    <div className="text-sm text-orange-700">
                      {bottleneck.storiesWaiting} stories waiting • Avg: {bottleneck.avgWaitTime}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-orange-900">
                    Suggested Action:
                  </div>
                  <div className="text-sm text-orange-700">
                    {bottleneck.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockersList;
