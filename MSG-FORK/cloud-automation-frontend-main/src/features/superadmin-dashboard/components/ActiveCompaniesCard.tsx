'use client'

import React from 'react';
import './StatCard.css';

interface ActiveCompaniesData {
  active_companies: number;
  growth_this_month?: number;
  growth_percent?: number;
}

interface ActiveCompaniesCardProps {
  data?: ActiveCompaniesData;
}

function ActiveCompaniesCard({ data }: ActiveCompaniesCardProps) {
  if (!data) {
    return (
      <div className="stat-card active-companies loading">
        <div className="card-header">
          <h3>Active Companies</h3>
          <span className="card-icon">✅</span>
        </div>
        <div className="card-content">
          <div className="loading-skeleton">Loading...</div>
        </div>
      </div>
    );
  }

  const { active_companies, growth_this_month, growth_percent } = data;

  return (
    <div className="stat-card active-companies">
      <div className="card-header">
        <h3>Active Companies</h3>
        <span className="card-icon">✅</span>
      </div>
      <div className="card-content">
        <div className="main-stat">
          {active_companies?.toLocaleString() || '0'}
        </div>
        <div className="status-text">
          Currently active
        </div>
        {growth_this_month && growth_this_month > 0 && (
          <div className="growth-indicator">
            <span className="trend-up">↑</span>
            <span>+{growth_this_month} ({growth_percent?.toFixed(1)}%)</span>
            <div className="growth-period">this month</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActiveCompaniesCard;
