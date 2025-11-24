'use client'

import { useState, useEffect } from 'react'

interface GitHubAdminData {
  totalRepositories: number
  privateRepositories: number
  publicRepositories: number
  activeRepositories: number
  totalMembers: number
  topLanguages: { language: string; count: number }[]
  topRepositories: {
    name: string
    fullName: string
    updatedAt: string
    language: string
    private: boolean
    stars: number
    forks: number
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

interface LanguageItemProps {
  language: string
  count: number
  percentage: string
}

interface RepoActivityProps {
  repo: string
  language: string | null
  time: string
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
      case 'repo':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        )
      case 'lock':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
      case 'activity':
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

const LanguageItem = ({ language, count, percentage }: LanguageItemProps) => {
  const getLanguageColor = (lang: string) => {
    // All languages use blue shades
    switch (lang.toLowerCase()) {
      case 'typescript': return 'bg-blue-500'
      case 'python': return 'bg-blue-600'
      case 'javascript': return 'bg-blue-400'
      case 'hcl': return 'bg-blue-700'
      case 'dockerfile': return 'bg-blue-600'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${getLanguageColor(language)}`}></div>
        <span className="text-sm font-medium text-gray-900">{language}</span>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600">{count} repos</span>
        <span className="text-xs text-gray-500 font-medium">{percentage}</span>
      </div>
    </div>
  )
}

const RepoActivity = ({ repo, language, time }: RepoActivityProps) => {
  const getLanguageColor = (lang: string | null) => {
    if (!lang) return 'bg-gray-400'
    // All languages use blue shades
    switch (lang.toLowerCase()) {
      case 'typescript': return 'bg-blue-500'
      case 'python': return 'bg-blue-600'
      case 'javascript': return 'bg-blue-400'
      case 'dockerfile': return 'bg-blue-600'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        <div>
          <div className="text-sm font-medium text-gray-900">{repo}</div>
          {language && (
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${getLanguageColor(language)}`}></div>
              <span className="text-xs text-gray-500">{language}</span>
            </div>
          )}
        </div>
      </div>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  )
}

const QuickMetric = ({ label, value, trend }: QuickMetricProps) => {
  return (
    <div className="flex-1 text-center">
      <div className="flex items-center justify-center space-x-1">
        <span className="text-lg font-semibold text-blue-700">{value}</span>
        {trend && (
          <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
            {trend}
          </span>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
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

export default function GitHubAdminWidget() {
  const [data, setData] = useState<GitHubAdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    fetchGitHubAdminData()
  }, [])

  const fetchGitHubAdminData = async () => {
    try {
      setLoading(true)
      
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
        const githubStatus = statusData.find((s: any) => s.integration_type === 'github')
        
        // If not properly configured or no real data, show configuration prompt
        if (!githubStatus?.configured || githubStatus.records_count === 0) {
          setError('Please configure GitHub integration to view repository data')
          setLoading(false)
          return
        }
      }
      if (!authToken) {
        throw new Error('No authentication token found')
      }
      
      const response = await fetch('/api/admin/github-overview', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch GitHub admin data')
      }

      const adminData = await response.json()
      setData(adminData)
      setError(null)
    } catch (err) {
      console.error('Error fetching GitHub admin data:', err)
      setError('Please configure GitHub integration to view repository data')
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

  const calculatePercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    const isConfigurationError = error?.includes('Please configure')
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 text-center">
          {isConfigurationError ? (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">GitHub Integration Required</h3>
              <p className="text-gray-500 mb-4">Configure your GitHub integration to view repository data and metrics.</p>
              <a 
                href="/admin/integrations#github"
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
              <p className="text-gray-500 mb-4">{error || 'Failed to load GitHub data'}</p>
              <button 
                onClick={fetchGitHubAdminData}
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
    <div className={`github-admin-widget bg-white rounded-xl border border-blue-100 shadow-sm transition-all duration-300 ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Widget Header */}
      <div className="widget-header border-b border-blue-100 p-6">
        <div className="flex items-center justify-between">
          <div className="header-left flex items-center space-x-4">
            <div className="service-icon w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">GitHub Repository Management</h3>
              <p className="text-sm text-gray-600">
                {data.totalRepositories} repositories • {data.activeRepositories} active • {data.totalMembers} members
              </p>
            </div>
          </div>
          <div className="header-right flex items-center space-x-3">
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

      {/* Summary Metrics (Always Visible) */}
      <div className="summary-metrics p-6">
        <div className="flex items-center justify-between space-x-4">
          <QuickMetric 
            label="Total Repos" 
            value={data.totalRepositories.toString()} 
            trend="+2" 
          />
          <QuickMetric 
            label="Active (30d)" 
            value={data.activeRepositories.toString()} 
          />
          <QuickMetric 
            label="Members" 
            value={data.totalMembers.toString()} 
          />
          <QuickMetric 
            label="Latest Activity" 
            value={data.topRepositories[0] ? formatTimeAgo(data.topRepositories[0].updatedAt) : 'N/A'} 
          />
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="widget-details animate-in slide-in-from-top-5 duration-300">
          {/* Metrics Grid */}
          <div className="metrics-grid p-6 border-t border-blue-100">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                value={data.totalRepositories}
                label="Total Repositories"
                sublabel="Across organisation"
                icon="repo"
                color="blue"
                trend="+2 this month"
              />
              <MetricCard
                value={data.privateRepositories}
                label="Private Repos"
                sublabel={`${calculatePercentage(data.privateRepositories, data.totalRepositories)}% private`}
                icon="lock"
                color="purple"
              />
              <MetricCard
                value={data.activeRepositories}
                label="Active (30d)"
                sublabel="Recently updated"
                icon="activity"
                color="green"
              />
              <MetricCard
                value={data.totalMembers}
                label="Members"
                sublabel="Organisation team"
                icon="users"
                color="orange"
              />
            </div>
          </div>

          {/* Widget Details */}
          <div className="widget-details-content p-6 border-t border-blue-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Technology Stack */}
              <div className="languages-section">
                <h4 className="text-sm font-semibold text-blue-800 mb-4">Technology Stack</h4>
                <div className="space-y-2">
                  {data.topLanguages.slice(0, 5).map((lang) => (
                    <LanguageItem
                      key={lang.language}
                      language={lang.language || 'Other'}
                      count={lang.count}
                      percentage={`${calculatePercentage(lang.count, data.totalRepositories)}%`}
                    />
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="activity-section">
                <h4 className="text-sm font-semibold text-blue-800 mb-4">Recent Activity</h4>
                <div className="space-y-1">
                  {data.topRepositories.slice(0, 5).map((repo) => (
                    <RepoActivity
                      key={repo.name}
                      repo={repo.name}
                      language={repo.language}
                      time={formatDate(repo.updatedAt)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Widget Footer */}
          <div className="widget-footer flex items-center justify-between p-6 border-t border-blue-100">
            <span className="text-sm text-gray-500">
              Last updated: {formatDate(data.lastUpdated)}
            </span>
            <button className="view-details-btn px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Manage Repositories
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
