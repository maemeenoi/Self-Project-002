import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SavingsOpportunities } from '@/types/focusedPODashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SavingsBarChartProps {
  data: SavingsOpportunities;
}

const SavingsBarChart: React.FC<SavingsBarChartProps> = ({ data }) => {
  // Sort opportunities by savings amount (descending) and take top 5
  const sortedOpportunities = [...data.opportunities]
    .sort((a, b) => b.saving - a.saving)
    .slice(0, 5);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10b981'; // Green - easy to implement
      case 'medium': return '#f59e0b'; // Orange - moderate effort
      case 'hard': return '#ef4444'; // Red - significant effort
      default: return '#6b7280';
    }
  };

  const chartData = {
    labels: sortedOpportunities.map(opp => 
      opp.title.length > 25 ? opp.title.substring(0, 25) + '...' : opp.title
    ),
    datasets: [
      {
        label: 'Monthly Savings',
        data: sortedOpportunities.map(opp => opp.saving),
        backgroundColor: sortedOpportunities.map(opp => getDifficultyColor(opp.difficulty)),
        borderColor: sortedOpportunities.map(opp => getDifficultyColor(opp.difficulty)),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const, // Horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            return sortedOpportunities[index].title;
          },
          label: function(context) {
            const index = context.dataIndex;
            const opportunity = sortedOpportunities[index];
            return [
              `Savings: $${context.parsed.x.toLocaleString()}/month`,
              `Difficulty: ${opportunity.difficulty}`,
              `Category: ${opportunity.category}`,
              opportunity.estimatedHours ? `Est. time: ${opportunity.estimatedHours}h` : ''
            ].filter(Boolean);
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: function(value) {
            return '$' + Number(value).toLocaleString();
          },
        },
      },
      y: {
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
    },
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SavingsBarChart;
