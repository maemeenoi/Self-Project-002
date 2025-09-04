'use client'

import { useState, useEffect } from 'react'
import CostSummaryCards from './CostSummaryCards'
import CostCharts from './CostCharts'
import FileUpload from './FileUpload'

// Mock data for v1
const mockCostData = {
  totalCost: 125430.50,
  monthlyGrowth: 8.2,
  servicesCount: 24,
  topServices: [
    { name: 'Azure Virtual Machines', cost: 45230.20, percentage: 36 },
    { name: 'Azure Storage', cost: 23150.10, percentage: 18 },
    { name: 'Azure SQL Database', cost: 18920.30, percentage: 15 },
    { name: 'Azure App Service', cost: 12450.80, percentage: 10 },
    { name: 'Azure Kubernetes Service', cost: 9875.40, percentage: 8 },
    { name: 'Other Services', cost: 15803.70, percentage: 13 }
  ],
  monthlyTrends: [
    { month: 'Jan', cost: 98500 },
    { month: 'Feb', cost: 102300 },
    { month: 'Mar', cost: 108900 },
    { month: 'Apr', cost: 115600 },
    { month: 'May', cost: 121200 },
    { month: 'Jun', cost: 125430 }
  ],
  categoryBreakdown: [
    { category: 'Compute', cost: 65000, percentage: 52 },
    { category: 'Storage', cost: 28000, percentage: 22 },
    { category: 'Database', cost: 20000, percentage: 16 },
    { category: 'Networking', cost: 8000, percentage: 6 },
    { category: 'Other', cost: 4430, percentage: 4 }
  ]
}

export default function DashboardContent() {
  const [costData, setCostData] = useState(mockCostData)
  const [showUpload, setShowUpload] = useState(false)

  const handleDataUpload = (newData: any) => {
    // In a real app, this would process and normalize the uploaded data
    console.log('Uploaded data:', newData)
    setShowUpload(false)
    // For now, we'll just use mock data
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to FinOps Portal</h1>
        <p className="text-blue-100">
          Monitor and optimize your cloud costs with comprehensive analytics and insights.
        </p>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => setShowUpload(true)}
            className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
          >
            Upload Cost Data
          </button>
          <button className="border border-blue-300 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors">
            View Reports
          </button>
        </div>
      </div>

      {/* Cost Summary Cards */}
      <CostSummaryCards data={costData} />

      {/* Charts Section */}
      <CostCharts data={costData} />

      {/* File Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Cost Data</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <FileUpload onUpload={handleDataUpload} />
          </div>
        </div>
      )}
    </div>
  )
}
