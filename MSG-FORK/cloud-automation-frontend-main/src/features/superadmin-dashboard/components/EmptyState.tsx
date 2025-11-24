'use client'

import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  } | null;
}

function EmptyState({ 
  icon = '📭', 
  title = 'No data available',
  message = 'There is no data to display at the moment.',
  action = null
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      {action && (
        <button className="empty-action-btn" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
