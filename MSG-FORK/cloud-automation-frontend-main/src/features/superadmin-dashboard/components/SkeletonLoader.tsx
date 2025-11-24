'use client'

import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  type?: 'stat-card' | 'table' | 'list' | 'chart';
  count?: number;
}

function SkeletonLoader({ type = 'stat-card', count = 1 }: SkeletonLoaderProps) {
  if (type === 'stat-card') {
    return (
      <div className="skeleton-stat-card">
        <div className="skeleton-line skeleton-icon"></div>
        <div className="skeleton-line skeleton-label"></div>
        <div className="skeleton-line skeleton-value"></div>
        <div className="skeleton-line skeleton-context"></div>
      </div>
    );
  }
  
  if (type === 'table') {
    return (
      <div className="skeleton-table">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="skeleton-row">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (type === 'list') {
    return (
      <div className="skeleton-list">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="skeleton-list-item">
            <div className="skeleton-line skeleton-icon"></div>
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-subtitle"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (type === 'chart') {
    return (
      <div className="skeleton-chart">
        <div className="skeleton-line skeleton-chart-title"></div>
        <div className="skeleton-chart-bars">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-chart-bar" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
          ))}
        </div>
      </div>
    );
  }
  
  return null;
}

export default SkeletonLoader;
