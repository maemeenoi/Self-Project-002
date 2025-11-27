'use client'

import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/formatters';
import './Widget.css';

interface CompanyIntegration {
  company_id: number;
  company_name: string;
  integrations: {
    azure?: { status: 'healthy' | 'degraded' | 'error'; last_sync: string; resources_count: number };
    aws?: { status: 'healthy' | 'degraded' | 'error'; last_sync: string; resources_count: number };
    gcp?: { status: 'healthy' | 'degraded' | 'error'; last_sync: string; resources_count: number };
    github?: { status: 'healthy' | 'degraded' | 'error'; last_sync: string; repos_count: number };
    jira?: { status: 'healthy' | 'degraded' | 'error'; last_sync: string; projects_count: number };
  };
  total_integrations: number;
  healthy_integrations: number;
  last_activity: string;
}

interface IntegrationStatusData {
  companies: CompanyIntegration[];
  summary: {
    total_companies: number;
    total_integrations: number;
    healthy_percentage: number;
  };
}

interface IntegrationStatusProps {
  data?: IntegrationStatusData;
}

const GitHubIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

function IntegrationStatus({ data }: IntegrationStatusProps) {
  const [expandedCompany, setExpandedCompany] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [integrationData, setIntegrationData] = useState<IntegrationStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIntegrationStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/superadmin/integrations/company-status`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiData = await response.json();
        setIntegrationData(apiData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch integration status:', err);
        setError('Failed to load integration status');
        setIntegrationData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrationStatus();
  }, []);

  if (loading) {
    return (
      <div className="widget-pro loading">
        <div className="loading-spinner"></div>
        <p>Loading integration status...</p>
      </div>
    );
  }

  if (error || !integrationData || !integrationData.summary) {
    return (
      <div className="widget-pro error">
        <div className="widget-pro-header">
          <div className="widget-pro-title-section">
            <span style={{fontSize: '20px'}}>🔗</span>
            <div>
              <h3 className="widget-pro-title">Integration Status</h3>
              <p className="widget-pro-subtitle" style={{color: '#ef4444'}}>
                {error || 'No integration data available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  const getProviderIcon = (provider: string) => {
    const iconStyle = {
      width: '16px',
      height: '16px',
      objectFit: 'contain' as const
    };

    switch (provider) {
      case 'azure': 
        return <img src="/icons8-azure-96.png" alt="Azure" style={iconStyle} />;
      case 'aws': 
        return <img src="/icons8-amazon-aws-96.png" alt="AWS" style={iconStyle} />;
      case 'gcp': 
        return <img src="/icons8-google-cloud-96.png" alt="Google Cloud" style={iconStyle} />;
      case 'jira': 
        return <img src="/icons8-jira-50.png" alt="Jira" style={iconStyle} />;
      case 'github': 
        return <GitHubIcon style={{ width: '16px', height: '16px' }} />;
      default: 
        return '🔗';
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getHealthColor = (healthy: number, total: number) => {
    const percentage = (healthy / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="widget-pro integration-status-pro">
      {/* Header */}
      <div className="widget-pro-header">
        <div className="widget-pro-title-section">
          <span style={{fontSize: '20px'}}>🔗</span>
          <div>
            <h3 className="widget-pro-title">Integration Status</h3>
            <p className="widget-pro-subtitle">
              {integrationData.summary?.healthy_percentage || 0}% healthy • {integrationData.summary?.total_integrations || 0} total
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="widget-pro-content" style={{maxHeight: '400px', overflowY: 'auto', padding: '16px'}}>
        <div className="company-integrations-list">
          {(integrationData.companies || []).map((company) => {
            const isExpanded = expandedCompany === company.company_id;
            const activeProviders = Object.keys(company.integrations).length;
            const healthyProviders = company.healthy_integrations;
            const healthPercentage = Math.round((healthyProviders / activeProviders) * 100);
            
            return (
              <div key={company.company_id} className="company-integration-card" style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                marginBottom: '12px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}>
                {/* Company Header - Clickable */}
                <div 
                  onClick={() => setExpandedCompany(isExpanded ? null : company.company_id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  {/* Company Avatar */}
                  <div className="cm-company-avatar" style={{
                    width: '40px', 
                    height: '40px', 
                    fontSize: '16px',
                    backgroundColor: healthPercentage >= 80 ? '#10b981' : healthPercentage >= 50 ? '#f59e0b' : '#ef4444',
                    color: 'white'
                  }}>
                    {company.company_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Company Details */}
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px'}}>
                      <div>
                        <h4 style={{
                          margin: 0,
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#111827',
                          lineHeight: '1.2'
                        }}>
                          {company.company_name}
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: '12px',
                          color: '#6b7280',
                          lineHeight: '1.3'
                        }}>
                          Integration Management
                        </p>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#6b7280'
                      }}>
                        {getRelativeTime(company.last_activity)}
                      </span>
                    </div>

                    {/* Status & Stats Row */}
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                      <div style={{fontSize: '11px', color: '#6b7280'}}>
                        <span style={{fontWeight: '500'}}>{activeProviders} of 5 providers</span>
                        <span style={{margin: '0 4px'}}>•</span>
                        <span style={{
                          color: healthPercentage >= 80 ? '#10b981' : healthPercentage >= 50 ? '#f59e0b' : '#ef4444',
                          fontWeight: '600'
                        }}>
                          {healthPercentage}% healthy
                        </span>
                      </div>
                      <div style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: healthPercentage >= 80 ? '#d1fae5' : healthPercentage >= 50 ? '#fef3c7' : '#fecaca',
                        color: healthPercentage >= 80 ? '#10b981' : healthPercentage >= 50 ? '#f59e0b' : '#ef4444',
                        fontWeight: '600'
                      }}>
                        {healthyProviders}/{activeProviders}
                      </div>
                    </div>

                    {/* Expand Button Row */}
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div style={{
                        fontSize: '10px',
                        color: '#9ca3af',
                        backgroundColor: '#f3f4f6',
                        padding: '2px 6px',
                        borderRadius: '3px'
                      }}>
                        Click to {isExpanded ? 'collapse' : 'expand'}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>Details</span>
                        <span style={{fontSize: '12px', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'}}>
                          ▼
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="company-integration-details" style={{
                    marginTop: '12px',
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px'}}>
                      {/* Show all 5 providers */}
                      {['azure', 'aws', 'gcp', 'github', 'jira'].map((provider) => {
                        const config = company.integrations[provider as keyof typeof company.integrations];
                        const isActive = !!config;
                        const status = isActive ? config.status : 'inactive';
                        
                        return (
                          <div key={provider} style={{
                            padding: '8px 12px',
                            backgroundColor: isActive ? '#f9fafb' : '#f3f4f6',
                            borderRadius: '6px',
                            border: isActive ? '1px solid #f1f3f4' : '1px solid #e5e7eb',
                            opacity: isActive ? 1 : 0.6
                          }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px'}}>
                              <span style={{fontSize: '16px', display: 'flex', alignItems: 'center'}}>
                                {getProviderIcon(provider)}
                              </span>
                              <span style={{fontSize: '13px', fontWeight: '600', textTransform: 'capitalize'}}>
                                {provider}
                              </span>
                              <span style={{fontSize: '12px'}}>
                                {isActive ? getStatusIcon(config.status) : '⚪'}
                              </span>
                            </div>
                            <div style={{fontSize: '11px', color: '#6b7280'}}>
                              {isActive ? (
                                provider === 'azure' || provider === 'aws' || provider === 'gcp' ? (
                                  <>{(config as any).resources_count} resources</>
                                ) : provider === 'github' ? (
                                  <>{(config as any).repos_count} repos</>
                                ) : provider === 'jira' ? (
                                  <>{(config as any).projects_count} projects</>
                                ) : (
                                  'Connected'
                                )
                              ) : (
                                'Not configured'
                              )}
                            </div>
                            <div style={{fontSize: '10px', color: '#9ca3af'}}>
                              {isActive ? getRelativeTime(config.last_sync) : 'No integration'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {(!integrationData.companies || integrationData.companies.length === 0) && (
          <div className="empty-state-pro">
            <span style={{fontSize: '32px'}}>🔗</span>
            <p className="empty-text-pro">No company integrations</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default IntegrationStatus;