'use client'

import React from 'react';
import './StatCard.css';
import './StatCardStyles.css';

interface SystemHealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  components: {
    api: { status: 'healthy' | 'degraded' | 'unhealthy'; message: string };
    database: { status: 'healthy' | 'degraded' | 'unhealthy'; error?: string };
    azure_storage: { status: 'healthy' | 'degraded' | 'unhealthy'; error?: string };
    environment: { status: 'healthy' | 'degraded' | 'unhealthy'; python_version: string };
  };
}

interface SystemHealthCardProps {
  data?: SystemHealthData;
}

function SystemHealthCard({ data }: SystemHealthCardProps) {
  // If no data provided, show loading state - no mock data!
  if (!data) {
    return (
      <div className="cm-stat-card">
        <div className="cm-stat-icon gray">
          <span style={{fontSize: '20px'}}>⏳</span>
        </div>
        <div className="cm-stat-content">
          <p className="cm-stat-label">System Health</p>
          <p className="cm-stat-value">...</p>
          <div className="system-health-details">
            <div className="health-status-text">Loading...</div>
            <div className="health-services">
              <span>Checking systems...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { status, components } = data;
  const api = components?.api;
  const database = components?.database;
  const azure_storage = components?.azure_storage;

  // If components are not available, show loading
  if (!api || !database || !azure_storage) {
    return (
      <div className="cm-stat-card">
        <div className="cm-stat-icon gray">
          <span style={{fontSize: '20px'}}>⏳</span>
        </div>
        <div className="cm-stat-content">
          <p className="cm-stat-label">System Health</p>
          <p className="cm-stat-value">...</p>
          <div className="system-health-details">
            <div className="health-status-text">Loading components...</div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'unhealthy': return '🚨';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'danger';
      default: return 'success';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'All Systems Online';
      case 'degraded': return 'Some Issues';
      case 'unhealthy': return 'System Issues';
      default: return 'All Systems Online';
    }
  };

  const getHealthPercentage = () => {
    let healthyServices = 0;
    const services = [api.status, database.status, azure_storage.status];
    
    services.forEach(status => {
      if (status === 'healthy') healthyServices += 1;
      else if (status === 'degraded') healthyServices += 0.5;
    });
    
    return Math.round((healthyServices / services.length) * 100) || 100;
  };

  const getServiceScore = (status: string) => {
    switch (status) {
      case 'healthy': return 'OK';
      case 'degraded': return 'WARN';
      case 'unhealthy': return 'DOWN';
      default: return 'OK';
    }
  };

  return (
    <div className="cm-stat-card">
      <div className={`cm-stat-icon ${getStatusColor(status)}`}>
        <span style={{fontSize: '20px'}}>{getStatusIcon(status)}</span>
      </div>
      <div className="cm-stat-content">
        <p className="cm-stat-label">System Health</p>
        <p className="cm-stat-value">{getHealthPercentage()}%</p>
        <div className="system-health-details">
          <div className="health-status-text">{getStatusText(status)}</div>
          <div className="health-services">
            <span>DB: {getServiceScore(database.status)}</span>
            <span>API: {getServiceScore(api.status)}</span>
            <span>Storage: {getServiceScore(azure_storage.status)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemHealthCard;
