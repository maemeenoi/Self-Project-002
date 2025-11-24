'use client'

import React from 'react'

interface DeploymentMetricsData {
  deploymentsThisWeek?: number
  successRate?: string
  averageDeployTime?: string
  rollbackRate?: string
}

interface DeploymentMetricsWidgetProps {
  data?: DeploymentMetricsData
}

const DeploymentMetricsWidget: React.FC<DeploymentMetricsWidgetProps> = ({ data = {} }) => {
  return (
    <div className="widget-card">
      <h2 className="widget-title">Deployment Metrics</h2>
      
      <div className="metrics-grid">
        <div className="metric-row">
          <span className="metric-label">Deployments This Week</span>
          <span className="metric-value">{data.deploymentsThisWeek || 12}</span>
        </div>
        
        <div className="metric-row">
          <span className="metric-label">Success Rate</span>
          <span className="metric-value success-badge">{data.successRate || '94%'}</span>
        </div>
        
        <div className="metric-row">
          <span className="metric-label">Average Deploy Time</span>
          <span className="metric-value">{data.averageDeployTime || '8.5 min'}</span>
        </div>
        
        <div className="metric-row">
          <span className="metric-label">Rollback Rate</span>
          <span className="metric-value rollback-badge">{data.rollbackRate || '6%'}</span>
        </div>
      </div>
    </div>
  )
}

export default DeploymentMetricsWidget
