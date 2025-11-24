'use client';

import React from 'react';
import { OptimizationProgressItem } from '@/types/ceoDashboard';
import { formatCurrencyExecutive } from '@/utils/ceoFormatters';
import { Settings, DollarSign, BarChart3, Target, CheckCircle, AlertCircle, Clock, Server, Database, Zap, Shield, Cloud } from 'lucide-react';

interface OptimizationProgressProps {
  data: OptimizationProgressItem[] | null;
  loading?: boolean;
}

const OptimizationProgress: React.FC<OptimizationProgressProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="ceo-card-pro">
        <div className="ceo-card-header">
          <h2 className="ceo-card-title">Optimization Progress</h2>
          <p className="ceo-card-subtitle">Quick view of optimization work in progress</p>
        </div>
        
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="ceo-card-pro">
        <div className="ceo-card-header">
          <h2 className="ceo-card-title">Optimization Progress</h2>
          <p className="ceo-card-subtitle">Quick view of optimization work in progress</p>
        </div>
        
        <div className="text-center py-12">
          <Settings size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No optimization data available</p>
        </div>
      </div>
    );
  }

  // Calculate summary metrics
  const totalTasks = data.reduce((sum, item) => sum + Math.floor((100 - item.progress) / 10), 0);
  const servicesCount = data.length;
  const totalOptimizationOpportunity = data.reduce((sum, item) => sum + (item.target - item.current), 0);
  const averageProgress = data.reduce((sum, item) => sum + item.progress, 0) / data.length;

  // Get top 2 priorities for display (lowest progress = highest priority)
  const topPriorities = [...data]
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 2);

  // Determine overall status
  const getOverallStatus = () => {
    if (averageProgress >= 90) return { status: 'Excellent', color: 'text-blue-700', bgColor: 'bg-white', borderColor: 'border-blue-200', Icon: CheckCircle };
    if (averageProgress >= 80) return { status: 'On Track', color: 'text-blue-700', bgColor: 'bg-white', borderColor: 'border-blue-200', Icon: BarChart3 };
    if (averageProgress >= 70) return { status: 'In Progress', color: 'text-blue-600', bgColor: 'bg-white', borderColor: 'border-blue-200', Icon: Clock };
    return { status: 'Needs Attention', color: 'text-gray-700', bgColor: 'bg-white', borderColor: 'border-gray-300', Icon: AlertCircle };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.Icon;
  
  // Calculate estimated completion time based on progress
  const estimatedWeeks = Math.ceil((100 - averageProgress) / 10);
  
  // Calculate potential monthly optimization value
  const potentialSavings = totalOptimizationOpportunity * 50; // $50 per optimization point

  return (
    <div className="ceo-card-pro">
      {/* Header */}
      <div className="ceo-card-header">
        <h2 className="ceo-card-title">Optimization Progress</h2>
        <p className="ceo-card-subtitle">Quick view of optimization work in progress</p>
      </div>

      {/* Main Metrics */}
      <div className="space-y-4">
        {/* Active Tasks */}
        <div className="flex items-center justify-between p-5 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
              <Settings size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-700">{totalTasks}</h3>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">Active Tasks</p>
              <p className="text-xs text-gray-500">Across {servicesCount} services</p>
            </div>
          </div>
        </div>

        {/* Projected Savings */}
        <div className="flex items-center justify-between p-5 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-700">
                {formatCurrencyExecutive(potentialSavings)}
              </h3>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">Optimization Potential</p>
              <p className="text-xs text-gray-500">{formatCurrencyExecutive(potentialSavings)}/month potential</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className={`flex items-center justify-between p-5 ${overallStatus.bgColor} rounded-lg border ${overallStatus.borderColor}`}>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
              <StatusIcon size={20} className={overallStatus.color} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status:</h3>
                <span className={`font-bold ${overallStatus.color}`}>
                  {overallStatus.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">Expected completion: {estimatedWeeks} week{estimatedWeeks !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Top Priorities */}
        <div className="bg-white rounded-lg border border-blue-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-blue-600" />
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Top Priorities</h4>
          </div>
          <div className="space-y-3">
            {topPriorities.map((item, index) => {
              const ServiceIcon = getServiceIcon(item.category);
              const progressPercentage = Math.round(item.progress);
              return (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                      <ServiceIcon size={16} className="text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">
                      {item.category || 'Unknown Service'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                      {progressPercentage}% complete
                    </span>
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Optimization in progress</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {averageProgress.toFixed(1)}% avg completion
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg flex-shrink-0">
            <BarChart3 size={16} />
          </div>
          <div>
            <h4 className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">Executive Summary</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>{totalTasks} optimization initiatives</strong> are actively improving efficiency across <strong>{servicesCount} services</strong>. 
              Current progress shows <strong>{averageProgress.toFixed(1)}% average completion</strong> with potential value of <strong>{formatCurrencyExecutive(potentialSavings)}/month</strong>. 
              Status: <strong className={overallStatus.color}>{overallStatus.status}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get service icons - returns Lucide React components
function getServiceIcon(serviceName: string | null | undefined): typeof Settings {
  if (!serviceName || typeof serviceName !== 'string') {
    return Settings;
  }
  
  const name = serviceName.toLowerCase();
  if (name.includes('ec2')) return Server;
  if (name.includes('s3')) return Database;
  if (name.includes('rds')) return Database;
  if (name.includes('lambda')) return Zap;
  if (name.includes('cloudwatch')) return BarChart3;
  if (name.includes('elb') || name.includes('load')) return Target;
  if (name.includes('vpc')) return Cloud;
  if (name.includes('iam')) return Shield;
  return Settings;
}

export default OptimizationProgress;
