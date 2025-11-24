'use client'

import React, { useState } from 'react';
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
}

interface RecentCompaniesProps {
  data?: RecentCompany[];
}

function RecentCompanies({ data }: RecentCompaniesProps) {
  if (!data) {
    return (
      <div className="widget-pro loading">
        <div className="loading-spinner"></div>
        <p>Loading recent companies...</p>
      </div>
    );
  }

  // Format date to clean format
  const formatCleanDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatCleanDate(dateString);
  };

  const displayData = data.slice(0, 4);

  return (
    <div className="widget-pro recent-companies-pro">
      {/* Header */}
      <div className="widget-pro-header">
        <div className="widget-pro-title-section">
          <Building2 size={20} className="widget-pro-icon" />
          <div>
            <h3 className="widget-pro-title">Recent Additions</h3>
            <p className="widget-pro-subtitle">{displayData.length} new companies</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="widget-pro-content">
        {displayData.length > 0 ? (
          <div className="recent-companies-list">
            {displayData.map((company) => {
              const initials = company.name
                .split(' ')
                .map(word => word.charAt(0))
                .join('')
                .substring(0, 2)
                .toUpperCase();

              return (
                <div key={company.company_id} className="recent-company-item">
                  <div className="company-avatar-blue">{initials}</div>
                  <div className="company-details-pro">
                    <div className="company-name-row">
                      <span className="company-name-pro">{company.name}</span>
                      <span className={`status-dot ${company.status || 'active'}`}></span>
                    </div>
                    <div className="company-meta-row">
                      <div className="meta-item">
                        <Clock size={12} />
                        <span>{getRelativeTime(company.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state-pro">
            <Building2 size={32} className="empty-icon-pro" />
            <p className="empty-text-pro">No recent companies</p>
          </div>
        )}

        {/* Footer */}
        {data.length > 4 && (
          <div className="widget-pro-footer">
            <button className="view-all-btn-pro">
              View All {data.length} Companies
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentCompanies;
