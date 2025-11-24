import React from 'react';
import { Story } from '@/types/dashboard';
import { Star, CheckCircle, AlertCircle } from 'lucide-react';

interface PriorityListProps {
  stories: Story[];
}

const PriorityList: React.FC<PriorityListProps> = ({ stories }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'P1':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'P2':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'P3':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (readyToPull?: boolean) => {
    if (readyToPull) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-orange-600" />;
  };

  const getStatusText = (status: string, readyToPull?: boolean) => {
    if (readyToPull) {
      return 'Ready to Pull';
    }
    return status;
  };

  const getStatusColor = (readyToPull?: boolean) => {
    if (readyToPull) {
      return 'text-green-600';
    }
    return 'text-orange-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Star className="w-5 h-5 mr-2 text-blue-600" />
          Top 5 Priorities
        </h3>
        <div className="text-sm text-gray-500">
          Next to work on
        </div>
      </div>

      <div className="space-y-3">
        {stories.map((story, index) => (
          <div 
            key={story.id}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-400">
                  #{index + 1}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(story.priority)}`}>
                  {story.priority}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-500">{story.id}</span>
                  <span className="text-gray-300">•</span>
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {story.title}
                  </h4>
                </div>
                <div className={`flex items-center space-x-1 text-sm ${getStatusColor(story.readyToPull)}`}>
                  {getStatusIcon(story.readyToPull)}
                  <span>{getStatusText(story.status, story.readyToPull)}</span>
                </div>
              </div>
            </div>

            {story.readyToPull && (
              <div className="ml-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Ready to pull: {stories.filter(s => s.readyToPull).length} / {stories.length}
          </span>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            View All →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriorityList;
