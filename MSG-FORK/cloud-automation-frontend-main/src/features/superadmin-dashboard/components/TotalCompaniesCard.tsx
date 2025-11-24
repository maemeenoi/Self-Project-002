'use client'

import React from 'react';
import './StatCard.css';

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
  if (!data) {
    return (
      <div className="stat-card total-companies loading">
        <div className="card-header">
          <h3>Total Companies</h3>
          <span className="card-icon">🏢</span>
        </div>
        <div className="card-content">
          <div className="loading-skeleton">Loading...</div>
        </div>
      </div>
    );
  }

  const { total_companies, active_companies, inactive_companies, growth_this_month } = data;

  return (
    <div className="stat-card total-companies">
      <div className="card-header">
        <h3>Total Companies</h3>
        <span className="card-icon">🏢</span>
      </div>
      <div className="card-content">
        <div className="main-stat">
          {total_companies?.toLocaleString() || '0'}
        </div>
        <div className="stat-breakdown">
          <div className="breakdown-item active">
            <span className="indicator">●</span>
            <span>{active_companies || 0} active</span>
          </div>
          <div className="breakdown-item inactive">
            <span className="indicator">●</span>
            <span>{inactive_companies || 0} inactive</span>
          </div>
        </div>
        {growth_this_month && growth_this_month > 0 && (
          <div className="growth-indicator">
            <span className="trend-up">↑</span>
            <span>+{growth_this_month} this month</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TotalCompaniesCard;
