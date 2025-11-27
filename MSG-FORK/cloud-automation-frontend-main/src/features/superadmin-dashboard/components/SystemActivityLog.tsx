'use client'

import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertCircle, User, Building2, Settings, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import './Widget.css';

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: string;
}

interface SystemActivityLogProps {
  data?: ActivityItem[];
}

function SystemActivityLog({ data }: SystemActivityLogProps) {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="widget-pro loading">
        <div className="loading-spinner"></div>
        <p>Loading activity log...</p>
      </div>
    );
  }

  const getActivityIcon = (activityType: string, severity: string) => {
    const iconProps = { size: 16 };
    
    switch (activityType) {
      case 'company_created':
        return <Building2 {...iconProps} className="activity-icon-success" />;
      case 'user_login':
        return <User {...iconProps} className="activity-icon-info" />;
      case 'integration_error':
        return <AlertCircle {...iconProps} className="activity-icon-error" />;
      case 'integration_added':
        return <CheckCircle {...iconProps} className="activity-icon-success" />;
      case 'system_config':
        return <Settings {...iconProps} className="activity-icon-info" />;
      default:
        if (severity === 'error' || severity === 'critical') {
          return <XCircle {...iconProps} className="activity-icon-error" />;
        }
        return <Activity {...iconProps} className="activity-icon-info" />;
    }
  };

  const formatActivityTime = (timestamp: string) => {
    try {
      if (!timestamp || timestamp === 'N/A') {
        return 'Unknown';
      }
      
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Unknown';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Unknown';
    }
  };

  const getSeverityClass = (severity: string) => {
    if (!severity) return 'severity-info';
    
    const severityMap: { [key: string]: string } = {
      'info': 'severity-info',
      'success': 'severity-success',
      'warning': 'severity-warning',
      'error': 'severity-error',
      'critical': 'severity-critical'
    };
    return severityMap[severity.toLowerCase()] || 'severity-info';
  };

  const displayData = Array.isArray(data) ? data.slice(0, 5) : [];

  return (
    <div className="widget-pro activity-log-pro">
      {/* Header */}
      <div className="widget-pro-header">
        <div className="widget-pro-title-section">
          <Activity size={20} className="widget-pro-icon" />
          <div>
            <h3 className="widget-pro-title">System Activity Log</h3>
            <p className="widget-pro-subtitle">
              Last updated: {lastUpdated.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="widget-pro-content">
        {displayData.length > 0 ? (
          <div className="activity-log-list">
            {displayData.map((activity, index) => (
              <div key={activity.id || `activity-${index}`} className="activity-log-item">
                <div className="activity-icon-wrapper">
                  {getActivityIcon(activity.type, activity.severity)}
                </div>
                <div className="activity-details-pro">
                  <p className="activity-message-pro">{activity.message}</p>
                  <div className="activity-meta-pro">
                    <div className="meta-item">
                      <Clock size={12} />
                      <span>{formatActivityTime(activity.timestamp)}</span>
                    </div>
                    <span className={`severity-badge-pro ${getSeverityClass(activity.severity)}`}>
                      {activity.severity || 'info'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-pro">
            <Activity size={32} className="empty-icon-pro" />
            <p className="empty-text-pro">No recent activity</p>
          </div>
        )}

        {/* Footer */}
        {Array.isArray(data) && data.length > 5 && (
          <div className="widget-pro-footer">
            <button 
              className="view-all-btn-pro"
              onClick={() => window.location.href = '/superadmin/activity'}
            >
              View All Activity
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SystemActivityLog;
