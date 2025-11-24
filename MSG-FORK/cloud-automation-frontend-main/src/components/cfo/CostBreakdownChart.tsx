/**
 * Widget 1: Cost Breakdown Chart
 * Show total costs grouped by Service, Region, or Provider
 */

import React, { useState, useEffect, useRef } from 'react';
import { WidgetProps, CostBreakdownItem, GroupByType } from '@/types/cfoDashboard';
import { formatCurrency, calculatePercentage, formatPercent } from '@/utils/cfoFormatters';

// Declare Chart.js global type
declare global {
  interface Window {
    Chart: any;
  }
}

interface CostBreakdownChartProps extends WidgetProps<CostBreakdownItem[]> {
  onGroupByChange?: (groupBy: GroupByType) => void;
  currentGroupBy?: GroupByType;
}

const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({ 
  data, 
  loading = false, 
  error = null,
  onGroupByChange,
  currentGroupBy = 'ServiceName'
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  const [chartReady, setChartReady] = useState(false);

  // Load Chart.js
  useEffect(() => {
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        console.log('Chart.js loaded for CostBreakdown');
        setChartReady(true);
      };
      document.head.appendChild(script);
    } else {
      setChartReady(true);
    }
  }, []);

  // Render chart when data changes
  useEffect(() => {
    if (chartReady && data && data.length > 0 && chartRef.current && viewMode === 'chart') {
      renderChart();
    }
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, chartReady, viewMode]);

  const renderChart = () => {
    if (!chartRef.current || !window.Chart || !data) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Helper functions
    const getItemCost = (item: any): number => item.amount ?? item.total_cost ?? 0;
    const getItemCategory = (item: any): string => item.category ?? item.ServiceName ?? item.Region ?? item.Provider ?? 'Unknown';

    // Sort and take top 10
    const sortedData = [...data]
      .sort((a, b) => getItemCost(b) - getItemCost(a))
      .slice(0, 10);

    const labels = sortedData.map(item => getItemCategory(item));
    const costs = sortedData.map(item => getItemCost(item));

    // Blue color palette
    const blueColors = [
      'rgba(37, 99, 235, 0.8)',   // blue-600
      'rgba(59, 130, 246, 0.8)',   // blue-500
      'rgba(96, 165, 250, 0.8)',   // blue-400
      'rgba(147, 197, 253, 0.8)',  // blue-300
      'rgba(30, 58, 138, 0.8)',    // blue-900
      'rgba(29, 78, 216, 0.8)',    // blue-700
      'rgba(37, 99, 235, 0.6)',
      'rgba(59, 130, 246, 0.6)',
      'rgba(96, 165, 250, 0.6)',
      'rgba(147, 197, 253, 0.6)',
    ];

    // Create horizontal bar chart
    chartInstance.current = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cost',
          data: costs,
          backgroundColor: blueColors,
          borderColor: blueColors.map(c => c.replace('0.8', '1')),
          borderWidth: 1,
          barThickness: 30
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#2563EB',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: function(context: any) {
                return `Cost: $${context.parsed.x.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              font: { size: 11 },
              color: '#666',
              callback: function(value: any) {
                return '$' + value.toFixed(0);
              }
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: { size: 11 },
              color: '#666'
            }
          }
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-blue-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Cost Breakdown</h3>
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
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Cost Breakdown</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No cost data available</p>
        </div>
      </div>
    );
  }

  // Helper functions to handle both data formats
  const getItemCost = (item: any): number => {
    return item.amount ?? item.total_cost ?? 0;
  };

  const getItemPercentage = (item: any): number => {
    return item.percentage ?? 0;
  };

  // Sort data by cost (descending) and take top 10
  const sortedData = [...data]
    .sort((a, b) => getItemCost(b) - getItemCost(a))
    .slice(0, 10);

  // Calculate total cost
  const totalCost = sortedData.reduce((sum, item) => sum + getItemCost(item), 0);

  // Color palette for chart
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

  // Group by options - Only show Service since API data doesn't contain Region/Provider info
  const groupByOptions: { value: GroupByType; label: string }[] = [
    { value: 'ServiceName', label: 'By Service' }
  ];

  const handleGroupByChange = (newGroupBy: GroupByType) => {
    if (onGroupByChange) {
      onGroupByChange(newGroupBy);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-150 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-blue-800">Cost Breakdown</h3>
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'chart' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Group By Selector - Hidden since only one option available */}
      {false && (
        <div className="flex space-x-2 mb-6">
          {groupByOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleGroupByChange(option.value)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                currentGroupBy === option.value
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="relative" style={{ height: '400px' }}>
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
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-500">Category</th>
                <th className="text-right py-2 text-sm font-medium text-gray-500">Cost</th>
                <th className="text-right py-2 text-sm font-medium text-gray-500">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => {
                const percentage = getItemPercentage(item) || calculatePercentage(getItemCost(item), totalCost);
                const color = colors[index % colors.length];
                
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(getItemCost(item))}
                    </td>
                    <td className="py-3 text-right text-sm text-gray-600">
                      {formatPercent(percentage)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Total Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">
            Total Cost ({sortedData.length} categories)
          </span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(totalCost)}
          </span>
        </div>
      </div>

      {/* Top Category Highlight */}
      {sortedData.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <span className="font-medium">{sortedData[0].category}</span> is your highest cost category, 
            representing <span className="font-medium">
              {formatPercent(getItemPercentage(sortedData[0]) || calculatePercentage(getItemCost(sortedData[0]), totalCost))}
            </span> of total costs.
          </div>
        </div>
      )}
    </div>
  );
};

export default CostBreakdownChart;
