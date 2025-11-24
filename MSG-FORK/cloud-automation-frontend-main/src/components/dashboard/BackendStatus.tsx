'use client'

import { useState, useEffect } from 'react'
import backendApi, { HealthResponse, JiraCredentials } from '@/services/backendApi'
import { RefreshCw, Wifi, WifiOff, AlertTriangle, Zap } from 'lucide-react'

interface BackendStatusProps {
  onDataUpdate?: () => void
  showSyncButton?: boolean
  className?: string
}

export default function BackendStatus({ 
  onDataUpdate, 
  showSyncButton = true, 
  className = '' 
}: BackendStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const checkBackendHealth = async () => {
    try {
      setStatus('checking')
      setError(null)
      
      const healthResponse = await backendApi.healthCheck()
      setHealth(healthResponse)
      setLastCheck(new Date())
      
      if (healthResponse.status === 'healthy' && healthResponse.database_connected) {
        setStatus('connected')
      } else {
        setStatus('disconnected')
        setError('Backend is running but database not connected')
      }
    } catch (err: any) {
      console.error('Backend health check failed:', err)
      setStatus('error')
      setError(err.message || 'Failed to connect to backend')
      setHealth(null)
    }
  }

  const handleSync = async () => {
    if (syncing) return
    
    setSyncing(true)
    try {
      // Use demo credentials for sync
      const credentials: JiraCredentials = {
        jira_url: 'https://demo-company.atlassian.net',
        jira_email: 'demo@company.com',
        jira_token: 'demo-token',
        jql: 'project = DEMO ORDER BY created DESC',
        max_results: 100
      }
      
      const result = await backendApi.syncJira(credentials)
      
      if (result.success) {
        // Trigger data refresh in parent component
        onDataUpdate?.()
        
        // Show success notification
        console.log('Sync successful:', result.message)
      } else {
        throw new Error(result.message || 'Sync failed')
      }
    } catch (err: any) {
      console.error('Sync failed:', err)
      setError(`Sync failed: ${err.message}`)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    checkBackendHealth()
    
    // Check health every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Fix hydration mismatch by only showing time after client mount
  useEffect(() => {
    setIsMounted(true)
    if (!lastCheck) {
      setLastCheck(new Date())
    }
  }, [])

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-600" />
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-gray-600 animate-spin" />
      default:
        return <WifiOff className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'border-green-200 bg-green-50'
      case 'disconnected': return 'border-yellow-200 bg-yellow-50'
      case 'error': return 'border-red-200 bg-red-50'
      case 'checking': return 'border-gray-200 bg-gray-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return (
          <div>
            <span className="font-medium text-green-800">Backend Connected</span>
            <span className="text-green-600 text-xs block">
              {health?.database_connected ? 'Database online' : 'Database offline'}
            </span>
          </div>
        )
      case 'disconnected':
        return (
          <div>
            <span className="font-medium text-yellow-800">Backend Disconnected</span>
            <span className="text-yellow-600 text-xs block">Using mock data</span>
          </div>
        )
      case 'error':
        return (
          <div>
            <span className="font-medium text-red-800">Backend Error</span>
            <span className="text-red-600 text-xs block truncate" title={error || ''}>
              {error || 'Connection failed'}
            </span>
          </div>
        )
      case 'checking':
        return (
          <div>
            <span className="font-medium text-gray-800">Checking Backend...</span>
            <span className="text-gray-600 text-xs block">Verifying connection</span>
          </div>
        )
      default:
        return (
          <div>
            <span className="font-medium text-gray-800">Unknown Status</span>
          </div>
        )
    }
  }

  return (
    <div className={`backend-status ${className}`}>
      <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${getStatusColor()}`}>
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            {getStatusText()}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Last check time */}
          <span className="text-xs text-gray-500 hidden sm:block">
            {isMounted && lastCheck ? lastCheck.toLocaleTimeString() : '--:--:--'}
          </span>
          
          {/* Manual refresh button */}
          <button
            onClick={checkBackendHealth}
            disabled={status === 'checking'}
            className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
            title="Check backend status"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${status === 'checking' ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Sync button */}
          {showSyncButton && status === 'connected' && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Sync data from Jira"
            >
              <Zap className={`w-3 h-3 ${syncing ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">
                {syncing ? 'Syncing...' : 'Sync'}
              </span>
            </button>
          )}
        </div>
      </div>
      
      {/* Expandable error details */}
      {status === 'error' && error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <strong>Error Details:</strong> {error}
        </div>
      )}
      
      {/* Health details when connected */}
      {status === 'connected' && health && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          <div className="flex justify-between">
            <span>Status: {health.status}</span>
            <span>DB: {health.database_connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for embedding in dashboards
export function CompactBackendStatus({ className = '' }: { className?: string }) {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error' | 'checking'>('checking')

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const health = await backendApi.healthCheck()
        setStatus(health.status === 'healthy' && health.database_connected ? 'connected' : 'disconnected')
      } catch {
        setStatus('error')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [])

  const getStatusClass = () => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      case 'checking': return 'bg-gray-500 animate-pulse'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Backend Connected'
      case 'disconnected': return 'Using Mock Data'
      case 'error': return 'Backend Error'
      case 'checking': return 'Checking...'
      default: return 'Unknown'
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusClass()}`} />
      <span className="text-xs text-gray-600">{getStatusText()}</span>
    </div>
  )
}
