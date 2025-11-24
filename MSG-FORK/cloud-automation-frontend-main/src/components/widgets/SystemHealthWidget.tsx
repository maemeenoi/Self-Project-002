'use client'

import { useState } from 'react'

interface SystemHealth {
  database: { status: 'operational' | 'warning' | 'error', details: string }
  api: { status: 'operational' | 'warning' | 'error', responseTime: number }
  security: { status: 'operational' | 'warning' | 'error', details: string }
  connectivity: { status: 'operational' | 'warning' | 'error', details: string }
}

export default function SystemHealthWidget() {
  const [healthData, setHealthData] = useState<SystemHealth>({
    database: { status: 'operational', details: 'Connection stable' },
    api: { status: 'warning', responseTime: 300 },
    security: { status: 'operational', details: 'All checks passed' },
    connectivity: { status: 'operational', details: 'Networks healthy' }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-700'
      case 'warning': return 'text-yellow-700'
      case 'error': return 'text-red-700'
      default: return 'text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational': return 'Operational'
      case 'warning': return 'Warning'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  // Determine overall system status
  const getOverallStatus = () => {
    const statuses = Object.values(healthData).map(item => item.status)
    if (statuses.includes('error')) return 'Degraded'
    if (statuses.includes('warning')) return 'Warning'
    return 'Operational'
  }

  return (
    <div className="dashboard-card">
      <div className="mb-8">
        <h3 className="text-lg font-heading font-semibold text-navy-darkest flex items-center space-x-3">
          <svg className="w-5 h-5 text-navy-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M14.25 3.104c.251.023.501.05.75.082M19.8 14.5l-5.69 5.69a2.25 2.25 0 01-3.182 0l-5.69-5.69a2.25 2.25 0 010-3.182l5.69-5.69a2.25 2.25 0 013.182 0l5.69 5.69a2.25 2.25 0 010 3.182z" />
          </svg>
          <span>System Health</span>
        </h3>
      </div>

      {/* Overall System Status */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-3 h-3 rounded-full ${getOverallStatus() === 'Operational' ? 'bg-green-500' : getOverallStatus() === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          <span className="text-lg font-heading font-semibold text-navy-darkest">System Health: {getOverallStatus()}</span>
        </div>
        
        {/* Status Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(healthData).map(([key, value]) => (
            <div key={key} className="bg-blue-light rounded-lg p-4 border border-blue-bright">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(value.status)}`}></div>
                  <span className="text-sm font-medium text-navy-darkest capitalize">{key}</span>
                </div>
              </div>
              <div className={`text-xs font-medium ${getStatusTextColor(value.status)}`}>
                {getStatusText(value.status)}
              </div>
              <div className="text-xs text-navy-dark mt-1">
                {key === 'api' ? `${(value as any).responseTime}ms avg` : 
                 (value as any).details}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
