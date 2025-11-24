'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface AnalyticsData {
  userActivity: {
    totalSessions: number
    activeUsers: number
    pageViews: number
    avgSessionDuration: string
  }
  systemMetrics: {
    apiCalls: number
    responseTime: string
    uptime: string
    errorRate: string
  }
  integrationStats: {
    totalIntegrations: number
    activeConnections: number
    failedSyncs: number
    lastSyncTime: string
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Mock data - replace with actual API call
        const mockData: AnalyticsData = {
          userActivity: {
            totalSessions: 1247,
            activeUsers: 89,
            pageViews: 3456,
            avgSessionDuration: '12m 34s'
          },
          systemMetrics: {
            apiCalls: 15234,
            responseTime: '245ms',
            uptime: '99.9%',
            errorRate: '0.1%'
          },
          integrationStats: {
            totalIntegrations: 8,
            activeConnections: 7,
            failedSyncs: 0,
            lastSyncTime: '2 minutes ago'
          }
        }
        
        setTimeout(() => {
          setData(mockData)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Failed to load analytics data</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
        
        {/* User Activity */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">User Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Total Sessions</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{data.userActivity.totalSessions.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Active Users</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{data.userActivity.activeUsers}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Page Views</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{data.userActivity.pageViews.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Avg Session Duration</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{data.userActivity.avgSessionDuration}</div>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">System Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-600">API Calls</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{data.systemMetrics.apiCalls.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Response Time</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{data.systemMetrics.responseTime}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Uptime</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{data.systemMetrics.uptime}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Error Rate</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{data.systemMetrics.errorRate}</div>
            </div>
          </div>
        </div>

        {/* Integration Stats */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Integration Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Total Integrations</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{data.integrationStats.totalIntegrations}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Active Connections</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{data.integrationStats.activeConnections}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Failed Syncs</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{data.integrationStats.failedSyncs}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Last Sync</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{data.integrationStats.lastSyncTime}</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}