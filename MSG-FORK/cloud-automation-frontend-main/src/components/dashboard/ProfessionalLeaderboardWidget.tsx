import React from 'react';
import { CostSavingsLeaderboard } from '@/types/focusedPODashboard';
import { Users } from 'lucide-react';

interface ProfessionalLeaderboardWidgetProps {
  data: CostSavingsLeaderboard;
}

const ProfessionalLeaderboardWidget: React.FC<ProfessionalLeaderboardWidgetProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <h3>Team Optimization Ranking</h3>
        </div>
        <div className="company-total text-sm text-gray-600">
          Company-wide: {formatCurrency(data.totalSavings)}/month
        </div>
      </div>
      
      <table className="ranking-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th className="text-right">Savings</th>
          </tr>
        </thead>
        <tbody>
          {data.teams.map(team => (
            <tr 
              key={team.rank} 
              className={team.highlight ? 'current-team' : ''}
            >
              <td className="rank-cell">#{team.rank}</td>
              <td>
                <div className="team-name">{team.team}</div>
                {team.trend !== undefined && team.trend !== 0 && (
                  <div className="position-change">
                    {team.trend > 0 ? '↑' : '↓'} {Math.abs(team.trend)} position
                  </div>
                )}
              </td>
              <td className="savings-cell">{formatCurrency(team.savings)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="widget-footer">
        <span>Your team rank: #{data.currentTeamRank} of {data.teams.length}</span>
      </div>
    </div>
  );
};

export default ProfessionalLeaderboardWidget;