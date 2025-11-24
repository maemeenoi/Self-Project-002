import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CostBreakdownData {
  compute: number;
  storage: number;
  database: number;
  network: number;
  other: number;
}

interface CloudCostBreakdownChartProps {
  data: CostBreakdownData;
  totalCost: number;
}

const CloudCostBreakdownChart: React.FC<CloudCostBreakdownChartProps> = ({ 
  data, 
  totalCost 
}) => {
  // Calculate percentages
  const computePercent = Math.round((data.compute / totalCost) * 100);
  const storagePercent = Math.round((data.storage / totalCost) * 100);
  const databasePercent = Math.round((data.database / totalCost) * 100);
  const networkPercent = Math.round((data.network / totalCost) * 100);
  const otherPercent = Math.round((data.other / totalCost) * 100);

  // Use consistent colors matching utilization bars
  const colors = [
    '#3b82f6', // Blue for Compute
    '#10b981', // Green for Storage
    '#f59e0b', // Orange for Database
    '#8b5cf6', // Purple for Network
    '#6b7280', // Gray for Other
  ];

  const chartData = {
    labels: [
      `Compute (EC2) - ${computePercent}%`,
      `Storage (S3/EBS) - ${storagePercent}%`,
      `Database (RDS) - ${databasePercent}%`,
      `Network - ${networkPercent}%`,
      `Other Services - ${otherPercent}%`,
    ],
    datasets: [
      {
        data: [
          data.compute,
          data.storage,
          data.database,
          data.network,
          data.other,
        ],
        backgroundColor: colors,
        borderColor: colors.map(color => color),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%', // Makes it a donut chart
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
          color: '#6b7280',
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i] as number;
                const percentage = Math.round((value / totalCost) * 100);
                
                // Handle backgroundColor and borderColor arrays safely
                const bgColors = Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor : [];
                const borderColors = Array.isArray(dataset.borderColor) ? dataset.borderColor : [];
                
                return {
                  text: `${String(label).split(' - ')[0]} - $${value.toLocaleString()} (${percentage}%)`,
                  fillStyle: (bgColors[i] as string) || '#3B82F6',
                  strokeStyle: (borderColors[i] as string) || '#1E40AF',
                  lineWidth: (dataset.borderWidth as number) || 1,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const percentage = Math.round((value / totalCost) * 100);
            return [
              `Cost: $${value.toLocaleString()}`,
              `Percentage: ${percentage}%`
            ];
          }
        }
      },
    },
    elements: {
      arc: {
        borderJoinStyle: 'round',
      },
    },
  };

  return (
    <div className="h-80">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default CloudCostBreakdownChart;
