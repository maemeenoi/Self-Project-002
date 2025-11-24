'use client'

import React from 'react';
import './Widget.css';

interface CriticalAlertsProps {
  data?: any[];
}

function CriticalAlerts({ data }: CriticalAlertsProps) {
  return (
    <div className="superadmin-widget-card critical-alerts">
      <div className="widget-header">
        <h3>Critical Alerts</h3>
      </div>
      <div className="widget-content">
        <div className="alert-placeholder">
          <div className="empty-state">
            <span className="empty-icon">✅</span>
            <p>No critical alerts at this time</p>
            <small>All systems are operating normally</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CriticalAlerts;
