import React from 'react';
import { DeliverySpeed } from '@/types/cloudDashboard';
import { Zap, Clock, CheckCircle, TrendingUp, Target } from 'lucide-react';

interface DeliverySpeedMetricsProps {
  data: DeliverySpeed;
}

const DeliverySpeedMetrics: React.FC<DeliverySpeedMetricsProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'behind':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'ahead':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-4 h-4" />;
      case 'behind':
        return <Clock className="w-4 h-4" />;
      case 'ahead':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-orange-600" />
          Delivery Speed Metrics
        </h3>
      </div>

      {/* Core Metrics */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium text-blue-900">Deployment Frequency</span>
          </div>
          <span className="text-xl font-bold text-blue-600">{data.deploymentFrequency} per week</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium text-green-900">Average Deploy Time</span>
          </div>
          <span className="text-xl font-bold text-green-600">{data.avgDeployTime} minutes</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">Success Rate</span>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            {data.successRate}%
          </span>
        </div>
      </div>

      {/* Time to Market Section */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Target className="w-4 h-4 mr-1" />
          Time to Market
        </h4>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">From commit to production</span>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(data.timeToMarket.status)}`}>
              {getStatusIcon(data.timeToMarket.status)}
              <span>{data.timeToMarket.status === 'behind' ? 'Slightly behind' : data.timeToMarket.status}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{data.timeToMarket.current} weeks</div>
              <div className="text-xs text-gray-500">Current</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-600">{data.timeToMarket.target} weeks</div>
              <div className="text-xs text-gray-500">Target</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Delivery Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-purple-900 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-1" />
          Feature Delivery
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.featureDelivery.thisMonth}</div>
            <div className="text-sm text-purple-700">Features shipped this month</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">{data.featureDelivery.average}</div>
            <div className="text-sm text-purple-700">Average per month</div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-purple-200">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              +{data.featureDelivery.trend}% increase
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverySpeedMetrics;
