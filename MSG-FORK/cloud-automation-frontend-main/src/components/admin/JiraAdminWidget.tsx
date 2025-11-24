'use client'

import { useState, useEffect } from 'react'
import backendApi, { DashboardMetrics } from '@/services/backendApi'

interface JiraAdminData {
  totalProjects: number
  activeProjects: number
  totalUsers: number
  recentIssues: number
  issuesByStatus: Record<string, number>
  issuesByType: Record<string, number>
  topActiveProjects: {
    name: string
    key: string
    issueCount: number
  }[]
  projects: {
    key: string
    name: string
    projectTypeKey: string
    lead: string
  }[]
  lastUpdated: string
}

interface MetricCardProps {
  value: string | number
  label: string
  sublabel: string
  icon: string
  color?: string
  trend?: string
}

interface IssueStatusProps {
  status: string
  count: number
  color: string
}

interface ProjectActivityProps {
  project: {
    key: string
    name: string
    issueCount: number
  }
  rank: number
}

interface QuickMetricProps {
  label: string
  value: string
  trend?: string
}

interface ExpandButtonProps {
  isExpanded: boolean
  onClick: () => void
}

const MetricCard = ({ value, label, sublabel, icon, color = 'blue', trend }: MetricCardProps) => {
  const getIconSvg = (iconName: string) => {
    switch (iconName) {
      case 'projects':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )
      case 'active':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case 'users':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        )
      case 'issues':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        )
      default:
        return null
    }
  }

  const getColorClasses = (color: string) => {
    // All colors now use blue theme
    return 'bg-blue-50 text-blue-600 border-blue-100'
  }

  return (
    <div className="bg-white rounded-lg border border-blue-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getColorClasses(color)}`}>
          {getIconSvg(icon)}
        </div>
        {trend && (
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-blue-700">{value}</div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-500">{sublabel}</div>
      </div>
    </div>
  )
}

const IssueStatusItem = ({ status, count, color }: IssueStatusProps) => {
  return (
    <div className="flex items-center justify-between py-2 w-full">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`}></div>
        <span className="text-sm font-medium text-gray-900 truncate">{status}</span>
      </div>
      <span className="text-sm text-gray-600 font-medium flex-shrink-0 ml-2">{count}</span>
    </div>
  )
}

const ProjectActivity = ({ project, rank }: ProjectActivityProps) => {
  const getRankColor = (rank: number) => {
    // All ranks now use blue shades
    switch (rank) {
      case 1: return 'bg-blue-200 text-blue-900'
      case 2: return 'bg-blue-100 text-blue-800'
      case 3: return 'bg-blue-50 text-blue-700'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 w-full">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getRankColor(rank)}`}>
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{project.name}</div>
          <div className="text-xs text-gray-500 font-mono truncate">{project.key}</div>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-600 flex-shrink-0 ml-2">{project.issueCount} issues</span>
    </div>
  )
}

