'use client'

import React, { useState } from 'react';
import { formatDate } from '../utils/formatters';
import './Widget.css';

interface CloudProviderIntegration {
  status: string;
  connected_companies: number;
  last_sync: string;
  errors_last_24h: number;
}

interface IntegrationStatusData {
  azure: CloudProviderIntegration;
  aws: CloudProviderIntegration;
  gcp: CloudProviderIntegration;
}

interface IntegrationStatusProps {
  data?: IntegrationStatusData;
}

function IntegrationStatus({ data }: IntegrationStatusProps) {
  if (!data) {
    return (
      <div className="superadmin-widget-card integration-status loading">
        <div className="widget-header">
          <h3>Integration Status</h3>
        </div>
        <div className="loading-content">
          <div className="loading-skeleton">Loading integration status...</div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'status-healthy';
      case 'degraded':
        return 'status-warning';
      case 'error':
        return 'status-error';
      default:
        return 'status-unknown';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'azure':
        return '☁️';
      case 'aws':
        return '🟧';
      case 'gcp':
        return '🔵';
      default:
        return '🔗';
    }
  };

  const providers = Object.entries(data);

  return (
    <div className="superadmin-widget-card integration-status">
      <div className="widget-header">
        <h3>Integration Status</h3>
        <a href="/superadmin/integrations" className="view-all-link">
          View All Integrations →
        </a>
      </div>
      
      <div className="widget-content">
        <div className="cloud-providers-compact">
          {providers.map(([providerName, providerData]) => (
            <div key={providerName} className="provider-card-horizontal">
              <div className="provider-header-compact">
                <span className="provider-icon-large">
                  {getProviderIcon(providerName)}
                </span>
                <div className="provider-details-compact">
                  <div className="provider-name-status">
                    <span className="provider-name-bold">
                      {providerName.toUpperCase()}
                    </span>
                    <span className={`status-badge-compact ${getStatusColor(providerData.status)}`}>
                      {getStatusIcon(providerData.status)} {providerData.status}
                    </span>
                  </div>
                  <div className="provider-stats">
                    <span className="stat-item">
                      <strong>{providerData.connected_companies}</strong> connected
                    </span>
                    {providerData.errors_last_24h > 0 && (
                      <span className="stat-item error">
                        <strong>{providerData.errors_last_24h}</strong> errors (24h)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {providers.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">�</span>
            <p>No integrations configured</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default IntegrationStatus;