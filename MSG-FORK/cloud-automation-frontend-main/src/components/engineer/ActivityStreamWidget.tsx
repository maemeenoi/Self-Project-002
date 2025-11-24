/**
 * Activity Stream Widget
 * Shows recent workflow events from GitHub and Jira
 */

import React, { useState, useEffect } from 'react';
import WidgetCard from './WidgetCard';
import StatusBadge from './StatusBadge';
import ActivityIcon from './ActivityIcon';
import LoadingSkeleton from './LoadingSkeleton';
import { ActivityItem, ProviderType, ItemType } from '@/types/engineerDashboard';
import { timeAgo } from '@/utils/dateHelpers';
import engineerDashboardApi from '@/services/engineerDashboardApi';

const ActivityStreamWidget: React.FC = () => {
  const [data, setData] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const activityData = await engineerDashboardApi.fetchActivityStream(10);
      setData(activityData);
      setUseMockData(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity stream data');
      console.error('Error fetching activity stream data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderActivityItem = (item: ActivityItem, index: number) => {
    const provider = (item.provider || 'unknown').toLowerCase() as ProviderType;
    const itemType = (item.item_type || 'unknown').toLowerCase() as ItemType;
    
    return (
      <div key={index} className="p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-b-0">
        <div className="flex items-start space-x-3">
          <ActivityIcon 
            provider={provider} 
            itemType={itemType} 
            status={item.status}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.title}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <StatusBadge status={item.status} />
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">
                {timeAgo(item.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingSkeleton lines={5} />;
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity</p>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        {/* Activity Feed */}
        <div className="max-h-96 overflow-y-auto">
          {data.slice(0, 8).map((item, index) => renderActivityItem(item, index))}
        </div>

        
      </div>
    );
  };

  return (
    <WidgetCard
      title="Activity Stream"
      onRefresh={fetchData}
      loading={loading}
    >
      {renderContent()}
    </WidgetCard>
  );
};

export default ActivityStreamWidget;
