import React from 'react';
import { CostSavingsLeaderboard } from '@/types/focusedPODashboard';
import { Trophy, TrendingUp, TrendingDown, Users } from 'lucide-react';

interface CostSavingsLeaderboardWidgetProps {
  data: CostSavingsLeaderboard;
}

const CostSavingsLeaderboardWidget: React.FC<CostSavingsLeaderboardWidgetProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend?: number) => {
    if (!trend || trend === 0) return null;
    if (trend > 0) return <TrendingUp className="w-3 h-3 text-green-500" />;
    return <TrendingDown className="w-3 h-3 text-red-500" />;
  };

  const getTrendText = (trend?: number) => {
    if (!trend || trend === 0) return '';
    if (trend > 0) return `↑${trend}`;
    return `↓${Math.abs(trend)}`;
  };

  return (
    <div className="widget-card gamification">
      <h2 className="widget-title">
        🏆 Cost Optimization Leaderboard
      </h2>
      
      <div className="leaderboard-summary mb-4">
        <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-orange-600 mb-1">
            {formatCurrency(data.totalSavings)}
          </div>
          <div className="text-sm text-orange-700">
            Company-wide Monthly Savings
          </div>
        </div>
      </div>

      <div className="leaderboard">
        {data.teams.map(team => (
          <div 
            key={team.rank} 
            className={`leaderboard-item ${team.highlight ? 'current-team' : ''}`}
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="rank-badge">{team.badge}</span>
              <div className="flex-1">
                <div className="team-name">{team.team}</div>
                {team.trend !== undefined && team.trend !== 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {getTrendIcon(team.trend)}
                    <span>{getTrendText(team.trend)} position</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="team-savings block">
                {formatCurrency(team.savings)}
              </span>
              <span className="text-xs text-gray-500">this month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Current Team Highlight */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Your Team Rank
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">
              #{data.currentTeamRank}
            </span>
            {data.teams.find(t => t.highlight)?.trend && (
              <span className="achievement-badge">
                {data.teams.find(t => t.highlight)?.trend! > 0 ? '📈 Rising' : '📉 Falling'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Motivation Section */}
      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="text-center">
          <div className="text-sm font-medium text-green-800 mb-1">
            🎯 Next Goal
          </div>
          <div className="text-xs text-green-700">
            {data.currentTeamRank > 1 ? (
              <>
                Save {formatCurrency(
                  data.teams[data.currentTeamRank - 2].savings - 
                  data.teams.find(t => t.highlight)!.savings + 100
                )} more to reach #{data.currentTeamRank - 1}
              </>
            ) : (
              'You\'re #1! Keep it up! 🎉'
            )}
          </div>
        </div>
      </div>

      {/* Data Source */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-xs text-blue-800 font-medium mb-1">
          📊 Data Source
        </div>
        <div className="text-xs text-blue-700">
          Cost Optimization Tracking System
        </div>
      </div>
    </div>
  );
};

export default CostSavingsLeaderboardWidget;
