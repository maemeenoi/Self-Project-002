import React from 'react';
import { ProductionHealth } from '@/types/focusedPODashboard';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ProductionHealthWidgetProps {
  data: ProductionHealth;
}

const ProductionHealthWidget: React.FC<ProductionHealthWidgetProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-orange-600 bg-orange-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-4 h-4" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4" />;
      case 'down':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return 'text-green-600';
    if (uptime >= 99.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMTTRColor = (mttr: number) => {
    if (mttr <= 4) return 'text-green-600';
    if (mttr <= 8) return 'text-orange-600';
    return 'text-red-600';
  };

  const totalIncidents = data.incidents.critical + data.incidents.major + data.incidents.minor;

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-500" />
          <h3>Production Health</h3>
        </div>
      </div>

      {/* System Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">System Status</span>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.systemStatus)}`}>
            {getStatusIcon(data.systemStatus)}
            <span className="capitalize">{data.systemStatus === 'operational' ? 'All Systems Operational' : data.systemStatus}</span>
          </div>
        </div>
      </div>

      {/* Uptime */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Uptime</span>
          <span className={`text-2xl font-bold ${getUptimeColor(data.uptime)}`}>
            {data.uptime}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${data.uptime >= 99.9 ? 'bg-green-500' : data.uptime >= 99.5 ? 'bg-orange-500' : 'bg-red-500'}`}
            style={{ width: `${data.uptime}%` }}
          />
        </div>
      </div>

      {/* Incidents This Week */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Incidents This Week</span>
          <span className="text-lg font-semibold text-gray-900">{totalIncidents}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="text-lg font-bold text-red-600">{data.incidents.critical}</div>
            <div className="text-xs text-red-700">Critical</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-lg font-bold text-orange-600">{data.incidents.major}</div>
            <div className="text-xs text-orange-700">Major</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-lg font-bold text-yellow-600">{data.incidents.minor}</div>
            <div className="text-xs text-yellow-700">Minor</div>
          </div>
        </div>
      </div>

      {/* MTTR */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">MTTR</span>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${getMTTRColor(data.mttr)}`}>
              {data.mttr}h
            </div>
            <div className="text-xs text-gray-500">Target: &lt;4h</div>
          </div>
        </div>
        
        {/* MTTR Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${data.mttr <= 4 ? 'bg-green-500' : data.mttr <= 8 ? 'bg-orange-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min((data.mttr / 12) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="widget-footer">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {data.incidents.critical === 0 ? 'No critical incidents' : `${data.incidents.critical} critical incidents`}
          </span>
          <span className={`font-medium ${data.mttr <= 4 ? 'text-green-600' : 'text-orange-600'}`}>
            {data.mttr <= 4 ? 'Meeting SLA' : 'Above target'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductionHealthWidget;