'use client'

import React from 'react';
import './StatCard.css';

interface SystemHealthData {
  overall_status: 'operational' | 'degraded' | 'down';
  database_status: 'operational' | 'degraded' | 'down';
  api_status: 'operational' | 'degraded' | 'down';
  storage_status: 'operational' | 'degraded' | 'down';
  uptime_percent: number;
  last_incident?: string;
}

interface SystemHealthCardProps {
  data?: SystemHealthData;
}

function SystemHealthCard({ data }: SystemHealthCardProps) {
  if (!data) {
    return (
      <div className="stat-card system-health loading">
        <div className="card-header">
          <h3>System Health</h3>
          <span className="card-icon">⚡</span>
        </div>
        <div className="card-content">
          <div className="loading-skeleton">Loading...</div>
        </div>
      </div>
    );
  }

  const { overall_status, database_status, api_status, storage_status, uptime_percent } = data;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return '✅';
      case 'degraded': return '⚠️';
      case 'down': return '🚨';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'success';
      case 'degraded': return 'warning';
      case 'down': return 'danger';
      default: return 'unknown';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational': return 'All Operational';
      case 'degraded': return 'Some Degraded';
      case 'down': return 'System Down';
      default: return 'Unknown';
    }
  };

  const getHealthPercentage = () => {
    let healthyServices = 0;
    const services = [database_status, api_status, storage_status];
    
    services.forEach(status => {
      if (status === 'operational') healthyServices += 1;
      else if (status === 'degraded') healthyServices += 0.5;
    });
    
    return Math.round((healthyServices / services.length) * 100);
  };

  const getServiceScore = (status: string) => {
    switch (status) {
      case 'operational': return '10/10';
      case 'degraded': return '5/10';
      case 'down': return '0/10';
      default: return 'N/A';
    }
  };

  return (
    <div className={`stat-card system-health-card ${getStatusColor(overall_status)}`}>
      <div className="card-header">
        <h3>System Health</h3>
        <span className="card-icon">{getStatusIcon(overall_status)}</span>
      </div>
      <div className="card-content">
        <div className="health-overview">
          <div className="health-score-display">
            <div className="health-percentage">
              {getHealthPercentage()}%
            </div>
            <div className="health-status-text">
              {getStatusText(overall_status)}
            </div>
          </div>
          <div className="health-breakdown">
            <div className="health-service">
              <span className="service-name">Database</span>
              <span className="service-score">{getServiceScore(database_status)}</span>
            </div>
            <div className="health-service">
              <span className="service-name">API</span>
              <span className="service-score">{getServiceScore(api_status)}</span>
            </div>
            <div className="health-service">
              <span className="service-name">Storage</span>
              <span className="service-score">{getServiceScore(storage_status)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemHealthCard;
