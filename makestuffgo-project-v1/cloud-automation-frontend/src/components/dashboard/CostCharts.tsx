'use client'

import { useState } from 'react'
import { Download, FileText } from 'lucide-react'

interface CostChartsProps {
  data: {
    topServices: Array<{name: string, cost: number, percentage: number}>
    monthlyTrends: Array<{month: string, cost: number}>
    categoryBreakdown: Array<{category: string, cost: number, percentage: number}>
  }
}

export default function CostCharts({ data }: CostChartsProps) {
  const [activeTab, setActiveTab] = useState('services')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const exportToPDF = () => {
    // TODO: Implement PDF export using html2canvas + jsPDF
    console.log('Exporting to PDF...')
  }

  const exportToCSV = () => {
    // TODO: Implement CSV export
    console.log('Exporting to CSV...')
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Top Services
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'trends'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly Trends
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Categories
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">
            {activeTab === 'services' && 'Top Services by Cost'}
            {activeTab === 'trends' && 'Monthly Cost Trends'}
            {activeTab === 'categories' && 'Cost by Category'}
          </h3>
          
          {activeTab === 'services' && (
            <div className="space-y-4">
              {data.topServices.map((service, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{service.name}</span>
                      <span className="text-sm text-gray-500">{formatCurrency(service.cost)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${service.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-4">
              <div className="h-64 flex items-end space-x-2">
                {data.monthlyTrends.map((trend, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="bg-primary-600 w-full rounded-t-md min-h-[20px]"
                      style={{ 
                        height: `${(trend.cost / Math.max(...data.monthlyTrends.map(t => t.cost))) * 200}px` 
                      }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">{trend.month}</span>
                    <span className="text-xs text-gray-500">{formatCurrency(trend.cost)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4">
              {data.categoryBreakdown.map((category, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{category.category}</span>
                      <span className="text-sm text-gray-500">{formatCurrency(category.cost)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Insights</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Optimization Tip</h4>
              <p className="text-sm text-blue-700">
                Your compute costs have increased by 12% this month. Consider using Azure Reserved Instances for long-running workloads.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">✅ Good Practice</h4>
              <p className="text-sm text-green-700">
                Storage costs are well-optimized with proper lifecycle policies in place.
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Alert</h4>
              <p className="text-sm text-yellow-700">
                Unusual spike in database costs detected. Review scaling policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
