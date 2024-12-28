'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function ProgressChart({ data, bodyPart }) {
  const chartData = {
    labels: Object.keys(data.monthlyProgress || {}),
    datasets: [
      {
        label: 'Progress',
        data: Object.values(data.monthlyProgress || {}).map(v => parseFloat(v)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1
      },
      {
        label: 'Goal',
        data: Object.keys(data.monthlyProgress || {}).map(() => 
          parseFloat(data.baseline) * (1 + parseFloat(data.goalPercentage) / 100)
        ),
        borderColor: 'rgb(234, 179, 8)',
        borderDash: [5, 5],
        tension: 0
      },
      {
        label: 'Baseline',
        data: Object.keys(data.monthlyProgress || {}).map(() => parseFloat(data.baseline)),
        borderColor: 'rgb(107, 114, 128)',
        borderDash: [2, 2],
        tension: 0
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${bodyPart} Progress`
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Inches'
        }
      }
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-4">
      <Line data={chartData} options={options} />
    </div>
  )
} 