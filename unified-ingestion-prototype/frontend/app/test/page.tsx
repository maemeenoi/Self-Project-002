'use client'
import { useState } from 'react'

export default function TestPage() {
  const [results, setResults] = useState<any>({})

  const testEndpoint = async (name: string, url: string, body: any) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await response.json()
      setResults(prev => ({ ...prev, [name]: data }))
    } catch (error) {
      setResults(prev => ({ ...prev, [name]: { error: error.message } }))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">API Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button 
          onClick={() => testEndpoint('jira-csv', '/api/ingest/jira/csv-file', { filename: 'Jira (2).csv' })}
          className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Jira CSV (Your File)
        </button>
        
        <button 
          onClick={() => testEndpoint('github-prs', '/api/ingest/github/prs', { demo: false })}
          className="p-4 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test GitHub PRs (Your Repo)
        </button>
        
        <button 
          onClick={() => testEndpoint('github-actions', '/api/ingest/github/actions', { demo: false })}
          className="p-4 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test GitHub Actions (Your Repo)
        </button>
        
        <button 
          onClick={() => testEndpoint('jira-api-demo', '/api/ingest/jira/api', { demo: true })}
          className="p-4 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Test Jira API (Demo)
        </button>
        
        <button 
          onClick={() => testEndpoint('github-demo', '/api/ingest/github/prs', { demo: true })}
          className="p-4 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Test GitHub PRs (Demo)
        </button>
        
        <button 
          onClick={() => testEndpoint('metrics', '/api/metrics/deployments', {})}
          className="p-4 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Metrics
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="border rounded p-4">
            <h3 className="font-semibold mb-2">{key}</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
