import React from 'react';
import { OptimizationRate } from '@/types/focusedPODashboard';
import { Target, Trophy, TrendingUp } from 'lucide-react';

interface OptimizationScoreWidgetProps {
  data: OptimizationRate;
}

const OptimizationScoreWidget: React.FC<OptimizationScoreWidgetProps> = ({ data }) => {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (data.score / 100) * circumference;

  const getScoreColor = () => {
    if (data.score >= 80) return '#10b981'; // green
    if (data.score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreStatus = () => {
    if (data.score >= 80) return 'Excellent';
    if (data.score >= 60) return 'Good';
    return 'Needs Work';
  };

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  return (
    <div className="widget-card gamification">
      <h2 className="widget-title">
        🎯 Optimization Score
      </h2>
      
      <div className="optimization-display">
        <div className="score-circle mb-4">
          <svg viewBox="0 0 100 100" className="w-32 h-32">
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#e5e7eb" 
              strokeWidth="8"
            />
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke={getScoreColor()}
              strokeWidth="8"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <div className="score-number" style={{ color: getScoreColor() }}>
            {data.score}%
          </div>
        </div>
        
        <div className="score-breakdown grid grid-cols-2 gap-4 mb-4">
          <div className="score-item text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="block text-lg font-bold text-green-600">{data.optimized}</span>
            <span className="text-xs text-green-700">Optimized</span>
          </div>
          <div className="score-item text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <span className="block text-lg font-bold text-orange-600">{data.remaining}</span>
            <span className="text-xs text-orange-700">Remaining</span>
          </div>
        </div>

        <div className="score-status text-center mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            data.score >= 80 ? 'bg-green-100 text-green-800' :
            data.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            <Target className="w-4 h-4" />
            {getScoreStatus()}
          </div>
        </div>
        
        <div className="leaderboard-rank text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="text-lg font-bold text-gray-900">
              Rank #{data.rank}
            </span>
            <span className="text-2xl">{data.badge}</span>
          </div>
          <div className="text-sm text-gray-600">
            {data.rank}{getRankSuffix(data.rank)} out of {data.totalTeams} teams
          </div>
        </div>

        {/* Achievement Progress */}
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-800">
              Next Achievement
            </span>
            <span className="text-xs text-purple-600">
              {Math.max(0, 85 - data.score)}% to go
            </span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((data.score / 85) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-purple-700 mt-1">
            🏆 "Cost Optimization Expert" at 85%
          </div>
        </div>
      </div>

      {/* Data Source */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-xs text-blue-800 font-medium mb-1">
          📊 Calculation
        </div>
        <div className="text-xs text-blue-700">
          (Resolved Issues ÷ Total Issues) × 100
        </div>
      </div>
    </div>
  );
};

export default OptimizationScoreWidget;
