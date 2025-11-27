'use client'

import React from 'react';
import './StatCard.css';
import './StatCardStyles.css';

interface TotalCompaniesData {
  total_companies: number;
  active_companies: number;
  inactive_companies: number;
  growth_this_month?: number;
}

interface TotalCompaniesCardProps {
  data?: TotalCompaniesData;
}

function TotalCompaniesCard({ data }: TotalCompaniesCardProps) {
  // Mock data if no data provided
  const mockData = {
    total_companies: 0,
    active_companies: 0,
    inactive_companies: 0,
    growth_this_month: 0
  };

  const companiesData = data || mockData;
  const { total_companies, active_companies, inactive_companies, growth_this_month } = companiesData;

  return (
    <div className="cm-stat-card">
      <div className="cm-stat-icon blue">
        <span style={{fontSize: '20px'}}>🏢</span>
      </div>
      <div className="cm-stat-content">
        <p className="cm-stat-label">Total Companies</p>
        <p className="cm-stat-value">{total_companies?.toLocaleString() || '0'}</p>
        <div className="stat-breakdown-mini">
          <span style={{fontSize: '12px', color: '#10B981'}}>{active_companies || 0} active</span>
          <span style={{fontSize: '12px', color: '#6B7280'}}>{inactive_companies || 0} inactive</span>
        </div>
      </div>
    </div>
  );
}

export default TotalCompaniesCard;
