'use client'

import React from 'react';
import './StatCard.css';
import './StatCardStyles.css';

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
  // Mock data if no data provided
  const mockData = {
    total_users: 0,
    admin_users: 0,
    regular_users: 0,
    growth_this_month: 0
  };

  const usersData = data || mockData;
  const { total_users, admin_users, regular_users, growth_this_month } = usersData;

  return (
    <div className="cm-stat-card">
      <div className="cm-stat-icon purple">
        <span style={{fontSize: '20px'}}>👥</span>
      </div>
      <div className="cm-stat-content">
        <p className="cm-stat-label">Total Users</p>
        <p className="cm-stat-value">{total_users?.toLocaleString() || '0'}</p>
        <div className="stat-breakdown-mini">
          <span style={{fontSize: '12px', color: '#7C3AED'}}>{admin_users || 0} admins</span>
          <span style={{fontSize: '12px', color: '#6B7280'}}>{regular_users || 0} users</span>
        </div>
      </div>
    </div>
  );
}

export default TotalUsersCard;
