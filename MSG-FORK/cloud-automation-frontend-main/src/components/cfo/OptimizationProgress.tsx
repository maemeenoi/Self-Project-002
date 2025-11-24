'use client';

import React from 'react';
import { OptimizationProgress as OptimizationProgressType } from '@/types/cfoDashboard';
import { formatCurrencyExecutive } from '@/utils/ceoFormatters';

interface OptimizationProgressProps {
  data: OptimizationProgressType[] | null;
  loading?: boolean;
  lastUpdated?: Date;
}

const OptimizationProgress: React.FC<OptimizationProgressProps> = ({ data, loading, lastUpdated }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Optimisation Progress</h2>
          <p className="text-sm text-gray-500 mt-1">Quick view of optimisation work in progress</p>
        </div>
        
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded flex-1"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-blue-800">Optimisation Progress</h2>
          <p className="text-sm text-gray-500 mt-1">Quick view of optimisation work in progress</p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-500">No optimisation data available</p>
        </div>
      </div>
    );
  }

  // Calculate summary metrics using CEO data structure
  const totalCategories = data.length;
  const totalProgress = data.reduce((sum, item) => sum + item.progress, 0);
  const averageProgress = totalCategories > 0 ? totalProgress / totalCategories : 0;
  const completedTasks = data.filter(item => item.progress >= 90).length;
  const inProgressTasks = data.filter(item => item.progress < 90 && item.progress > 0).length;

  // Get categories with lowest progress (highest priority)
  const topPriorities = [...data]
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 4);

  // Calculate potential savings based on progress gaps
  const potentialSavings = data.reduce((sum, item) => {
    const gap = item.target - item.current;
    return sum + (gap * 100); // Simplified calculation
  }, 0);

    // Determine overall status based on average progress
  const getOverallStatus = () => {
    if (totalCategories === 0) return { status: 'No Data', color: 'text-gray-600' };
    if (averageProgress >= 80) return { status: 'On Track', color: 'text-blue-600' };
    if (averageProgress >= 50) return { status: 'In Progress', color: 'text-blue-600' };
    return { status: 'Needs Attention', color: 'text-yellow-600' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-blue-800">Optimisation Progress</h2>
        <p className="text-sm text-gray-500 mt-1">Quick view of optimisation work in progress</p>
      </div>

      {/* Main Metrics */}
      <div className="space-y-6">
        {/* Active Tasks */}
        <div className="flex items-center justify-between p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div>
            <h3 className="text-2xl font-bold text-blue-900">{inProgressTasks}</h3>
            <p className="text-blue-700 font-medium">Active Tasks</p>
            <p className="text-sm text-blue-600">Across {totalCategories} categories</p>
          </div>
        </div>

        {/* Projected Savings */}
        <div className="flex items-center justify-between p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div>
            <h3 className="text-2xl font-bold text-blue-900">
              {formatCurrencyExecutive(potentialSavings)}
            </h3>
            <p className="text-blue-700 font-medium">Optimization Potential</p>
            <p className="text-sm text-blue-600">{formatCurrencyExecutive(potentialSavings)}/month potential</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">Status:</h3>
              <span className={`font-bold ${overallStatus.color}`}>
                {overallStatus.status}
              </span>
            </div>
            <p className="text-gray-600">Average Progress: {averageProgress.toFixed(1)}%</p>
          </div>
        </div>

        {/* Top Priorities */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h4 className="font-semibold text-blue-900 mb-4">
            Top Priorities (Lowest Progress):
          </h4>
          <div className="space-y-3">
            {topPriorities.map((item, index) => {
              const progressPercentage = Math.round(item.progress);
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-blue-900">
                      {item.category || 'Unknown Category'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-900">
                      {progressPercentage}% complete
                    </div>
                    <div className="text-xs text-blue-600">
                      Target: {item.target.toFixed(1)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Optimization in progress</span>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Live Data
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div>
          <h4 className="font-semibold text-blue-900 mb-1">Executive Summary</h4>
          <p className="text-sm text-blue-800">
            <strong>{inProgressTasks} optimization initiatives</strong> are actively improving efficiency across <strong>{totalCategories} categories</strong>.
            Current progress shows <strong>{averageProgress.toFixed(1)}% average completion</strong> with potential value of <strong>{formatCurrencyExecutive(potentialSavings)}</strong>.
            Status: <strong className={overallStatus.color}>{overallStatus.status}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OptimizationProgress;
