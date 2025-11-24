'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { adminActivityApi } from '@/services/adminActivityApi'

interface ActivityLogEntry {
  id: number
  timestamp: string
  type: string
  description: string
  user_email: string
  company_name: string
  details?: any
}

interface BackendStatus {
  connected: boolean
  loading: boolean
  error: string | null
  message: string
}

export default function ActivityPage() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    connected: false,
    loading: true,
    error: null,
    message: 'Checking backend connection...'
  })
  const [activities, setActivities] = useState<ActivityLogEntry[]>([])

  // Backend endpoint verification function
  const verifyBackendEndpoint = async () => {
    setBackendStatus({
      connected: false,
      loading: true,
      error: null,
      message: 'Checking backend connection...'
    })

    try {
      console.log('🔍 Activity API Verification Starting...')
      
      // Test backend connection first
      const connectionTest = await adminActivityApi.testConnection()
      if (!connectionTest) {
        throw new Error('Backend connection failed')
      }
      
      // Fetch activities using the service
      const data = await adminActivityApi.fetchActivities(100)
      
      console.log('✅ Activity endpoint found and responding.')
      console.log('🔍 Full API response:', data)
      console.log('🔍 Response type:', typeof data)
      console.log('🔍 Is array:', Array.isArray(data))
      console.log('🔍 Array length:', Array.isArray(data) ? data.length : 'N/A')
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('Activity API fields:', Object.keys(data[0]))
        console.log('Sample data:', data[0])
      } else {
        console.log('⚠️ No data returned or data is not an array')
      }

      setBackendStatus({
        connected: true,
        loading: false,
        error: null,
        message: 'Connected to backend ✅'
      })
      
      // Transform backend data to match our interface if needed
      const activitiesData = Array.isArray(data) ? data : []
      console.log('🔍 Setting activities state with:', activitiesData)
      setActivities(activitiesData)

    } catch (error) {
      console.error('❌ Unable to connect to backend. Check API_BASE_URL or server status.')
      console.error('Error details:', error)
      
      setBackendStatus({
        connected: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Endpoint not found or backend offline ❌'
      })
      
      // No data available when backend is offline
      setActivities([])
    }
  }

  // Check backend endpoint on component mount
  useEffect(() => {
    verifyBackendEndpoint()
  }, [])



  return (
   <ProtectedRoute requiredRoles={['Client Admin']}> 
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-heading font-semibold text-gray-900 dark:text-white">
                Activity Log
              </h1>
              {/* Backend Status Badge */}
              <div className="flex items-center gap-2">
                {backendStatus.loading ? (
                  <div className="badge badge-neutral">
                    <span className="loading loading-spinner loading-xs mr-1"></span>
                    Checking...
                  </div>
                ) : backendStatus.connected ? (
                  <div className="badge badge-success">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Live Data
                  </div>
                ) : (
                  <div className="badge badge-warning">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Mock Data
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-1 font-sans">
              Monitor system activities and user actions
            </p>
            {!backendStatus.connected && !backendStatus.loading && (
              <div className="mt-2">
                <div className="alert alert-warning text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{backendStatus.message}</span>
                  <div>
                    <button 
                      className="btn btn-xs btn-outline"
                      onClick={verifyBackendEndpoint}
                    >
                      Retry Connection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <select className="select select-bordered">
              <option>All Activities</option>
              <option>User Actions</option>
              <option>System Events</option>
              <option>Security</option>
            </select>
            <button className="btn btn-outline">Export</button>
          </div>
        </div>

        {/* Activity Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Total Activities</div>
            <div className="stat-value text-primary">{activities.length}</div>
            <div className="stat-desc">
              {backendStatus.connected ? 'From backend API' : 'No data available'}
            </div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">User Logins</div>
            <div className="stat-value text-info">
              {activities.filter(a => a.type === 'UserLogin' || a.type === 'FailedLogin').length}
            </div>
            <div className="stat-desc">Authentication events</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Integrations</div>
            <div className="stat-value text-success">
              {activities.filter(a => a.type === 'IntegrationSync' || a.type === 'Integration').length}
            </div>
            <div className="stat-desc">Data uploads</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Settings</div>
            <div className="stat-value text-warning">
              {activities.filter(a => a.type === 'SettingsUpdate' || a.type === 'DatabaseBackup').length}
            </div>
            <div className="stat-desc">Configuration changes</div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-base-100 rounded-lg shadow-sm border border-base-300">
          {activities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr className="bg-base-200">
                    <th>Type</th>
                    <th>User</th>
                    <th>Description</th>
                    <th>Company</th>
                    <th>Time</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity.id} className="hover">
                      <td>
                        <div className="flex items-center space-x-2">
                          <span className="badge badge-sm badge-primary">
                            {activity.type}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-8">
                              <span className="text-xs">
                                {activity.user_email ? activity.user_email.substring(0, 2).toUpperCase() : '??'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{activity.user_email || 'Unknown'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-medium">{activity.description}</span>
                      </td>
                      <td>
                        <span className="text-sm">{activity.company_name || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="text-sm text-base-content/70">{new Date(activity.timestamp).toLocaleString()}</span>
                      </td>
                      <td>
                        <div className="tooltip tooltip-left" data-tip={activity.details ? JSON.stringify(activity.details, null, 2) : 'No additional details'}>
                          <button className="btn btn-ghost btn-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-base-content mb-2">No Activity Data Available</h3>
              <p className="text-base-content/60 text-center max-w-md mb-6">
                {backendStatus.loading 
                  ? "Loading activity data..."
                  : backendStatus.connected 
                    ? "No activities have been recorded yet."
                    : "Activity data will appear here once the backend endpoint is configured and connected."
                }
              </p>
              {!backendStatus.connected && !backendStatus.loading && (
                <div className="flex flex-col items-center space-y-3">
                  <div className="text-sm text-base-content/50 text-center">
                    Backend endpoint <code className="bg-base-200 px-2 py-1 rounded text-xs">/api/widgets/admin/activities</code> needs to be created
                  </div>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={verifyBackendEndpoint}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry Connection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination - Only show when there are activities */}
        {activities.length > 0 && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-base-content/70">
              Showing 1 to {activities.length} of {activities.length} activities
            </div>
            <div className="join">
              <button className="join-item btn btn-sm">«</button>
              <button className="join-item btn btn-sm btn-active">1</button>
              <button className="join-item btn btn-sm">»</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  </ProtectedRoute>
  )
}
