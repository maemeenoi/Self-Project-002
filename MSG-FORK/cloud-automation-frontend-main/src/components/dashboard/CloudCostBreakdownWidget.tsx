import React from 'react';
import { TotalCloudCost } from '@/types/focusedPODashboard';
import { PieChart } from 'lucide-react';
import CloudCostBreakdownChart from '@/components/charts/CloudCostBreakdownChart';

interface CloudCostBreakdownWidgetProps {
  data: TotalCloudCost;
}

const CloudCostBreakdownWidget: React.FC<CloudCostBreakdownWidgetProps> = ({ data }) => {
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
          <PieChart className="w-5 h-5 text-gray-500" />
          <h3>Cloud Cost Breakdown</h3>
        </div>
        <div className="text-sm text-gray-600">
          {formatCurrency(data.currentMonth)} total
        </div>
      </div>
      
      <div className="cost-breakdown-chart">
        <CloudCostBreakdownChart 
          data={data.breakdown} 
          totalCost={data.currentMonth} 
        />
      </div>

      {/* Cost Efficiency Metrics */}
      <div className="cost-efficiency-section mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">$2.45</div>
            <div className="text-gray-600">Cost per User</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">10,240</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">-9.2%</div>
            <div className="text-gray-600">Efficiency vs Last Month</div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="widget-footer">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {formatCurrency(data.breakdown.compute)}
            </div>
            <div className="text-gray-600">Largest: Compute</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {Math.round((data.breakdown.compute / data.currentMonth) * 100)}%
            </div>
            <div className="text-gray-600">of total cost</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudCostBreakdownWidget;
