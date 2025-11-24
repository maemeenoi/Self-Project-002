import React from 'react';
import { OptimizationRate } from '@/types/focusedPODashboard';
import { Target } from 'lucide-react';
import OptimizationTrendChart from '@/components/charts/OptimizationTrendChart';

interface ProfessionalOptimizationWidgetProps {
  data: OptimizationRate;
}

const ProfessionalOptimizationWidget: React.FC<ProfessionalOptimizationWidgetProps> = ({ data }) => {
  const getScoreColor = () => {
    if (data.score >= 80) return '#10b981'; // green
    if (data.score >= 60) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getScoreStatus = () => {
    if (data.score >= 80) return 'Excellent';
    if (data.score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-gray-500" />
          <h3 className="widget-title">Cost Optimization Progress</h3>
        </div>
      </div>
      
      <div className="optimization-progress">
        <div className="progress-header flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">6-Month Optimization Trend</span>
          <span className="score-value text-2xl font-bold" style={{ color: getScoreColor() }}>
            {data.score}%
          </span>
        </div>
        
        <div className="mb-4">
          <OptimizationTrendChart data={data} />
        </div>
        
        <div className="progress-meta space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Issues resolved:</span>
            <span className="font-medium text-gray-900">{data.optimized}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Issues remaining:</span>
            <span className="font-medium text-gray-900">{data.remaining}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Team rank:</span>
            <span className="font-medium text-gray-900">
              #{data.rank} of {data.totalTeams}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <span 
              className="inline-block px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: data.score >= 80 ? '#d1fae5' : data.score >= 60 ? '#fef3c7' : '#fee2e2',
                color: data.score >= 80 ? '#065f46' : data.score >= 60 ? '#92400e' : '#991b1b'
              }}
            >
              {getScoreStatus()}
            </span>
          </div>
        </div>

        {/* Next Goal */}
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-500">
            {data.score < 85 ? `${85 - data.score}% to next milestone` : 'Goal achieved!'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalOptimizationWidget;
