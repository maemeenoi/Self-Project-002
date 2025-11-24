import React from 'react';

interface DeploymentMetricsData {
  deploymentsThisWeek: number;
  successRate: string;
  averageDeployTime: string;
  rollbackRate: string;
}

interface DeploymentMetricsWidgetProps {
  data: DeploymentMetricsData;
}

const DeploymentMetricsWidget: React.FC<DeploymentMetricsWidgetProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Deployment Metrics</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3">
          <span className="text-base font-medium text-gray-700">Deployments This Week</span>
          <span className="text-xl font-semibold text-gray-900">{data.deploymentsThisWeek}</span>
        </div>
        
        <div className="flex items-center justify-between py-3">
          <span className="text-base font-medium text-gray-700">Success Rate</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            {data.successRate}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-3">
          <span className="text-base font-medium text-gray-700">Average Deploy Time</span>
          <span className="text-xl font-semibold text-gray-900">{data.averageDeployTime}</span>
        </div>
        
        <div className="flex items-center justify-between py-3">
          <span className="text-base font-medium text-gray-700">Rollback Rate</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
            {data.rollbackRate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeploymentMetricsWidget;
