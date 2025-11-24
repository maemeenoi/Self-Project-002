import React from 'react';
import { InfrastructureHealth } from '@/types/cloudDashboard';
import { Cloud, Cpu, HardDrive, Wifi, Activity, Globe } from 'lucide-react';

interface CloudInfrastructureHealthProps {
  data: InfrastructureHealth;
}

const CloudInfrastructureHealth: React.FC<CloudInfrastructureHealthProps> = ({ data }) => {
  const getUtilizationColor = (percentage: number) => {
    if (percentage <= 60) return 'bg-green-500';
    if (percentage <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getUtilizationStatus = (percentage: number) => {
    if (percentage <= 60) return 'healthy';
    if (percentage <= 80) return 'moderate';
    return 'high';
  };

  const getLatencyStatus = (latency: number) => {
    if (latency <= 50) return 'good';
    if (latency <= 100) return 'moderate';
    return 'high';
  };

  const getLatencyColor = (latency: number) => {
    if (latency <= 50) return 'text-green-600';
    if (latency <= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Cloud className="w-5 h-5 mr-2 text-blue-600" />
          Cloud Infrastructure Health
        </h3>
        <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
          {data.performance}
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Resource Utilization</h4>
        
        <div className="space-y-4">
          {/* CPU */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">CPU</span>
              <div className="flex-1 mx-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUtilizationColor(data.resourceUtilization.cpu)}`}
                    style={{ width: `${data.resourceUtilization.cpu}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">{data.resourceUtilization.cpu}%</span>
              <div className="text-xs text-green-600 capitalize">{getUtilizationStatus(data.resourceUtilization.cpu)}</div>
            </div>
          </div>

          {/* Memory */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <HardDrive className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Memory</span>
              <div className="flex-1 mx-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUtilizationColor(data.resourceUtilization.memory)}`}
                    style={{ width: `${data.resourceUtilization.memory}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">{data.resourceUtilization.memory}%</span>
              <div className="text-xs text-green-600 capitalize">{getUtilizationStatus(data.resourceUtilization.memory)}</div>
            </div>
          </div>

          {/* Disk */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <HardDrive className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Disk</span>
              <div className="flex-1 mx-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUtilizationColor(data.resourceUtilization.disk)}`}
                    style={{ width: `${data.resourceUtilization.disk}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">{data.resourceUtilization.disk}%</span>
              <div className="text-xs text-green-600 capitalize">{getUtilizationStatus(data.resourceUtilization.disk)}</div>
            </div>
          </div>

          {/* Network Latency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Network Latency</span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-semibold ${getLatencyColor(data.resourceUtilization.networkLatency)}`}>
                {data.resourceUtilization.networkLatency}ms
              </span>
              <div className="text-xs text-green-600 capitalize">{getLatencyStatus(data.resourceUtilization.networkLatency)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-scaling Events */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center space-x-3">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Auto-scaling Events</span>
          </div>
          <span className="text-lg font-bold text-blue-600">{data.autoScalingEvents} this week</span>
        </div>
      </div>

      {/* Regional Distribution */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Globe className="w-4 h-4 mr-1" />
          Regional Distribution
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">US-East</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{data.regionalDistribution.usEast}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">EU-West</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{data.regionalDistribution.euWest}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">APAC</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{data.regionalDistribution.apac}%</span>
          </div>
        </div>

        {/* Distribution Bar */}
        <div className="mt-3">
          <div className="flex h-2 rounded-lg overflow-hidden bg-gray-200">
            <div 
              className="bg-blue-500"
              style={{ width: `${data.regionalDistribution.usEast}%` }}
            />
            <div 
              className="bg-green-500"
              style={{ width: `${data.regionalDistribution.euWest}%` }}
            />
            <div 
              className="bg-purple-500"
              style={{ width: `${data.regionalDistribution.apac}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudInfrastructureHealth;
