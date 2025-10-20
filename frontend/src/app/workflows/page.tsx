'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ChartCard } from '@/components/ui/ChartCard'

interface WorkflowFact {
  WorkflowID: number
  CompanyID: number
  Provider: string
  ItemType: string
  ItemKey: string
  Title: string
  Status: string
  Assignee: string | null
  Author: string
  ProjectOrRepo: string
  CreatedAt: string
  ClosedAt: string | null
  CompanyName: string
}

export default function WorkflowsPage() {
  const [workflowData, setWorkflowData] = useState<WorkflowFact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<number>(1)

  // Widget data
  const [jiraIssues, setJiraIssues] = useState<any[]>([])
  const [pullRequests, setPullRequests] = useState<any[]>([])
  const [teamPerformance, setTeamPerformance] = useState<any[]>([])

  useEffect(() => {
    const fetchWorkflowData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/workflow-facts?limit=50`)
        if (!response.ok) {
          throw new Error('Failed to fetch workflow data')
        }
        const data = await response.json()
        // API returns {workflow_facts: [...], count: number}, we need just the array
        setWorkflowData(data.workflow_facts || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    const fetchWidgets = async () => {
      try {
        // Fetch Jira issues
        const jiraRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/widgets/workflow/jira?company_id=${selectedCompany}`)
        if (jiraRes.ok) {
          const jiraData = await jiraRes.json()
          setJiraIssues(jiraData)
        }

        // Fetch pull requests
        const prRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/widgets/workflow/pull-requests?company_id=${selectedCompany}`)
        if (prRes.ok) {
          const prData = await prRes.json()
          setPullRequests(prData)
        }

        // Fetch team performance
        const teamRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/widgets/workflow/team-performance?company_id=${selectedCompany}`)
        if (teamRes.ok) {
          const teamData = await teamRes.json()
          setTeamPerformance(teamData)
        }
      } catch (err) {
        console.error('Error fetching widgets:', err)
      }
    }

    fetchWorkflowData()
    fetchWidgets()
  }, [selectedCompany])

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
      case 'closed':
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'in progress':
      case 'in_progress':
      case 'open':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'jira':
        return '📋'
      case 'github':
        return '🐙'
      case 'azure':
        return '☁️'
      default:
        return '⚙️'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Workflows</h1>
            <p className="mt-2 text-sm text-gray-700">
              Development workflow tracking and team performance metrics
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

        {/* Workflow Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard title="Jira Issues by Status">
            <div className="space-y-2">
              {jiraIssues.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 capitalize">{item.Status}</span>
                  <span className="font-medium">{item.issue_count}</span>
                </div>
              ))}
              {jiraIssues.length === 0 && (
                <div className="text-gray-500 text-sm">No Jira data available</div>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Pull Requests">
            <div className="space-y-2">
              {pullRequests.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 capitalize">{item.Status}</span>
                  <span className="font-medium">{item.pr_count}</span>
                </div>
              ))}
              {pullRequests.length === 0 && (
                <div className="text-gray-500 text-sm">No PR data available</div>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Team Performance">
            <div className="space-y-2">
              {teamPerformance.slice(0, 5).map((item, index) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{item.Assignee || 'Unassigned'}</span>
                    <span className="font-medium">{item.items_completed}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Lead: {item.avg_lead ? `${parseFloat(item.avg_lead).toFixed(1)}h` : 'N/A'}
                  </div>
                </div>
              ))}
              {teamPerformance.length === 0 && (
                <div className="text-gray-500 text-sm">No team data available</div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Workflow Data Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Workflow Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workflowData.map((record) => (
                    <tr key={record.WorkflowID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getProviderIcon(record.Provider)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.Title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.ItemType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.Provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(record.Status)}`}>
                          {record.Status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.Assignee || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.ProjectOrRepo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.CreatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {workflowData.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No workflow data</h3>
            <p className="mt-1 text-sm text-gray-500">Workflow items will appear here when available.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}