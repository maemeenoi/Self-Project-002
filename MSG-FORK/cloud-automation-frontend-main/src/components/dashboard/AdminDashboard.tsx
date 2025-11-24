'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import GitHubAdminWidget from '@/components/admin/GitHubAdminWidget'
import JiraAdminWidget from '@/components/admin/JiraAdminWidget'
import AdminSettings from '@/components/admin/AdminSettings'

interface CompanyStats {
  totalUsers: number
  totalProjects: number
  totalCosts: number
  activeIntegrations: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<CompanyStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalCosts: 0,
    activeIntegrations: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch company stats from backend
    const fetchCompanyStats = async () => {
      try {
        // Mock data for now - replace with actual API call
        setStats({
          totalUsers: 12,
          totalProjects: 8,
          totalCosts: 2847.52,
          activeIntegrations: 4
        })
      } catch (error) {
        console.error('Failed to fetch company stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyStats()
  }, [])

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'github', name: 'GitHub', icon: '🐙' },
    { id: 'jira', name: 'Jira', icon: '🎯' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'github':
        return <GitHubAdminWidget />
      case 'jira':
        return <JiraAdminWidget />
      case 'settings':
        return <AdminSettings />
      default:
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalProjects}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Monthly Costs</dt>
                        <dd className="text-lg font-medium text-gray-900">${stats.totalCosts.toFixed(2)}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Integrations</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.activeIntegrations}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('github')}
                    className="relative block w-full bg-white p-4 border-2 border-gray-300 border-dashed rounded-lg text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="text-2xl">🐙</span>
                    <span className="mt-2 block text-sm font-medium text-gray-900">GitHub Admin</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('jira')}
                    className="relative block w-full bg-white p-4 border-2 border-gray-300 border-dashed rounded-lg text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="text-2xl">🎯</span>
                    <span className="mt-2 block text-sm font-medium text-gray-900">Jira Admin</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="relative block w-full bg-white p-4 border-2 border-gray-300 border-dashed rounded-lg text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="text-2xl">⚙️</span>
                    <span className="mt-2 block text-sm font-medium text-gray-900">Settings</span>
                  </button>
                  <button className="relative block w-full bg-white p-4 border-2 border-gray-300 border-dashed rounded-lg text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span className="text-2xl">👥</span>
                    <span className="mt-2 block text-sm font-medium text-gray-900">Manage Users</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Company Admin Dashboard
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Welcome back, {user?.firstName}! Here's what's happening at {user?.organizationName}.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Company Admin
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}