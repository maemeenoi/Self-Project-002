import React from 'react';
import { TeamRanking } from '@/types/focusedPODashboard';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EnhancedTeamRankingWidgetProps {
  data: TeamRanking;
}

const EnhancedTeamRankingWidget: React.FC<EnhancedTeamRankingWidgetProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-2xl">🏆</span>; // Trophy
      case 2:
        return <span className="text-2xl">🥈</span>; // Silver medal
      case 3:
        return <span className="text-2xl">🥉</span>; // Bronze medal
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900'; // Gold
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900'; // Silver
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900'; // Bronze
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="widget-card gamification-enhanced">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h3>Team Optimization Ranking</h3>
        </div>
        <div className="company-total text-sm font-medium text-gray-600">
          Company: {formatCurrency(data.companyTotal)}/month
        </div>
      </div>

      {/* Current Team Highlight */}
      <div className="current-team-highlight mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getRankIcon(data.rank)}
            <div>
              <div className="font-semibold text-blue-900">Your Team Rank</div>
              <div className="text-sm text-blue-700">#{data.rank} of {data.totalTeams} teams</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-900">
              {formatCurrency(data.savings)}
            </div>
            <div className="text-sm text-blue-700">monthly savings</div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="leaderboard-table">
        <div className="table-header grid grid-cols-12 gap-2 pb-2 mb-3 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <div className="col-span-1">Rank</div>
          <div className="col-span-6">Team</div>
          <div className="col-span-4 text-right">Savings</div>
          <div className="col-span-1"></div>
        </div>
        
        <div className="space-y-2">
          {data.teams.map((team) => (
            <div
              key={team.rank}
              className={`team-row grid grid-cols-12 gap-2 items-center p-3 rounded-lg transition-all duration-200 ${
                team.isCurrentTeam
                  ? 'bg-blue-50 border-2 border-blue-300 shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {/* Rank with Icon */}
              <div className="col-span-1 flex justify-center">
                {getRankIcon(team.rank)}
              </div>
              
              {/* Team Name */}
              <div className="col-span-6">
                <div className={`font-medium ${team.isCurrentTeam ? 'text-blue-900' : 'text-gray-900'}`}>
                  {team.name}
                  {team.isCurrentTeam && (
                    <span className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-semibold">
                      YOU
                    </span>
                  )}
                </div>
              </div>
              
              {/* Savings Amount */}
              <div className="col-span-4 text-right">
                <div className={`font-semibold ${team.isCurrentTeam ? 'text-blue-900' : 'text-gray-900'}`}>
                  {formatCurrency(team.savings)}
                </div>
              </div>
              
              {/* Trend Indicator */}
              <div className="col-span-1 flex justify-center">
                {getTrendIcon(team.trend)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="widget-footer mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              #{data.rank}
            </div>
            <div className="text-gray-600">Your Position</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {Math.round((data.savings / data.companyTotal) * 100)}%
            </div>
            <div className="text-gray-600">of Company Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTeamRankingWidget;
