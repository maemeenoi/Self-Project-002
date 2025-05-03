"use client"

import { useState, useEffect, useRef } from "react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ReportGenerator from "../../components/report/ReportGenerator"
import GaugeMeter from "../../components/GaugeMeter"

export default function Dashboard() {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [industryStandards, setIndustryStandards] = useState([])
  const [processedData, setProcessedData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isReportComplete, setIsReportComplete] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/session")
        const data = await response.json()

        if (!data.isLoggedIn) {
          // Redirect to login if not authenticated
          router.push("/login?redirect=/dashboard")
          return
        }

        setUser(data.user)

        // If user has a clientId, automatically select it
        if (data.user?.clientId) {
          setSelectedClient({
            ClientID: data.user.clientId,
            ClientName: data.user.clientName || "Unknown",
          })
        }
      } catch (error) {
        console.error("Failed to check authentication:", error)
      }
    }

    checkAuth()
  }, [router])

  const getOrganizationName = () => {
    if (!processedData?.reportMetadata?.organizationName) {
      console.log("Organization name not found, using default")
      return user?.organization || "Unknown Organization"
    }
    return processedData.reportMetadata.organizationName
  }

  // Fetch clients list (only for admin users with no specific clientId)
  useEffect(() => {
    async function fetchClients() {
      if (user && !user.clientId) {
        try {
          const response = await fetch("/api/clients")
          const data = await response.json()
          setClients(data)
        } catch (error) {
          setError("Failed to load clients.")
        }
      }
    }

    if (user) {
      fetchClients()
    }
  }, [user])

  // Fetch industry standards
  useEffect(() => {
    async function fetchIndustryStandards() {
      try {
        const response = await fetch("/api/industry-standards")
        const data = await response.json()
        setIndustryStandards(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchIndustryStandards()
  }, [])

  // Fetch responses when a client is selected
  useEffect(() => {
    if (!selectedClient || industryStandards.length === 0) return

    async function fetchResponses() {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/responses/${selectedClient.ClientID}`
        )
        const data = await response.json()

        if (data && data.length > 0) {
          const module = await import("../../lib/assessmentUtils")
          const processed = module.default.processAssessmentData(
            data,
            industryStandards
          )

          setProcessedData(processed)
        } else {
          // No responses found - need to complete questionnaire
          setError(
            "No assessment data found. Please complete the questionnaire first."
          )
        }
      } catch (error) {
        setError("Failed to load responses.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchResponses()
  }, [selectedClient, industryStandards])

  // Count how many standards are above/below/meeting
  const countStandards = (type) => {
    // Check if the required data exists
    if (
      !processedData ||
      !processedData.recommendations ||
      !Array.isArray(processedData.recommendations.responses)
    ) {
      return 0
    }

    const responses = processedData.recommendations.responses

    try {
      if (type === "above")
        return responses.filter((r) => r.Score > r.StandardScore).length
      if (type === "meet")
        return responses.filter((r) => r.Score === r.StandardScore).length
      if (type === "below")
        return responses.filter((r) => r.Score < r.StandardScore).length
      return 0
    } catch (error) {
      console.error("Error calculating standards count:", error)
      return 0
    }
  }

  // Handle report generation states
  const handleGenerationStart = () => {
    setIsGeneratingReport(true)
    setIsReportComplete(false)
  }

  const handleGenerationComplete = () => {
    setIsGeneratingReport(false)
    setIsReportComplete(true)
  }

  return (
    <div className="flex min-h-screen bg-base-200" data-theme="corporate">
      {/* Top Navigation Bar */}
      <nav className="navbar bg-base-100 fixed top-0 z-50 shadow-md p-0 flex justify-between h-16">
        {/* Logo and Organization Name */}
        <div className="flex items-center gap-2 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="MakeStuffGo Logo"
              className="h-8 w-auto"
            />
            <span className="font-bold text-lg text-primary">
              {"MakeStuffGo"}
            </span>
          </Link>
        </div>

        {/* Profile Dropdown */}
        <div className="flex items-center gap-4 pr-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              {user?.clientName || selectedClient?.ClientName || "Guest User"}
            </p>
            <p className="text-xs text-gray-500">
              {getOrganizationName() || "Cloud Assessment Client"}
            </p>
          </div>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-white flex items-center justify-center">
                {user?.clientName?.charAt(0) ||
                  selectedClient?.ClientName?.charAt(0) ||
                  "G"}
              </div>
            </label>
            <ul
              tabIndex={0}
              className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <a>Profile</a>
              </li>
              <div className="divider my-0"></div>
              <li>
                <a href="/api/auth/logout">Sign Out</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex pt-16 min-h-screen bg-base-200 w-full">
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-indigo-500 text-white rounded-full p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l9-9 9 9M4 10v10h16V10"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Dashboard</h3>
            </div>

            {/* Generate Report Button */}
            {processedData && (
              <div>
                <ReportGenerator
                  clientData={processedData}
                  onGenerationStart={handleGenerationStart}
                  onGenerationComplete={handleGenerationComplete}
                  isGenerating={isGeneratingReport}
                  isComplete={isReportComplete}
                />
              </div>
            )}
          </div>

          {/* Client selector - Only shown for admin users */}
          {user && !user.clientId && clients.length > 0 && (
            <div className="mb-6">
              <select
                className="select select-bordered w-full max-w-xs"
                onChange={(e) => {
                  const selectedId = e.target.value
                  const client = clients.find(
                    (c) => c.ClientID.toString() === selectedId
                  )
                  setSelectedClient(client || null)
                }}
                value={selectedClient?.ClientID || ""}
              >
                <option value="" disabled>
                  Select a client
                </option>
                {clients.map((client) => (
                  <option key={client.ClientID} value={client.ClientID}>
                    {client.ClientName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-4">
                {error}
              </h2>
              {error.includes("complete the questionnaire") && (
                <Link href="/questionnaire" className="btn btn-primary">
                  Take Assessment Now
                </Link>
              )}
            </div>
          )}

          {!isLoading && processedData && (
            <>
              {/* Standards Status Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-lg shadow">
                  <h2 className="text-lg">Above Standard</h2>
                  <p className="text-4xl font-bold">
                    {countStandards("above")}
                  </p>
                  <p className="text-sm mt-2">
                    Number of metrics exceeding industry standards
                  </p>
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-lg shadow">
                  <h2 className="text-lg">Meets Standard</h2>
                  <p className="text-4xl font-bold">{countStandards("meet")}</p>
                  <p className="text-sm mt-2">
                    Number of metrics at industry standard
                  </p>
                </div>
                <div className="bg-gradient-to-r from-red-400 to-red-600 text-white p-6 rounded-lg shadow">
                  <h2 className="text-lg">Below Standard</h2>
                  <p className="text-4xl font-bold">
                    {countStandards("below")}
                  </p>
                  <p className="text-sm mt-2">
                    Number of metrics below industry standard
                  </p>
                </div>
              </div>

              {/* Maturity Score Section - Two Gauges Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Original SVG Gauge */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-bold text-gray-700 mb-4">
                    Cloud Maturity Level
                  </h2>
                  <div className="flex flex-col items-center">
                    <div className="relative w-48 h-48">
                      <svg viewBox="0 0 120 120" className="w-full h-full">
                        {/* Background circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="54"
                          fill="none"
                          stroke="#f3f4f6"
                          strokeWidth="12"
                        />

                        {/* Score circle - 5 is full circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="54"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray="339.3"
                          strokeDashoffset={
                            339.3 -
                            339.3 *
                              (processedData.cloudMaturityAssessment
                                .overallScore /
                                5)
                          }
                          transform="rotate(-90 60 60)"
                        />

                        {/* Score text */}
                        <text
                          x="60"
                          y="60"
                          textAnchor="middle"
                          dy=".3em"
                          fontSize="24"
                          fontWeight="bold"
                          fill="#1f2937"
                        >
                          {processedData.cloudMaturityAssessment.overallScore.toFixed(
                            1
                          )}
                        </text>
                      </svg>
                    </div>
                    <p className="text-center text-gray-600 mt-4 font-medium">
                      Current maturity level:{" "}
                      <span className="text-blue-600 font-bold">
                        {processedData.cloudMaturityAssessment.currentLevel}
                      </span>
                    </p>
                  </div>
                </div>

                {/* D3.js Gauge Meter */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-bold text-gray-700 mb-4">
                    Cloud Maturity Gauge
                  </h2>
                  <GaugeMeter
                    value={processedData.cloudMaturityAssessment.overallScore}
                  />
                </div>
              </div>

              {/* Enhanced Radar Chart */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">
                  Dimensional Analysis
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart
                    data={
                      processedData.cloudMaturityAssessment.dimensionalScores
                    }
                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                  >
                    <PolarGrid
                      gridType="polygon"
                      stroke="#ccc"
                      strokeDasharray="3 3"
                    />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{
                        fontSize: 12,
                        fontWeight: "bold",
                        fill: "#333",
                      }}
                      tickLine={false}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 5]}
                      tick={{ fontSize: 10, fill: "#666" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Client Score"
                      dataKey="score"
                      stroke="#6366F1"
                      strokeWidth={3}
                      fill="#6366F1"
                      fillOpacity={0.35}
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                    <Radar
                      name="Industry Standard"
                      dataKey="standardScore"
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="#10B981"
                      fillOpacity={0.25}
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload) return null
                        return (
                          <div className="bg-white p-3 rounded shadow text-sm text-gray-800">
                            <div className="font-bold mb-1">{label}</div>
                            <div>
                              Client Score: {payload[0]?.value?.toFixed(1)}
                            </div>
                            <div>
                              Standard Score: {payload[1]?.value?.toFixed(1)}
                            </div>
                          </div>
                        )
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "14px",
                        marginTop: "10px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Dimension Details */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">
                  Dimension Breakdown
                </h2>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Dimension</th>
                        <th>Score</th>
                        <th>Industry Standard</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.cloudMaturityAssessment.dimensionalScores.map(
                        (dimension, index) => (
                          <tr key={index}>
                            <td>{dimension.dimension}</td>
                            <td>{dimension.score.toFixed(1)}</td>
                            <td>
                              {dimension.standardScore
                                ? dimension.standardScore.toFixed(1)
                                : "N/A"}
                            </td>
                            <td>
                              {dimension.standardScore ? (
                                dimension.score > dimension.standardScore ? (
                                  <span className="badge badge-success">
                                    Above
                                  </span>
                                ) : dimension.score ===
                                  dimension.standardScore ? (
                                  <span className="badge badge-warning">
                                    Meeting
                                  </span>
                                ) : (
                                  <span className="badge badge-error">
                                    Below
                                  </span>
                                )
                              ) : (
                                <span className="badge badge-ghost">
                                  No Standard
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Category Scores Bar Chart */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">
                  Category Performance Analysis
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(
                      processedData.recommendations.categoryScores
                    ).map(([category, data]) => ({
                      category: category,
                      score: data.score,
                      standardScore: 3.5, // Using a default standard score for visualization
                    }))}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip
                      formatter={(value, name) => {
                        return [
                          `${value.toFixed(1)}/5.0`,
                          name === "score"
                            ? "Your Score"
                            : "Industry Benchmark",
                        ]
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="score"
                      name="Your Score"
                      fill="#4F46E5"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="standardScore"
                      name="Industry Benchmark"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  This chart compares your scores across different cloud
                  assessment categories with industry benchmarks.
                </p>
              </div>

              {/* Key Recommendations */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">
                  Key Recommendations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {processedData.recommendations.keyRecommendations
                    .slice(0, 4)
                    .map((recommendation, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          recommendation.priority === "Critical"
                            ? "bg-red-50 border-red-200"
                            : recommendation.priority === "High"
                            ? "bg-orange-50 border-orange-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <h3 className="font-medium text-gray-800">
                          {recommendation.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {recommendation.rationale}
                        </p>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            Impact: {recommendation.impact}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              recommendation.priority === "Critical"
                                ? "bg-red-100 text-red-800"
                                : recommendation.priority === "High"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {recommendation.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {!selectedClient && !isLoading && !user?.clientId && (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h2 className="text-xl font-semibold text-gray-700">
                Welcome to the Cloud Assessment Dashboard
              </h2>
              <p className="text-gray-600 mt-2">
                Please select a client to view assessment data.
              </p>
            </div>
          )}

          {!processedData &&
            !error &&
            !isLoading &&
            (user?.clientId || selectedClient) && (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <h2 className="text-xl font-semibold text-gray-700">
                  No assessment data found
                </h2>
                <p className="text-gray-600 mt-2">
                  Please complete the assessment questionnaire to see your cloud
                  maturity scores.
                </p>
                <Link href="/questionnaire" className="btn btn-primary mt-4">
                  Take Assessment Now
                </Link>
              </div>
            )}
        </main>
      </div>
    </div>
  )
}
