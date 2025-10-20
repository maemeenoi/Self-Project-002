'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatsCard } from '@/components/ui/StatsCard'
import { ChartCard } from '@/components/ui/ChartCard'

interface WidgetData {
  [key: string]: any
}

interface LoadingState {
  [key: string]: boolean
}

export default function WidgetsDashboard() {
  const [widgetData, setWidgetData] = useState<WidgetData>({})
  const [loading, setLoading] = useState<LoadingState>({})
  const [selectedCompany, setSelectedCompany] = useState<number>(1)

  // Widget configurations
  const widgets = [
    // Financial Widgets
    {
      category: 'Financial',
      items: [
        { name: 'Cost Breakdown', endpoint: '/widgets/financial/cost-breakdown', params: `company_id=${selectedCompany}&group_by=ServiceName` },
        { name: 'Cost Trend', endpoint: '/widgets/financial/cost-trend', params: `company_id=${selectedCompany}` },
        { name: 'Savings Summary', endpoint: '/widgets/financial/savings-summary', params: `company_id=${selectedCompany}` },
        { name: 'Vendor Costs', endpoint: '/widgets/financial/vendor-costs', params: `company_id=${selectedCompany}` },
        { name: 'Resource Allocation', endpoint: '/widgets/financial/resource-allocation', params: `company_id=${selectedCompany}` },
      ]
    },
    // Workflow Widgets
    {
      category: 'Workflow',
      items: [
        { name: 'Jira Issues', endpoint: '/widgets/workflow/jira', params: `company_id=${selectedCompany}` },
        { name: 'Pull Requests', endpoint: '/widgets/workflow/pull-requests', params: `company_id=${selectedCompany}` },
        { name: 'Build Status', endpoint: '/widgets/workflow/build-status', params: `company_id=${selectedCompany}` },
        { name: 'Team Performance', endpoint: '/widgets/workflow/team-performance', params: `company_id=${selectedCompany}` },
        { name: 'System Health', endpoint: '/widgets/workflow/system-health', params: `company_id=${selectedCompany}` },
      ]
    },
    // Combined Widgets
    {
      category: 'Combined Analytics',
      items: [
        { name: 'Executive KPIs', endpoint: '/widgets/combined/executive-kpi', params: `company_id=${selectedCompany}` },
        { name: 'Efficiency Metrics', endpoint: '/widgets/combined/efficiency-kpi', params: `company_id=${selectedCompany}` },
        { name: 'Optimization Progress', endpoint: '/widgets/combined/optimization-progress', params: `company_id=${selectedCompany}` },
      ]
    },
    // System Widgets
    {
      category: 'System',
      items: [
        { name: 'Total Users', endpoint: '/widgets/system/total-users', params: '' },
        { name: 'Integrations', endpoint: '/widgets/system/integrations-overview', params: '' },
        { name: 'Recent Activity', endpoint: '/widgets/system/recent-activity', params: 'limit=5' },
      ]
    }
  ]

  const fetchWidget = async (name: string, endpoint: string, params: string) => {
    const key = `${name}_${selectedCompany}`
    setLoading(prev => ({ ...prev, [key]: true }))
    
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}${params ? `?${params}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setWidgetData(prev => ({ ...prev, [key]: data }))
    } catch (error) {
      console.error(`Error fetching ${name}:`, error)
      setWidgetData(prev => ({ ...prev, [key]: { error: 'Failed to load data' } }))
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }))
    }
  }

  const fetchAllWidgets = () => {
    widgets.forEach(category => {
      category.items.forEach(widget => {
        fetchWidget(widget.name, widget.endpoint, widget.params)
      })
    })
  }

  useEffect(() => {
    fetchAllWidgets()
  }, [selectedCompany])

  const formatWidgetData = (data: any, widgetName: string) => {
    if (!data || data.error) {
      return <div className="text-red-600">Error loading data</div>
    }

    // Handle different data formats
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return <div className="text-gray-500">No data available</div>
      }
      
      return (
        <div className="space-y-2">
          {data.slice(0, 5).map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {item.category || item.Status || item.ServiceName || item.name || item.Publisher || `Item ${index + 1}`}
              </span>
              <span className="font-medium">
                {item.total_cost ? `$${parseFloat(item.total_cost).toFixed(2)}` :
                 item.issue_count || item.pr_count || item.build_count || item.count || 
                 item.deployments || item.avg_lead || 'N/A'}
              </span>
            </div>
          ))}
          {data.length > 5 && (
            <div className="text-xs text-gray-400 text-center">
              +{data.length - 5} more items
            </div>
          )}
        </div>
      )
    } else if (typeof data === 'object') {
      return (
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center text-sm">
              <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
              <span className="font-medium">
                {typeof value === 'number' ? 
                  (key.includes('cost') || key.includes('spend') || key.includes('saving') ? 
                    `$${parseFloat(value.toString()).toFixed(2)}` : 
                    value.toString()
                  ) : 
                  value?.toString() || 'N/A'
                }
              </span>
            </div>
          ))}
        </div>
      )
    }

    return <div className="text-gray-500">Unexpected data format</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Widgets Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Comprehensive view of all 32 dashboard widgets with live data
            </p>
          </div>
          
          {/* Company Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="company-select" className="text-sm font-medium text-gray-700">
              Company:
            </label>
            <select
              id="company-select"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(id => (
                <option key={id} value={id}>Company {id}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Widgets Grid by Category */}
        {widgets.map(category => (
          <div key={category.category} className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              {category.category} Widgets
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {category.items.map(widget => {
                const key = `${widget.name}_${selectedCompany}`
                const data = widgetData[key]
                const isLoading = loading[key]
                
                return (
                  <ChartCard
                    key={widget.name}
                    title={widget.name}
                    loading={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="h-32 overflow-y-auto">
                        {formatWidgetData(data, widget.name)}
                      </div>
                    )}
                  </ChartCard>
                )
              })}
            </div>
          </div>
        ))}

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            onClick={fetchAllWidgets}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium"
          >
            Refresh All Widgets
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}