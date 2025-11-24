/**
 * Widget 2: Cost Trend Line
 * Show cost trends over time by billing period
 */

import React, { useEffect, useRef, useState } from 'react';
import { WidgetProps, CostTrendItem } from '@/types/cfoDashboard';
import { 
  formatCurrency, 
  formatPercentWithSign, 
  getTrendArrow, 
  getPercentageColor 
} from '@/utils/cfoFormatters';

// Declare Chart.js global type
declare global {
  interface Window {
    Chart: any;
  }
}

const CostTrendLine: React.FC<WidgetProps<CostTrendItem[]>> = ({ 
  data, 
  loading = false, 
  error = null 
}) => {
  // Chart reference
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  const [chartReady, setChartReady] = useState(false);

  // Load Chart.js
  useEffect(() => {
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        console.log('Chart.js loaded');
        setChartReady(true);
      };
      document.head.appendChild(script);
    } else {
      setChartReady(true);
    }
  }, []);

  // Render chart when data changes and Chart.js is ready
  useEffect(() => {
    if (chartReady && data && data.length > 0 && chartRef.current) {
      console.log('Rendering chart with data:', data.length, 'points');
      renderChart();
    }
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, chartReady]);

  const renderChart = () => {
    if (!chartRef.current || !window.Chart) {
      console.log('Cannot render chart - missing ref or Chart.js');
      return;
    }

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) {
      console.log('Cannot get canvas context');
      return;
    }

    // Sort data by date
    const sortedData = [...data]
      .filter(item => {
        if (!item) return false;
        const cost = (item as any).amount ?? (item as any).total_cost;
        return typeof cost === 'number' && !isNaN(cost);
      })
      .sort((a, b) => {
        const dateA = (a as any).date || (a as any).period || '';
        const dateB = (b as any).date || (b as any).period || '';
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });

    console.log('Sorted data points:', sortedData.length);

    if (sortedData.length === 0) {
      console.log('No valid data points to render');
      return;
    }

    // Prepare chart data
    const labels = sortedData.map(item => {
      const dateStr = (item as any).date || (item as any).period || '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const costs = sortedData.map(item => (item as any).amount ?? (item as any).total_cost ?? 0);

    console.log('Chart labels:', labels);
    console.log('Chart costs:', costs);

    // Create Chart.js instance
    chartInstance.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Historical Cost',
            data: costs,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#2563EB',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#2563EB',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context: any) {
                return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              font: { size: 11 },
              color: '#666'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              font: { size: 11 },
              color: '#666',
              callback: function(value: any) {
                return '$' + value.toFixed(2);
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-blue-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-blue-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Cost Trend</h3>
        <div className="text-center py-8">
          <p className="text-red-600 mb-2 font-semibold">Error loading data</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-blue-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Cost Trend</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No trend data available</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const costs = data.map(item => (item as any).amount ?? (item as any).total_cost ?? 0);
  const maxCost = Math.max(...costs);
  const minCost = Math.min(...costs);
  const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;

  return (
    <div className="bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-150 p-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-blue-800 mb-6">Cost Trend</h3>

      {/* Chart Area */}
      <div className="mb-6 relative" style={{ height: '300px' }}>
        <canvas ref={chartRef}></canvas>
        {!chartReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading chart...</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-600">Highest</div>
          <div className="text-lg font-bold text-blue-700">
            {formatCurrency(maxCost)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Lowest</div>
          <div className="text-lg font-bold text-blue-700">
            {formatCurrency(minCost)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Average</div>
          <div className="text-lg font-bold text-blue-700">
            {formatCurrency(avgCost)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostTrendLine;
