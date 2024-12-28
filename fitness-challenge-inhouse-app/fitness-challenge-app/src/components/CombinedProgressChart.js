'use client'

import { useState } from 'react'
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
import { getBodyPartLabel, MONTHS } from '@/utils/helpers'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const COLORS = [
  'rgb(59, 130, 246)', // blue
  'rgb(16, 185, 129)', // green
  'rgb(239, 68, 68)',  // red
  'rgb(245, 158, 11)'  // amber
]

export default function CombinedProgressChart({ measurements, selectedParts }) {
  const [selectedPart, setSelectedPart] = useState('all')

  const calculateProgress = (current, baseline, goalPercentage) => {
    if (!baseline || !current) return null
    const baselineNum = parseFloat(baseline)
    const currentNum = parseFloat(current)
    const goalNum = parseFloat(goalPercentage)
    
    if (isNaN(baselineNum) || isNaN(currentNum) || isNaN(goalNum)) return null

    // For decrease goals (negative percentage)
    if (goalNum < 0) {
      const targetDecrease = Math.abs(baselineNum * (goalNum / 100))
      const actualDecrease = baselineNum - currentNum
      return (actualDecrease / targetDecrease) * 100
    }
    
    // For increase goals (positive percentage)
    const targetIncrease = baselineNum * (goalNum / 100)
    const actualIncrease = currentNum - baselineNum
    return (actualIncrease / targetIncrease) * 100
  }

  const getChartData = () => {
    if (selectedPart === 'all') {
      return {
        labels: MONTHS,
        datasets: selectedParts.map((partId, index) => {
          const measurement = measurements[partId]
          const baseline = parseFloat(measurement.baseline)
          const goalPercentage = parseFloat(measurement.goalPercentage)
          
          return {
            label: getBodyPartLabel(partId),
            data: MONTHS.map(month => {
              const value = measurement.monthlyProgress?.[month]
              return value ? calculateProgress(value, baseline, goalPercentage) : null
            }),
            borderColor: COLORS[index % COLORS.length],
            backgroundColor: COLORS[index % COLORS.length],
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2
          }
        })
      }
    } else {
      const measurement = measurements[selectedPart]
      const baseline = parseFloat(measurement.baseline)
      const goalPercentage = parseFloat(measurement.goalPercentage)

      return {
        labels: MONTHS,
        datasets: [
          {
            label: 'Progress',
            data: MONTHS.map(month => {
              const value = measurement.monthlyProgress?.[month]
              return value ? calculateProgress(value, baseline, goalPercentage) : null
            }),
            borderColor: COLORS[0],
            backgroundColor: COLORS[0],
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2
          },
          {
            label: 'Goal',
            data: MONTHS.map(() => 100),
            borderColor: COLORS[1],
            borderDash: [5, 5],
            tension: 0,
            pointRadius: 0,
            borderWidth: 2
          },
          {
            label: 'Baseline',
            data: MONTHS.map(() => 0),
            borderColor: COLORS[2],
            borderDash: [2, 2],
            tension: 0,
            pointRadius: 0,
            borderWidth: 2
          }
        ]
      }
    }
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20,
          font: {
            family: 'Inter',
            size: 13,
            weight: '500'
          },
          color: '#000000'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          family: 'Inter'
        },
        bodyFont: {
          size: 13,
          family: 'Inter'
        },
        callbacks: {
          label: function(context) {
            const value = context.parsed.y
            if (value === null || value === undefined) return `${context.dataset.label}: No data`
            const formattedValue = value.toFixed(1)
            return `${context.dataset.label}: ${formattedValue}% ${value > 100 ? '(Exceeded Goal!)' : ''}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          padding: 10,
          font: {
            size: 12,
            family: 'Inter',
            weight: '500'
          },
          color: '#000000'
        },
        border: {
          display: true,
          color: '#E5E7EB'
        }
      },
      y: {
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 120,
        title: {
          display: true,
          text: 'Progress (%)',
          font: {
            family: 'Inter',
            size: 13,
            weight: '500'
          },
          color: '#000000',
          padding: {
            bottom: 10
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawTicks: true,
          tickLength: 5,
          lineWidth: 1
        },
        border: {
          display: true,
          color: '#E5E7EB'
        },
        ticks: {
          stepSize: 10,
          padding: 8,
          font: {
            family: 'Inter',
            size: 12,
            weight: '500'
          },
          color: '#000000',
          callback: function(value) {
            return value + '%'
          },
          major: {
            enabled: true
          },
          z: 1
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      point: {
        radius: 4,
        hitRadius: 8,
        hoverRadius: 6,
        borderWidth: 2,
        hoverBorderWidth: 2
      },
      line: {
        tension: 0.3,
        borderWidth: 2,
        fill: false
      }
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 10
      }
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Progress Chart</h3>
        <select
          value={selectedPart}
          onChange={(e) => setSelectedPart(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
        >
          <option value="all">All Body Parts</option>
          {selectedParts.map((part) => (
            <option key={part} value={part}>{getBodyPartLabel(part)}</option>
          ))}
        </select>
      </div>
      <div className="relative h-[600px] w-full">
        <div className="absolute inset-0 overflow-x-auto overflow-y-hidden">
          <div className="min-w-[1000px] h-full">
            <Line data={getChartData()} options={options} />
          </div>
        </div>
      </div>
    </div>
  )
} 