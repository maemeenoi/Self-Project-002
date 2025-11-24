import React from 'react';
import { CustomerHealth } from '@/types/costOptimizationDashboard';
import { Users, Activity, Clock, TrendingUp, MessageSquare } from 'lucide-react';

interface CustomerEngagementWidgetProps {
  data: CustomerHealth;
}

const CustomerEngagementWidget: React.FC<CustomerEngagementWidgetProps> = ({ data }) => {
  const getEngagementColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getEngagementStatus = (percentage: number) => {
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 70) return 'Good';
    return 'Needs Attention';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Customer Engagement
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getEngagementColor(data.weeklyActivePercent)}`}>
          {getEngagementStatus(data.weeklyActivePercent)}
        </div>
      </div>

      {/* Engagement Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-blue-600 mb-1">
            {data.activeUsers}
          </div>
          <div className="text-sm font-medium text-blue-800">Active Users</div>
          <div className="text-xs text-blue-600">This Week</div>
        </div>

        <div className={`rounded-lg p-3 text-center border ${getEngagementColor(data.weeklyActivePercent)}`}>
          <div className="text-xl font-bold mb-1">
            {data.weeklyActivePercent}%
          </div>
          <div className="text-sm font-medium">Weekly Active</div>
          <div className="text-xs">Platform Usage</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-600 mb-1">
            {data.avgSessionDuration} min
          </div>
          <div className="text-sm font-medium text-green-800">Avg Session</div>
          <div className="text-xs text-green-600">Duration</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-orange-600 mb-1">
            {data.featureAdoption}%
          </div>
          <div className="text-sm font-medium text-orange-800">Feature Adoption</div>
          <div className="text-xs text-orange-600">Rate</div>
        </div>
      </div>

      {/* Engagement Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-blue-900">Platform Usage</span>
              <div className="text-xs text-blue-700">Weekly active users</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">{data.weeklyActivePercent}%</div>
            <div className="text-xs text-blue-600">of total users</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-green-900">Session Duration</span>
              <div className="text-xs text-green-700">Average time spent</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">{data.avgSessionDuration} min</div>
            <div className="text-xs text-green-600">per session</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-orange-900">Feature Adoption</span>
              <div className="text-xs text-orange-700">New features used</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-orange-600">{data.featureAdoption}%</div>
            <div className="text-xs text-orange-600">adoption rate</div>
          </div>
        </div>
      </div>

      {/* Top Customer Requests */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <MessageSquare className="w-4 h-4 mr-1" />
          Top Customer Requests
        </h4>
        
        <div className="space-y-3">
          {data.topRequests.map((request, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-xs font-bold">
                  #{index + 1}
                </div>
                <span className="text-sm font-medium text-gray-700">{request.feature}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">{request.votes}</span>
                <span className="text-xs text-gray-500">votes</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Total requests: {data.topRequests.reduce((sum, req) => sum + req.votes, 0)}
            </span>
            <button className="text-purple-600 hover:text-purple-800 font-medium">
              View All Requests →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerEngagementWidget;
