'use client';

import React from 'react';
import { OptimizationProgressItem } from '@/types/ceoDashboard';
import { formatCurrencyExecutive, getPriorityLevel } from '@/utils/ceoFormatters';
import { Target, CheckCircle, TrendingUp, Server, Database, Zap, Shield, Cloud, Settings } from 'lucide-react';

interface StrategicInitiativesProps {
  data: OptimizationProgressItem[] | null;
  loading?: boolean;
}

const StrategicInitiatives: React.FC<StrategicInitiativesProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="ceo-card-pro">
        <div className="ceo-card-header">
          <h2 className="ceo-card-title">Strategic Initiatives Progress</h2>
          <p className="ceo-card-subtitle">Optimization initiatives and their impact</p>
        </div>
        
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
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
          <h2 className="ceo-card-title">Strategic Initiatives Progress</h2>
          <p className="ceo-card-subtitle">Optimization initiatives and their impact</p>
        </div>
        
        <div className="text-center py-12">
          <Target size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No strategic initiatives data available</p>
        </div>
      </div>
    );
  }

  // Calculate summary metrics from real optimization data
  const totalInitiatives = data.length;
  const averageProgress = data.reduce((sum, item) => sum + item.progress, 0) / data.length;
  const totalOptimizationGap = data.reduce((sum, item) => sum + (item.target - item.current), 0);
  const completedInitiatives = data.filter(item => item.progress >= 90).length;

  // Sort by optimization priority (lowest progress = highest priority)
  const sortedInitiatives = [...data]
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 5); // Show top 5 for CEO view

  return (
    <div className="ceo-card-pro">
      {/* Header */}
      <div className="ceo-card-header">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="ceo-card-title">Strategic Initiatives Progress</h2>
            <p className="ceo-card-subtitle">Optimization initiatives and their impact</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
              <Target size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{totalInitiatives}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Active Initiatives</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
              <CheckCircle size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{completedInitiatives}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Completed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {averageProgress.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Average Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Initiatives Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b border-gray-200">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Initiative</div>
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">Progress</div>
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">Target</div>
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">Priority</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200 bg-white">
          {sortedInitiatives.map((initiative, index) => {
            const priority = initiative.progress < 70 ? 'High' : initiative.progress < 85 ? 'Medium' : 'Low';
            const ServiceIcon = getServiceIcon(initiative.category);
            
            return (
              <div key={index} className="grid grid-cols-4 gap-4 p-4 hover:bg-gray-50 transition-colors">
                {/* Initiative Name */}
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <ServiceIcon size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {initiative.category} Optimization
                    </div>
                    <div className="text-xs text-gray-500">
                      Efficiency improvement
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="text-right">
                  <div className="text-base font-semibold text-gray-900">
                    {initiative.progress.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Current: {initiative.current.toFixed(1)}
                  </div>
                </div>

                {/* Target */}
                <div className="text-center">
                  <div className="text-base font-semibold text-gray-900">
                    {initiative.target.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Target value
                  </div>
                </div>

                {/* Priority */}
                <div className="text-center flex items-center justify-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                    priority === 'High' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    priority === 'Medium' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {priority}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                averageProgress >= 85 ? 'bg-blue-600' : 
                averageProgress >= 70 ? 'bg-blue-400' : 'bg-gray-400'
              }`}></span>
              <span className="text-sm text-gray-600 font-medium">
                {averageProgress >= 85 ? 'On Track' : averageProgress >= 70 ? 'In Progress' : 'Needs Attention'}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {completedInitiatives}/{totalInitiatives} completed
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Average:</span> {averageProgress.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get service icons - now returns Lucide React components
function getServiceIcon(serviceName: string | null | undefined): typeof Settings {
  if (!serviceName || typeof serviceName !== 'string') {
    return Settings;
  }
  
  const name = serviceName.toLowerCase();
  if (name.includes('ec2')) return Server;
  if (name.includes('s3')) return Database;
  if (name.includes('rds')) return Database;
  if (name.includes('lambda')) return Zap;
  if (name.includes('cloudwatch')) return TrendingUp;
  if (name.includes('elb') || name.includes('load')) return Target;
  if (name.includes('vpc')) return Cloud;
  if (name.includes('iam')) return Shield;
  return Settings;
}

export default StrategicInitiatives;
