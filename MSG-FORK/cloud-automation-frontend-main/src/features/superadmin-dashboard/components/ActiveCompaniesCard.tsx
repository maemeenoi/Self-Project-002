'use client'

import React from 'react';
import './StatCard.css';
import './StatCardStyles.css';

interface ActiveCompaniesData {
  active_companies: number;
  growth_this_month?: number;
  growth_percent?: number;
}

interface ActiveCompaniesCardProps {
  data?: ActiveCompaniesData;
}

function ActiveCompaniesCard({ data }: ActiveCompaniesCardProps) {
  // Mock data if no data provided
  const mockData = {
    active_companies: 0,
    growth_this_month: 0,
    growth_percent: 0
  };

  const activeData = data || mockData;
  const { active_companies, growth_this_month, growth_percent } = activeData;

  return (
    <div className="cm-stat-card">
      <div className="cm-stat-icon green">
        <span style={{fontSize: '20px'}}>✅</span>
      </div>
      <div className="cm-stat-content">
        <p className="cm-stat-label">Active Companies</p>
        <p className="cm-stat-value">{active_companies?.toLocaleString() || '0'}</p>
        <div className="stat-breakdown-mini">
          <span style={{fontSize: '12px', color: '#10B981'}}>Currently operational</span>
          {growth_this_month && growth_this_month > 0 && (
            <span style={{fontSize: '12px', color: '#059669'}}>+{growth_this_month} this month</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActiveCompaniesCard;