const QuickMetric = ({ label, value, trend }: QuickMetricProps) => {
  return (
    <div className="flex-1 text-center min-w-0 px-2">
      <div className="flex items-center justify-center space-x-1">
        <span className="text-lg font-semibold text-blue-700 truncate">{value}</span>
        {trend && (
          <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
            {trend}
          </span>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1 truncate">{label}</div>
    </div>
  )
}

const ExpandButton = ({ isExpanded, onClick }: ExpandButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      aria-label={isExpanded ? "Collapse details" : "Expand details"}
    >
      <svg 
        className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export default function JiraAdminWidget() {
  const [data, setData] = useState<JiraAdminData | null>(null)
  const [backendMetrics, setBackendMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [backendConnected, setBackendConnected] = useState(false)

  useEffect(() => {
    fetchJiraAdminData()
  }, [])

  const fetchJiraAdminData = async () => {
    try {
      setLoading(true)
      // setError(null)

      // Get JWT token from localStorage
      const authToken = localStorage.getItem('auth_token')
      
      // First check integration status
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      // const statusResponse = await fetch('https://app-makestuffgo-test-001-backend.azurewebsites.net/api/integrations/status', { headers })
      const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/integrations/status`, { headers })
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        const jiraStatus = statusData.find((s: any) => s.integration_type === 'jira')
        
        // If not properly configured or no real data, show configuration prompt
        if (!jiraStatus?.configured || jiraStatus.records_count === 0) {
          setError('Please configure Jira integration to view project data')
          setLoading(false)
          return
        }
      }
      if (!authToken) {
        throw new Error('No authentication token found')
      }
      
      // Get data from backend API
      const response = await fetch('/api/admin/jira-overview', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch Jira admin data')
      }

      const adminData = await response.json()
      setData(adminData)
      setError(null)
      // setBackendConnected(true)
    } catch (err) {
      console.error('Error fetching Jira admin data:', err)
      setError('Please configure Jira integration to view project data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const getStatusColor = (status: string) => {
    // All statuses now use blue shades
    switch (status.toLowerCase()) {
      case 'done':
      case 'closed':
      case 'resolved':
        return 'bg-blue-600'
      case 'in progress':
      case 'in review':
        return 'bg-blue-500'
      case 'to do':
      case 'open':
      case 'backlog':
        return 'bg-gray-500'
      default:
        return 'bg-blue-400'
    }
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden w-full max-w-full">
        <div className="widget-content p-6 box-border">
          <div className="animate-pulse w-full">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    const isConfigurationError = error?.includes('Please configure')
    
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden w-full max-w-full">
        <div className="widget-content p-6 box-border text-center">
          {isConfigurationError ? (
            <>
              <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.571 11.513H6.746a.321.321 0 00-.321.321v1.717c0 .177.144.321.321.321h4.825c.177 0 .321-.144.321-.321v-1.717a.321.321 0 00-.321-.321zM21.667 6.877V3.333A.333.333 0 0021.333 3H2.667a.333.333 0 00-.334.333v3.544c0 .184.15.333.334.333h19c.184 0 .333-.149.333-.333zM3 7.877v12.79A.333.333 0 003.333 21h17.334a.333.333 0 00.333-.333V7.877H3zm15.429 8.302H13.05a.321.321 0 00-.321.321v1.717c0 .177.144.321.321.321h5.379c.177 0 .321-.144.321-.321V16.5a.321.321 0 00-.321-.321zm0-4.666H6.746a.321.321 0 00-.321.321v1.717c0 .177.144.321.321.321h11.683c.177 0 .321-.144.321-.321v-1.717a.321.321 0 00-.321-.321z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Jira Integration Required</h3>
              <p className="text-gray-500 mb-4">Configure your Jira integration to view project data and issue metrics.</p>
              <a 
                href="/admin/integrations#jira"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configure Integration
              </a>
            </>
          ) : (
            <>
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 mb-4">{error || 'Failed to load Jira data'}</p>
              <button 
                onClick={fetchJiraAdminData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`jira-admin-widget bg-white rounded-2xl shadow-lg border border-blue-100 mb-8 overflow-hidden w-full max-w-full transition-all duration-300 ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Widget Header */}
      <div className="widget-header border-b border-blue-100">
        <div className="widget-content p-6 box-border">
          <div className="flex items-center justify-between w-full">
            <div className="header-left flex items-center space-x-4 flex-1 min-w-0">
              <div className="service-icon w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.571 11.513H6.746a.321.321 0 00-.321.321v1.717c0 .177.144.321.321.321h4.825c.177 0 .321-.144.321-.321v-1.717a.321.321 0 00-.321-.321zM21.667 6.877V3.333A.333.333 0 0021.333 3H2.667a.333.333 0 00-.334.333v3.544c0 .184.15.333.334.333h19c.184 0 .333-.149.333-.333zM3 7.877v12.79A.333.333 0 003.333 21h17.334a.333.333 0 00.333-.333V7.877H3zm15.429 8.302H13.05a.321.321 0 00-.321.321v1.717c0 .177.144.321.321.321h5.379c.177 0 .321-.144.321-.321V16.5a.321.321 0 00-.321-.321zm0-4.666H6.746a.321.321 0 00-.321.321v1.717c0 .177.144.321.321.321h11.683c.177 0 .321-.144.321-.321v-1.717a.321.321 0 00-.321-.321z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-blue-800 truncate">Jira Administration Overview</h3>
                <p className="text-sm text-gray-600 truncate">
                  {data.totalProjects} projects • {data.activeProjects} active • {data.totalUsers} users
                </p>
              </div>
            </div>
            <div className="header-right flex items-center space-x-3 flex-shrink-0">
              {/* Backend connection status */}
              <div className="status-badge">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  Connected
                </span>
              </div>
              <ExpandButton isExpanded={isExpanded} onClick={toggleExpanded} />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics (Always Visible) */}
      <div className="summary-metrics w-full box-border m-0 pb-4">
        <div className="widget-content p-6 box-border">
          <div className="flex items-center justify-between space-x-4 w-full">
            <QuickMetric 
              label="Total Projects" 
              value={data.totalProjects.toString()} 
            />
            <QuickMetric 
              label="Active Projects" 
              value={data.activeProjects.toString()} 
            />
            <QuickMetric 
              label="Issues (30d)" 
              value={data.recentIssues.toString()} 
              trend="+15%" 
            />
            <QuickMetric 
              label="Latest Update" 
              value={formatTimeAgo(data.lastUpdated)} 
            />
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="widget-details animate-in slide-in-from-top-5 duration-300 w-full box-border">
          {/* Metrics Grid */}
          <div className="detailed-metrics w-full box-border m-0 pb-4 border-t border-blue-100">
            <div className="widget-content p-6 box-border">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <MetricCard
                  value={data.totalProjects}
                  label="Total Projects"
                  sublabel="Across workspace"
                  icon="projects"
                  color="blue"
                />
                <MetricCard
                  value={data.activeProjects}
                  label="Active Projects"
                  sublabel="Software & service desk"
                  icon="active"
                  color="green"
                />
                <MetricCard
                  value={data.totalUsers}
                  label="Total Users"
                  sublabel="Workspace members"
                  icon="users"
                  color="purple"
                />
                <MetricCard
                  value={data.recentIssues}
                  label="Issues (30d)"
                  sublabel="Recent activity"
                  icon="issues"
                  color="orange"
                  trend="+15%"
                />
              </div>
            </div>
          </div>

          {/* Widget Details */}
          <div className="detailed-lists w-full box-border m-0 pb-4 border-t border-blue-100">
            <div className="widget-content p-6 box-border">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                {/* Issue Status Breakdown */}
                <div className="status-section w-full">
                  <h4 className="text-sm font-semibold text-blue-800 mb-4">Issue Status (30d)</h4>
                  <div className="space-y-2 w-full">
                    {Object.entries(data.issuesByStatus).slice(0, 5).map(([status, count]) => (
                      <IssueStatusItem
                        key={status}
                        status={status}
                        count={count}
                        color={getStatusColor(status)}
                      />
                    ))}
                  </div>
                </div>

                {/* Issue Types */}
                <div className="types-section w-full">
                  <h4 className="text-sm font-semibold text-blue-800 mb-4">Issue Types (30d)</h4>
                  <div className="space-y-2 w-full">
                    {Object.entries(data.issuesByType).slice(0, 5).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between py-2 w-full">
                        <span className="text-sm font-medium text-gray-900 truncate flex-1 mr-2">{type}</span>
                        <span className="text-sm text-gray-600 font-medium flex-shrink-0">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Most Active Projects */}
                <div className="projects-section w-full">
                  <h4 className="text-sm font-semibold text-blue-800 mb-4">Most Active Projects</h4>
                  <div className="space-y-1 w-full">
                    {data.topActiveProjects.slice(0, 5).map((project, index) => (
                      <ProjectActivity
                        key={project.key}
                        project={project}
                        rank={index + 1}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Widget Footer */}
          <div className="widget-footer border-t border-blue-100">
            <div className="widget-content p-6 box-border">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-500 truncate flex-1 mr-4">
                  Last updated: {formatDate(data.lastUpdated)}
                </span>
                <button className="view-details-btn px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
                  Manage Projects
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
