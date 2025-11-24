'use client'

import { useState, useEffect } from 'react'
import { adminActivityApi } from '@/services/adminActivityApi'

interface ActivityLog {
  id: number
  timestamp: string
  type: string
  description: string
  user_email: string
  company_name: string
  details?: any
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [error, setError] = useState<string>('')

  const fetchActivities = async () => {
    try {
      setError('')
      
      const activities = await adminActivityApi.fetchActivities(20)
      
      setActivities(activities)
      setLastUpdated(new Date().toISOString())
    } catch (error) {
      console.error('Error fetching activities:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load recent activities'
      setError(errorMessage)
      // Fallback to mock data in case of error
      setActivities([
        {
          id: 1,
          timestamp: new Date().toISOString(),
          type: 'SystemAlert',
          description: 'Unable to load real-time data',
          user_email: 'system@portal.com',
          company_name: 'System',
          details: { status: 'Warning' }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success': return (
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
      )
      case 'Failed': return (
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
      )
      case 'Warning': return (
        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
      )
      default: return (
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
      )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'text-green-600'
      case 'Failed': return 'text-red-600'
      case 'Warning': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getActivityStatus = (activityType: string) => {
    switch (activityType) {
      case 'UserLogin': return 'Success'
      case 'IntegrationSync': return 'Success'
      case 'FailedLogin': return 'Failed'
      case 'DatabaseBackup': return 'Success'
      case 'SettingsUpdate': return 'Success'
      case 'SystemAlert': return 'Warning'
      default: return 'Success'
    }
  }

  const getServiceIcon = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'userlogin':
      case 'failedlogin': return (
        <div className="w-6 h-6 p-1 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      )
      case 'integrationsync': return (
        <div className="w-6 h-6 p-1 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      )
      case 'databasebackup': return (
        <div className="w-6 h-6 p-1 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C7.58 3 4 4.79 4 7s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4zM4 9v3c0 2.21 3.58 4 8 4s8-1.79 8-4V9c0 2.21-3.58 4-8 4s-8-1.79-8-4zM4 16v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3c0 2.21-3.58 4-8 4s-8-1.79-8-4z"/>
          </svg>
        </div>
      )
      case 'settingsupdate': return (
        <div className="w-6 h-6 p-1 bg-orange-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
        </div>
      )
      case 'github': return (
        <div className="w-6 h-6 p-1 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
        </div>
      )
      case 'jira': return (
        <div className="w-6 h-6 p-1 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78c2.4 0 4.35 1.95 4.35 4.35v1.78c0 2.4-1.95 4.35-4.35 4.35h-1.78c-2.4 0-4.35 1.95-4.35 4.35V2z"/>
            <path d="M6.77 6.77c0 2.4 1.95 4.35 4.35 4.35h1.78c2.4 0 4.35 1.95 4.35 4.35v1.78c0 2.4-1.95 4.35-4.35 4.35H6.77V6.77z"/>
          </svg>
        </div>
      )
      case 'azure ad': return (
        <div className="w-6 h-6 p-1 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 10.5h9v3H0v-3zM10.5 0v9h3V0h-3zM0 0v9h9V0H0zM10.5 10.5v9h3v-9h-3z"/>
          </svg>
        </div>
      )
      case 'portal': return (
        <div className="w-6 h-6 p-1 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
      )
      default: return (
        <div className="w-6 h-6 p-1 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          </svg>
        </div>
      )
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-heading font-semibold text-gray-900 flex items-center space-x-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Recent Activity</span>
          </h3>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4 py-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-gray-900 flex items-center space-x-3">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Recent Activity</span>
          {error && (
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </h3>
        <button 
          onClick={fetchActivities}
          className="btn-clean text-sm flex items-center space-x-1 hover:text-blue-600"
          disabled={loading}
        >
          <svg className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4 overflow-hidden">
        {activities.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No recent activities found</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start space-x-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 rounded-lg px-2 transition-colors"
            >
              {/* Status & Service */}
              <div className="flex flex-col items-center space-y-2 pt-1">
                {getServiceIcon(activity.type)}
                {getStatusIcon(getActivityStatus(activity.type))}
              </div>

              {/* Activity Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-gray-900 mb-1 break-words">
                      {activity.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-600 space-x-2 flex-wrap">
                      <span className="truncate">{activity.user_email}</span>
                      <span>•</span>
                      <span className="truncate">{activity.company_name}</span>
                      <span>•</span>
                      <span className={getStatusColor(getActivityStatus(activity.type))}>
                        {getActivityStatus(activity.type)}
                      </span>
                    </div>
                    {activity.details && (
                      <p className="text-xs text-gray-500 mt-1 break-words overflow-hidden" style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as const
                      }}>
                        {typeof activity.details === 'string' ? activity.details : JSON.stringify(activity.details)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            Total Events: {activities.length}
            {lastUpdated && (
              <span className="ml-2 text-gray-500">
                • Updated: {formatTimeAgo(lastUpdated)}
              </span>
            )}
          </span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live updates</span>
          </div>
        </div>
      </div>
    </div>
  )
}
