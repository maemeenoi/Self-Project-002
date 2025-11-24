import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { OptimizationRate } from '@/types/focusedPODashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface OptimizationTrendChartProps {
  data: OptimizationRate;
}

const OptimizationTrendChart: React.FC<OptimizationTrendChartProps> = ({ data }) => {
  const chartData = {
    labels: data.monthlyTrend.map(point => point.month),
    datasets: [
      {
        label: 'Optimization Score',
        data: data.monthlyTrend.map(point => point.score),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Target',
        data: data.monthlyTrend.map(() => data.target),
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
      }
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
          color: '#6b7280',
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
            if (context.datasetIndex === 0) {
              return `Score: ${context.parsed.y}%`;
            } else {
              return `Target: ${context.parsed.y}%`;
            }
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
    elements: {
      point: {
        hoverBorderWidth: 3,
      },
    },
  };

  return (
    <div className="h-48">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default OptimizationTrendChart;
