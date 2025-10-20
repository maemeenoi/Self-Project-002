'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function ApiTestPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const endpoints = [
    { name: 'Health Check', url: '/health', method: 'GET' },
    { name: 'Get Companies', url: '/companies', method: 'GET' },
    { name: 'Get Users', url: '/users', method: 'GET' },
    { name: 'Get Financial Facts', url: '/financial-facts', method: 'GET' },
    { name: 'Get Workflow Facts', url: '/workflow-facts', method: 'GET' },
    // Widget Tests
    { name: 'Cost Breakdown (Company 1)', url: '/widgets/financial/cost-breakdown?company_id=1&group_by=ServiceName', method: 'GET' },
    { name: 'Savings Summary (Company 1)', url: '/widgets/financial/savings-summary?company_id=1', method: 'GET' },
    { name: 'Cost Trend (Company 1)', url: '/widgets/financial/cost-trend?company_id=1', method: 'GET' },
    { name: 'Jira Issues (Company 1)', url: '/widgets/workflow/jira?company_id=1', method: 'GET' },
    { name: 'GitHub PRs (Company 1)', url: '/widgets/workflow/pull-requests?company_id=1', method: 'GET' },
    { name: 'Executive KPIs (Company 1)', url: '/widgets/combined/executive-kpi?company_id=1', method: 'GET' },
    { name: 'Total Users (System)', url: '/widgets/system/total-users', method: 'GET' },
  ]

  const testEndpoint = async (endpoint: { name: string; url: string; method: string }) => {
    setLoading(prev => ({ ...prev, [endpoint.name]: true }))
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      setResults(prev => ({
        ...prev,
        [endpoint.name]: {
          status: response.status,
          success: response.ok,
          data: data,
          timestamp: new Date().toISOString()
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [endpoint.name]: {
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [endpoint.name]: false }))
    }
  }

  const testAllEndpoints = async () => {
    for (const endpoint of endpoints) {
      await testEndpoint(endpoint)
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">API Testing</h1>
            <p className="mt-2 text-sm text-gray-700">
              Test backend API endpoints - Backend URL: {process.env.NEXT_PUBLIC_BACKEND_URL}
            </p>
          </div>
          <button
            onClick={testAllEndpoints}
            className="btn btn-primary"
          >
            Test All Endpoints
          </button>
        </div>

        <div className="grid gap-6">
          {endpoints.map((endpoint) => (
            <div key={endpoint.name} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{endpoint.name}</h3>
                  <p className="text-sm text-gray-500">
                    {endpoint.method} {endpoint.url}
                  </p>
                </div>
                <button
                  onClick={() => testEndpoint(endpoint)}
                  disabled={loading[endpoint.name]}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {loading[endpoint.name] ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Testing...
                    </div>
                  ) : (
                    'Test'
                  )}
                </button>
              </div>

              {results[endpoint.name] && (
                <div className="mt-4">
                  <div className={`p-4 rounded-md ${
                    results[endpoint.name].success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        results[endpoint.name].success
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Status: {results[endpoint.name].status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(results[endpoint.name].timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {results[endpoint.name].error ? (
                      <div className="text-sm text-red-800">
                        <strong>Error:</strong> {results[endpoint.name].error}
                      </div>
                    ) : (
                      <div className="text-sm">
                        <strong>Response:</strong>
                        <pre className="mt-2 p-3 bg-white rounded border overflow-auto text-xs">
                          {JSON.stringify(results[endpoint.name].data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}