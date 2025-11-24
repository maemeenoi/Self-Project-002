'use client';

import React from 'react';
import { TeamPerformanceItem } from '@/types/productOwnerDashboard';
import { formatCycleTime, calculatePerformanceRanking } from '@/utils/productOwnerFormatters';

interface TeamOptimizationRankingProps {
  data: TeamPerformanceItem[] | null;
  loading?: boolean;
}

const TeamOptimizationRanking: React.FC<TeamOptimizationRankingProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="widget-card">
        <div className="animate-pulse">
          <div className="widget-header">
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-2 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="widget-card">
        <div className="widget-header">
          <h3 className="widget-title">Team Optimization Ranking (Real Data)</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">This Sprint</span>
        </div>
        
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">👥</div>
          <p className="text-gray-500">No team data available</p>
          <p className="text-sm text-gray-400">Configure workflow integrations to see team performance</p>
        </div>
      </div>
    );
  }

  // Sort by items completed (descending)
  const sortedTeam = [...data].sort((a, b) => (b.items_completed || 0) - (a.items_completed || 0));
  
  // Take top 5
  const topPerformers = sortedTeam.slice(0, 5);
  
  // Calculate totals
  const totalTasks = data.reduce((sum, member) => sum + (member.items_completed || 0), 0);
  const avgCycleTime = data.length > 0 
    ? data.reduce((sum, member) => sum + (member.avg_cycle || 0), 0) / data.length 
    : 0;

  // Medal emojis
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h3 className="widget-title">Team Optimization Ranking (Real Data)</h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">This Sprint</span>
      </div>

      <div className="space-y-4">
        {topPerformers.map((member, index) => {
          const ranking = calculatePerformanceRanking(member, data);
          const maxTasks = sortedTeam[0]?.items_completed || 1;
          const velocityPercent = ((member.items_completed || 0) / maxTasks) * 100;
          
          return (
            <div key={member.Assignee} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{medals[index] || `${index + 1}.`}</span>
                  <span className="font-medium text-gray-900">{member.Assignee || 'Unknown'}</span>
                </div>
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {ranking.badge}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span>{member.items_completed || 0} tasks</span>
                <span>•</span>
                <span>{formatCycleTime(member.avg_cycle)} avg</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${velocityPercent}%`}}
                ></div>
              </div>
              <div className="text-right text-xs text-gray-500">
                {velocityPercent.toFixed(0)}% of top performer
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{totalTasks}</div>
            <div className="text-sm text-gray-600">Team Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{formatCycleTime(avgCycleTime)}</div>
            <div className="text-sm text-gray-600">Avg Cycle Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamOptimizationRanking;

