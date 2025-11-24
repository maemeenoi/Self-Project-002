/**
 * Activity icon component for different provider and item types
 */

import React from 'react';
import { ActivityIconProps, ProviderType, ItemType } from '@/types/engineerDashboard';

const ActivityIcon: React.FC<ActivityIconProps> = ({ provider, itemType, status }) => {
  const getIcon = (provider: ProviderType, itemType: ItemType, status?: string): string => {
    // GitHub icons
    if (provider === 'github') {
      switch (itemType) {
        case 'pull_request':
          return '🔵'; // Blue circle for PRs
        case 'build':
          return status === 'failed' ? '❌' : '⚙️'; // X for failed, gear for others
        case 'deployment':
          return '🚀'; // Rocket for deployments
        default:
          return '🔵';
      }
    }
    
    // Jira icons
    if (provider === 'jira') {
      switch (itemType) {
        case 'issue':
          return '📋'; // Clipboard for issues
        default:
          return '📋';
      }
    }
    
    // Default fallback
    return '📄';
  };

  return (
    <span className="text-sm mr-2" role="img" aria-label={`${provider} ${itemType}`}>
      {getIcon(provider, itemType, status)}
    </span>
  );
};

export default ActivityIcon;
