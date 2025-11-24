import React from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { FlowMetrics } from '@/types/dashboard';
import { BarChart3 } from 'lucide-react';

interface FlowMetricsChartProps {
  data: FlowMetrics[];
}

const FlowMetricsChart: React.FC<FlowMetricsChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name === 'Cycle Time' ? ' days' : ' stories'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Flow Metrics (Last 4 Weeks)
        </h3>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              label={{ value: 'Stories', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              label={{ value: 'Days', angle: 90, position: 'insideRight' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="throughput" 
              fill="#3B82F6" 
              name="Throughput"
              radius={[4, 4, 0, 0]}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="cycleTime" 
              stroke="#EF4444" 
              strokeWidth={3}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              name="Cycle Time"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data[data.length - 1]?.throughput || 0}
          </div>
          <div className="text-sm text-gray-600">Current Week Throughput</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {data[data.length - 1]?.cycleTime || 0} days
          </div>
          <div className="text-sm text-gray-600">Current Cycle Time</div>
        </div>
      </div>
    </div>
  );
};

export default FlowMetricsChart;
