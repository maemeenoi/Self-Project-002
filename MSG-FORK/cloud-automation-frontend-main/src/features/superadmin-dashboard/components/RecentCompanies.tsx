'use client'

import React, { useState, useEffect } from 'react';
import { Building2, Clock, ChevronRight } from 'lucide-react';
import './Widget.css';

interface RecentCompany {
  company_id: number;
  name: string;
  created_at: string;
  admin_name: string;
  admin_email: string;
  subscription_tier: string;
  created_by: string;
  status?: string;
  employees_count?: number;
  industry?: string;
}

interface RecentCompaniesProps {
  data?: RecentCompany[];
}

function RecentCompanies({ data }: RecentCompaniesProps) {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<RecentCompany[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/superadmin/recent-additions`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiData = await response.json();
        
        // Transform API data to match our interface
        const transformedData = Array.isArray(apiData) ? apiData.map((company: any) => ({
          company_id: company.company_id,
          name: company.name,
          created_at: company.created_at,
          admin_name: company.admin_name,
          admin_email: company.admin_email,
          subscription_tier: company.subscription_tier,
          created_by: company.created_by,
          status: company.status,
          employees_count: company.employees_count,
          industry: company.industry
        })) : [];
        
        setCompanies(transformedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch recent companies:', err);
        setError('Failed to load recent companies');
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCompanies();
  }, []);

  if (loading) {
    return (
      <div className="widget-pro loading">
        <div className="loading-spinner"></div>
        <p>Loading recent additions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget-pro error">
        <div className="widget-pro-header">
          <div className="widget-pro-title-section">
            <span style={{fontSize: '20px'}}>🏢</span>
            <div>
              <h3 className="widget-pro-title">Recent Additions</h3>
              <p className="widget-pro-subtitle" style={{color: '#ef4444'}}>
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: '✅ Active', color: '#10b981', bg: '#d1fae5' };
      case 'pending_setup':
        return { label: '⚙️ Setup', color: '#f59e0b', bg: '#fef3c7' };
      case 'suspended':
        return { label: '⏸️ Suspended', color: '#ef4444', bg: '#fecaca' };
      default:
        return { label: '❔ Unknown', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'enterprise': return '#8b5cf6';
      case 'professional': return '#0ea5e9';
      case 'basic': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="widget-pro recent-companies-pro">
      {/* Header */}
      <div className="widget-pro-header">
        <div className="widget-pro-title-section">
          <span style={{fontSize: '20px'}}>🏢</span>
          <div>
            <h3 className="widget-pro-title">Recent Additions</h3>
            <p className="widget-pro-subtitle">
              {companies.length} companies joined recently
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="widget-pro-content" style={{maxHeight: '400px', overflowY: 'auto', padding: '16px'}}>
        <div className="recent-companies-list">
          {companies.slice(0, 6).map((company, index) => {
            const statusConfig = getStatusBadge(company.status || 'active');
            const isNewest = index === 0;
            
            return (
              <div key={company.company_id} className="recent-company-item" style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: isNewest ? '#f0f9ff' : '#ffffff',
                border: isNewest ? '1px solid #0ea5e9' : '1px solid #e5e7eb',
                marginBottom: '12px',
                position: 'relative',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (!isNewest) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (!isNewest) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }
              }}>
                
                {/* New badge for most recent */}
                {isNewest && (
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '12px',
                    background: '#0ea5e9',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '600',
                    boxShadow: '0 2px 4px rgba(14, 165, 233, 0.3)'
                  }}>
                    NEW
                  </div>
                )}

                <div style={{display: 'flex', alignItems: 'flex-start', gap: '12px'}}>
                  {/* Company Avatar */}
                  <div className="cm-company-avatar" style={{
                    width: '40px', 
                    height: '40px', 
                    fontSize: '16px',
                    backgroundColor: isNewest ? '#0ea5e9' : getTierColor(company.subscription_tier),
                    color: 'white',
                    border: isNewest ? '2px solid #0369a1' : 'none'
                  }}>
                    {company.name.charAt(0).toUpperCase()}
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
                          {company.name}
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: '12px',
                          color: '#6b7280',
                          lineHeight: '1.3'
                        }}>
                          {(company as any).industry || 'Technology'}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: isNewest ? '#0ea5e9' : '#6b7280'
                      }}>
                        {getRelativeTime(company.created_at)}
                      </span>
                    </div>

                    {/* Admin & Stats Row */}
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                      <div style={{fontSize: '11px', color: '#6b7280'}}>
                        <span style={{fontWeight: '500'}}>{company.admin_name}</span>
                        <span style={{margin: '0 4px'}}>•</span>
                        <span style={{
                          color: getTierColor(company.subscription_tier),
                          fontWeight: '600'
                        }}>
                          {company.subscription_tier}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.color,
                        fontWeight: '600'
                      }}>
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* Source & Contact Row */}
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div style={{
                        fontSize: '10px',
                        color: '#9ca3af',
                        backgroundColor: '#f3f4f6',
                        padding: '2px 6px',
                        borderRadius: '3px'
                      }}>
                        via {company.created_by}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#9ca3af',
                        fontFamily: 'monospace',
                        maxWidth: '160px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {company.admin_email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {companies.length === 0 && (
          <div className="empty-state-pro">
            <span style={{fontSize: '32px'}}>🏢</span>
            <p className="empty-text-pro">No recent companies</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentCompanies;
