'use client'

import React from 'react';
import './StatCard.css';

interface TotalUsersData {
  total_users: number;
  admin_users: number;
  regular_users: number;
  growth_this_month?: number;
}

interface TotalUsersCardProps {
  data?: TotalUsersData;
}

function TotalUsersCard({ data }: TotalUsersCardProps) {
  if (!data) {
    return (
      <div className="stat-card total-users loading">
        <div className="card-header">
          <h3>Total Users</h3>
          <span className="card-icon">👥</span>
        </div>
        <div className="card-content">
          <div className="loading-skeleton">Loading...</div>
        </div>
      </div>
    );
  }

  const { total_users, admin_users, regular_users, growth_this_month } = data;

  return (
    <div className="stat-card total-users">
      <div className="card-header">
        <h3>Total Users</h3>
        <span className="card-icon">👥</span>
      </div>
      <div className="card-content">
        <div className="main-stat">
          {total_users?.toLocaleString() || '0'}
        </div>
        <div className="stat-breakdown">
          <div className="breakdown-item admin">
            <span className="indicator">●</span>
            <span>{admin_users || 0} admins</span>
          </div>
          <div className="breakdown-item regular">
            <span className="indicator">●</span>
            <span>{regular_users || 0} regular users</span>
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

export default TotalUsersCard;
