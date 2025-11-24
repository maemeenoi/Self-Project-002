'use client'

import { useState, useEffect } from 'react'

interface ApiSettings {
  github: {
    token: string
  }
  jira: {
    baseUrl: string
    token: string
    email: string
  }
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<ApiSettings>({
    github: { token: '' },
    jira: { baseUrl: '', token: '', email: '' }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<{ [key: string]: boolean }>({})
  const [message, setMessage] = useState('')
  const [testResults, setTestResults] = useState<{ [key: string]: { valid: boolean, message: string } }>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
      setMessage('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const testToken = async (service: 'github' | 'jira') => {
    setTesting(prev => ({ ...prev, [service]: true }))
    
    try {
      const config = service === 'github' 
        ? {}
        : { baseUrl: settings.jira.baseUrl, email: settings.jira.email }
      
      const token = service === 'github' ? settings.github.token : settings.jira.token
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, token, ...config })
      })
      
      const result = await response.json()
      setTestResults(prev => ({ ...prev, [service]: result }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [service]: { valid: false, message: `Test failed: ${(error as Error).message}` }
      }))
    } finally {
      setTesting(prev => ({ ...prev, [service]: false }))
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage('Settings saved successfully! Please restart the application for changes to take effect.')
        // Clear test results since tokens may have changed
        setTestResults({})
      } else {
        setMessage(result.error || 'Failed to save settings')
      }
    } catch (error) {
      setMessage(`Failed to save settings: ${(error as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2">
          <span className="loading loading-spinner loading-sm"></span>
          Loading settings...
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-base-content/70 mt-2">
          Manage API tokens and integration settings. Tokens will be securely stored in your environment file.
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'} mb-6`}>
          <span>{message}</span>
        </div>
      )}

      <div className="grid gap-6">
        {/* GitHub Settings */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub Integration
            </h2>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Personal Access Token</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="input input-bordered flex-1"
                  value={settings.github.token}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    github: { token: e.target.value }
                  }))}
                />
                <button
                  className="btn btn-outline"
                  onClick={() => testToken('github')}
                  disabled={!settings.github.token || testing.github}
                >
                  {testing.github ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    'Test'
                  )}
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt">
                  Get your token from GitHub → Settings → Developer settings → Personal access tokens
                </span>
              </label>
            </div>


            {testResults.github && (
              <div className={`alert ${testResults.github.valid ? 'alert-success' : 'alert-error'} mt-2`}>
                <span>{testResults.github.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Jira Settings */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.53 2c0 2.4 1.97 4.37 4.37 4.37h.91l-2.78 2.78c-.88.88-.88 2.32 0 3.2l2.78 2.78h-.91c-2.4 0-4.37 1.97-4.37 4.37v.91l-2.78-2.78c-.88-.88-2.32-.88-3.2 0L2.57 19.91v-.91c0-2.4-1.97-4.37-4.37-4.37H-2.7l2.78-2.78c.88-.88.88-2.32 0-3.2L-2.7 5.87h.91C.61 5.87 2.57 3.9 2.57 1.5v-.91l2.78 2.78c.88.88 2.32.88 3.2 0L11.53 0v2z"/>
              </svg>
              Jira Integration
            </h2>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Base URL</span>
              </label>
              <input
                type="url"
                placeholder="https://your-domain.atlassian.net/"
                className="input input-bordered"
                value={settings.jira.baseUrl}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  jira: { ...prev.jira, baseUrl: e.target.value }
                }))}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="your-email@domain.com"
                className="input input-bordered"
                value={settings.jira.email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  jira: { ...prev.jira, email: e.target.value }
                }))}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">API Token</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="ATATT3xFfGF0..."
                  className="input input-bordered flex-1"
                  value={settings.jira.token}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    jira: { ...prev.jira, token: e.target.value }
                  }))}
                />
                <button
                  className="btn btn-outline"
                  onClick={() => testToken('jira')}
                  disabled={!settings.jira.token || !settings.jira.email || !settings.jira.baseUrl || testing.jira}
                >
                  {testing.jira ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    'Test'
                  )}
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt">
                  Get your token from Jira → Profile → Security → API tokens
                </span>
              </label>
            </div>

            {testResults.jira && (
              <div className={`alert ${testResults.jira.valid ? 'alert-success' : 'alert-error'} mt-2`}>
                <span>{testResults.jira.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          className="btn btn-primary"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  )
}
