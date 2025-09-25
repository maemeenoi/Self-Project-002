"use client"
import { useState } from "react"
import { IngestionCharts } from "../components/IngestionCharts"

export default function IngestionDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("")
  const [runs, setRuns] = useState([])

  // --- Jira creds ---
  const [jiraUrl, setJiraUrl] = useState("")
  const [jiraEmail, setJiraEmail] = useState("")
  const [jiraToken, setJiraToken] = useState("")

  // --- GitHub states ---
  const [ghRepo, setGhRepo] = useState("")
  const [ghToken, setGhToken] = useState("")
  const [ghLoading, setGhLoading] = useState(false)
  const [ghError, setGhError] = useState("")
  const [ghData, setGhData] = useState(null)

  // --- FOCUS CSV states ---
  const [focusLoading, setFocusLoading] = useState(false)
  const [focusError, setFocusError] = useState("")
  const [focusData, setFocusData] = useState(null)

  // --- Ingestion Status ---
  const [statusLoading, setStatusLoading] = useState(false)

  // --- Fetch ingestion status ---
  const fetchIngestionStatus = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/ingest/status")
      if (response.ok) {
        const statusData = await response.json()
        setStatus(statusData)
      }
    } catch (error) {
      console.error("Status fetch error:", error)
    }
  }

  // --- CSV Upload Handler (using unified ingestion) ---
  async function handleUpload(e) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setData(null)

    const fileInput = e.target.elements.file
    if (!fileInput.files.length) {
      setError("Please select a CSV file.")
      setLoading(false)
      return
    }

    // For demo, we'll use the sample file
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "jira_csv",
          input: { filePath: "bronze/sample-jira-export.csv" },
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || "Ingestion failed.")
      } else {
        setData(result)
        await fetchIngestionStatus() // Refresh status
      }
    } catch (err) {
      setError("Network error. Please try again.")
    }
    setLoading(false)
  }

  // --- Jira API Handler (using unified ingestion) ---
  async function handleFetchJira() {
    setLoading(true)
    setError("")
    setData(null)

    if (!jiraUrl.trim() || !jiraEmail.trim() || !jiraToken.trim()) {
      setError("Please fill in all three Jira API fields.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "jira_api",
          config: {
            baseUrl: jiraUrl,
            email: jiraEmail,
            token: jiraToken,
            jql: "updated >= -30d",
          },
        }),
      })
      const result = await res.json()

      console.log("Jira ingestion response:", result)

      if (!res.ok) {
        setError(result.error || "Failed to ingest Jira data.")
      } else if (!result.result.ok) {
        setError(result.result.error || "Ingestion failed.")
      } else {
        setData(result)
        await fetchIngestionStatus() // Refresh status
      }
    } catch (err) {
      setError("Network error. Please try again.")
    }
    setLoading(false)
  }

  // --- GitHub API Handler (using unified ingestion) ---
  async function handleFetchGitHub() {
    setGhLoading(true)
    setGhError("")
    setGhData(null)

    if (!ghRepo.trim() || !ghToken.trim()) {
      setGhError("Please provide both repository and token.")
      setGhLoading(false)
      return
    }

    const [org, repo] = ghRepo.split("/")
    if (!org || !repo) {
      setGhError("Repository format should be 'owner/repo'")
      setGhLoading(false)
      return
    }

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "github",
          config: {
            token: ghToken,
            org: org,
            repo: repo,
            dataType: "pulls",
          },
        }),
      })
      const result = await res.json()
      console.log("GitHub ingestion response:", result)

      if (!res.ok) {
        setGhError(result.error || "Failed to ingest GitHub data.")
      } else if (!result.result.ok) {
        setGhError(result.result.error || "Ingestion failed.")
      } else {
        setGhData(result)
        await fetchIngestionStatus() // Refresh status
      }
    } catch (err) {
      setGhError("Network error. Please try again.")
    }
    setGhLoading(false)
  }

  // --- Test GitHub Token ---
  async function testGitHubToken() {
    if (!ghToken.trim()) {
      setGhError("Please enter a token first.")
      return
    }

    setGhLoading(true)
    setGhError("")

    try {
      // Use GitHub API directly to test token
      const res = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${ghToken}`,
          "User-Agent": "Unified-Ingestion-Framework",
        },
      })

      if (!res.ok) {
        setGhError("Invalid token or insufficient permissions.")
      } else {
        const user = await res.json()
        setGhError(`✅ Token valid! User: ${user.login}`)
      }
    } catch (err) {
      setGhError("Network error during token test.")
    }
    setGhLoading(false)
  }

  // --- FOCUS CSV Handler ---
  async function handleFocusUpload(e) {
    e.preventDefault()
    setFocusLoading(true)
    setFocusError("")
    setFocusData(null)

    // For demo, we'll simulate FOCUS CSV ingestion
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "focus_csv",
          input: { filePath: "bronze/focus/sample-billing.csv" },
        }),
      })
      const result = await res.json()

      if (!res.ok) {
        setFocusError(result.error || "FOCUS CSV ingestion failed.")
      } else {
        setFocusData(result)
        await fetchIngestionStatus() // Refresh status
      }
    } catch (err) {
      setFocusError("Network error. Please try again.")
    }
    setFocusLoading(false)
  }

  // --- Export Data ---
  function exportData(dataToExport, filename) {
    if (!dataToExport) {
      alert("No data to export. Please ingest data first.")
      return
    }

    const exportData = {
      exportTimestamp: new Date().toISOString(),
      exportedBy: "Unified Ingestion Framework",
      data: dataToExport,
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.json`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Load status on component mount
  useState(() => {
    fetchIngestionStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col items-center py-10">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
          🚀 Unified Data Ingestion Framework
        </h1>

        {/* Status Overview */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-800">
              Ingestion Status
            </h2>
            <button
              onClick={fetchIngestionStatus}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow text-sm"
              disabled={statusLoading}
            >
              {statusLoading ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>

          {runs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {runs.slice(0, 6).map((run) => (
                <div
                  key={run.run_id}
                  className={`p-3 rounded border-l-4 ${
                    run.status === "success"
                      ? "border-green-500 bg-green-50"
                      : run.status === "failed"
                      ? "border-red-500 bg-red-50"
                      : "border-yellow-500 bg-yellow-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{run.source}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        run.status === "success"
                          ? "bg-green-200 text-green-800"
                          : run.status === "failed"
                          ? "bg-red-200 text-red-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {run.rows_upserted || 0} rows • {run.duration_seconds || 0}s
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(run.started_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No ingestion runs yet. Start by uploading data or connecting to
              APIs.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* --- CSV Upload Section --- */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-inner">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">
                📄 Jira CSV Upload
              </h2>
              <form onSubmit={handleUpload} className="space-y-3">
                <input
                  type="file"
                  name="file"
                  accept=".csv"
                  className="block w-full text-sm text-gray-700 
                    file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                    file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
                    hover:file:bg-blue-100"
                />
                <button
                  type="submit"
                  className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "🚀 Ingest CSV"}
                </button>
              </form>
              <p className="text-xs text-blue-600 mt-2">
                Using sample data for demo. Real file upload coming soon!
              </p>
            </div>

            {/* --- Jira API Section --- */}
            <div className="bg-green-50 p-6 rounded-lg shadow-inner">
              <h2 className="text-lg font-semibold text-green-800 mb-4">
                🔗 Jira API Integration
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Jira Base URL (https://yourdomain.atlassian.net)"
                  value={jiraUrl}
                  onChange={(e) => setJiraUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                />
                <input
                  type="email"
                  placeholder="Your Jira Email"
                  value={jiraEmail}
                  onChange={(e) => setJiraEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                />
                <input
                  type="password"
                  placeholder="API Token"
                  value={jiraToken}
                  onChange={(e) => setJiraToken(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                />
                <button
                  onClick={handleFetchJira}
                  className="w-full px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "🚀 Ingest from Jira API"}
                </button>
              </div>
            </div>

            {/* --- FOCUS CSV Section --- */}
            <div className="bg-purple-50 p-6 rounded-lg shadow-inner">
              <h2 className="text-lg font-semibold text-purple-800 mb-4">
                ☁️ Cloud Billing (FOCUS CSV)
              </h2>
              <form onSubmit={handleFocusUpload} className="space-y-3">
                <input
                  type="file"
                  name="focusFile"
                  accept=".csv"
                  className="block w-full text-sm text-gray-700 
                    file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                    file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 
                    hover:file:bg-purple-100"
                />
                <button
                  type="submit"
                  className="w-full px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow"
                  disabled={focusLoading}
                >
                  {focusLoading ? "Processing..." : "🚀 Ingest Cloud Billing"}
                </button>
              </form>
              <p className="text-xs text-purple-600 mt-2">
                Supports AWS CUR, Azure Cost Management, and GCP Billing exports
              </p>

              {focusError && (
                <div className="text-red-500 font-semibold mt-3 bg-red-50 p-3 rounded border border-red-200">
                  {focusError}
                </div>
              )}

              {focusData && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <h4 className="font-medium text-purple-800">
                    ✅ Cloud Billing Data Ingested
                  </h4>
                  <p className="text-sm text-gray-600">
                    Run ID: {focusData.runId} • Status:{" "}
                    {focusData.result.ok ? "Success" : "Failed"}
                  </p>
                  <button
                    onClick={() => exportData(focusData, "cloud-billing")}
                    className="mt-2 px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm hover:bg-purple-200"
                  >
                    📄 Export Data
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* --- GitHub Section --- */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="text-black inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 .3a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 10 5.8c.85.004 1.71.12 2.51.35 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 10 .3" />
                </svg>
                GitHub Integration
              </h2>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Repository (owner/repo)
                </label>
                <input
                  type="text"
                  placeholder="e.g. vercel/next.js"
                  value={ghRepo}
                  onChange={(e) => setGhRepo(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                />

                <label className="block text-sm font-medium text-gray-700">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  placeholder="Paste your GitHub token here"
                  value={ghToken}
                  onChange={(e) => setGhToken(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                />
                <p className="text-xs text-gray-500">
                  Generate a token at{" "}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-700"
                  >
                    github.com/settings/tokens
                  </a>{" "}
                  (repo scope required)
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={testGitHubToken}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow text-sm"
                    disabled={ghLoading}
                  >
                    {ghLoading ? "Testing..." : "Test Token"}
                  </button>
                  <button
                    onClick={handleFetchGitHub}
                    className="flex-1 px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-lg shadow"
                    disabled={ghLoading}
                  >
                    {ghLoading ? "Processing..." : "🚀 Ingest GitHub Data"}
                  </button>
                  <button
                    onClick={() => exportData(ghData, "github-data")}
                    disabled={!ghData}
                    className={`px-4 py-2 font-bold rounded-lg shadow text-sm ${
                      ghData
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    📄 Export
                  </button>
                </div>

                {ghError && (
                  <div className="text-red-500 font-semibold bg-red-50 p-3 rounded border border-red-200">
                    <p>{ghError}</p>
                  </div>
                )}

                {ghData && (
                  <div className="mt-4 p-4 bg-white rounded border">
                    <h4 className="font-medium text-gray-800">
                      ✅ GitHub Data Ingested
                    </h4>
                    <p className="text-sm text-gray-600">
                      Run ID: {ghData.runId} • Status:{" "}
                      {ghData.result.ok ? "Success" : "Failed"}
                    </p>
                    {ghData.result.rows_upserted && (
                      <p className="text-sm text-green-600">
                        📊 {ghData.result.rows_upserted} pull requests processed
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* --- Real-time Analytics Preview --- */}
            <div className="bg-indigo-50 p-6 rounded-lg shadow-inner">
              <h2 className="text-lg font-semibold text-indigo-800 mb-4">
                📊 Real-time Analytics
              </h2>

              {data || ghData || focusData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded text-center">
                      <div className="text-lg font-bold text-indigo-700">
                        {runs.filter((r) => r.status === "success").length}
                      </div>
                      <div className="text-xs text-indigo-600">
                        Successful Runs
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <div className="text-lg font-bold text-green-700">
                        {runs.reduce(
                          (sum, r) => sum + (r.rows_upserted || 0),
                          0
                        )}
                      </div>
                      <div className="text-xs text-green-600">
                        Total Rows Ingested
                      </div>
                    </div>
                  </div>

                  <IngestionCharts runs={runs} />
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  📈 Analytics will appear here after data ingestion
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Error Display --- */}
        {error && (
          <div className="mt-6 text-red-500 font-semibold bg-red-50 p-4 rounded-lg border border-red-200">
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </div>
        )}

        {/* --- Results Display --- */}
        {data && (
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📋 Ingestion Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-gray-700">Run ID</h3>
                <p className="text-sm text-gray-600 font-mono">{data.runId}</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-gray-700">Source</h3>
                <p className="text-sm text-gray-600">{data.source}</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-gray-700">Status</h3>
                <p
                  className={`text-sm font-medium ${
                    data.result.ok ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {data.result.ok ? "✅ Success" : "❌ Failed"}
                </p>
              </div>
            </div>

            {data.result.ok && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <span className="text-sm font-medium text-blue-700">
                    Rows Read:
                  </span>
                  <span className="ml-2 text-blue-900">
                    {data.result.rows_read || 0}
                  </span>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <span className="text-sm font-medium text-green-700">
                    Rows Upserted:
                  </span>
                  <span className="ml-2 text-green-900">
                    {data.result.rows_upserted || 0}
                  </span>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <span className="text-sm font-medium text-yellow-700">
                    Duration:
                  </span>
                  <span className="ml-2 text-yellow-900">
                    {data.result.duration || 0}ms
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
