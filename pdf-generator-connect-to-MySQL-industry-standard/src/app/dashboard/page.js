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
  AreaChart,
  Area,
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
        // Fetch responses with client info included
        const response = await fetch(
          `/api/responses/${selectedClient.ClientID}`
        )
        const data = await response.json()
        console.log("API response:", data)

        // Check if we have responses
        if (data.responses && data.responses.length > 0) {
          // Prepare data for processing
          const responseData = data.responses

          // Attach client info directly to responses array
          responseData.ClientInfo = data.clientInfo

          // Process the data
          const module = await import("../../lib/assessmentUtils")
          const processed = module.default.processAssessmentData(
            responseData,
            industryStandards
          )

          console.log("Processed data:", processed)
          setProcessedData(processed)
        } else {
          // No responses found
          setError(
            "No assessment data found. Please complete the questionnaire first."
          )
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load responses: " + error.message)
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

  // Calculate progress percentages
  const getProgressPercentage = (type) => {
    const total =
      countStandards("above") + countStandards("meet") + countStandards("below")
    if (total === 0) return 0
    return Math.round((countStandards(type) / total) * 100)
  }

  // Prepare time-to-value data based on assessment
  const getTimeToValueData = () => {
    if (!processedData) return []

    // Create a simulated data based on maturity score
    const score = processedData.cloudMaturityAssessment.overallScore || 3

    // Lower score = longer time to value, higher score = shorter time
    return [
      {
        name: "Initial Implementation",
        current: 5 - Math.min(4, score),
        optimized: 1,
      },
      { name: "Time to Market", current: 6 - Math.min(5, score), optimized: 2 },
      {
        name: "Deployment Frequency",
        current: 4 - Math.min(3, score),
        optimized: 1,
      },
      {
        name: "Change Failure Rate",
        current: 5 - Math.min(4, score),
        optimized: 1.5,
      },
    ]
  }

  // Calculate costs saved with implementation of recommendations
  const calculatePotentialSavings = () => {
    if (!processedData) return { current: 1000, optimized: 700 }

    // Base the savings percentage on maturity level
    const score = processedData.cloudMaturityAssessment.overallScore || 3
    const savingsPercentage = 0.4 - score * 0.05 // 20-40% savings depending on maturity

    return {
      current: 1000, // Placeholder for current cloud spend
      optimized: Math.round(1000 * (1 - savingsPercentage)),
    }
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
              {processedData?.reportMetadata?.clientName ||
                user?.clientName ||
                selectedClient?.ContactName ||
                "User"}
            </p>
            <p className="text-xs text-gray-500">
              {processedData?.reportMetadata?.organizationName ||
                selectedClient?.ClientName ||
                "Organization"}
            </p>
          </div>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-white flex items-center justify-center">
                {(
                  processedData?.reportMetadata?.clientName ||
                  user?.clientName ||
                  selectedClient?.ContactName ||
                  "U"
                ).charAt(0)}
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
              <div className="mx-auto max-w-2xl lg:mx-0">
                <h1 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                  Cloud Maturity Dashboard
                </h1>
                <p className="text-large text-gray-500">
                  {processedData?.reportMetadata?.reportDate ||
                    "Your cloud assessment results"}
                </p>
              </div>
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
          {/* {user && !user.clientId && clients.length > 0 && (
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
          )} */}

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
              {/* Improved Status Summary - Single card with progress bars */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">
                  Standards Compliance Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Above Standard</span>
                      <span className="text-green-600 font-bold">
                        {countStandards("above")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{ width: `${getProgressPercentage("above")}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Meets Standard</span>
                      <span className="text-yellow-600 font-bold">
                        {countStandards("meet")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-yellow-500 h-2.5 rounded-full"
                        style={{ width: `${getProgressPercentage("meet")}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Below Standard</span>
                      <span className="text-red-600 font-bold">
                        {countStandards("below")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{ width: `${getProgressPercentage("below")}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex mt-4 pt-2 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>{" "}
                    Above: Exceeding industry benchmarks
                  </div>
                  <div className="text-sm text-gray-500 mx-4">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>{" "}
                    Meets: At industry standard
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>{" "}
                    Below: Improvement needed
                  </div>
                </div>
              </div>

              {/* Maturity Score Section - Two Gauges Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Gauge Meter */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-bold text-gray-700 mb-4">
                    Cloud Maturity Gauge
                  </h2>
                  <GaugeMeter
                    value={processedData.cloudMaturityAssessment.overallScore}
                  />
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600">
                      Current maturity level:{" "}
                      <span className="text-blue-600 font-bold">
                        {processedData.cloudMaturityAssessment.currentLevel}
                      </span>
                    </p>
                  </div>
                </div>

                {/* New Time-to-Value Graph */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-bold text-gray-700 mb-4">
                    Time-to-Value Analysis
                  </h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={getTimeToValueData()}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" unit=" weeks" />
                      <YAxis type="category" dataKey="name" width={130} />
                      <Tooltip
                        formatter={(value) => [`${value} weeks`, null]}
                      />
                      <Legend />
                      <Bar dataKey="current" name="Current" fill="#4F46E5" />
                      <Bar
                        dataKey="optimized"
                        name="Optimized"
                        fill="#10B981"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    Comparison of current vs. optimized time-to-value metrics
                    based on assessment
                  </div>
                </div>
              </div>

              {/* Enhanced Radar Chart */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">
                  Cloud Dimensional Analysis
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

              {/* Added: Cost Optimization Potential */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Cost Optimization Potential */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-bold text-gray-700 mb-4">
                    Cost Optimization Potential
                  </h2>
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-md">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={[calculatePotentialSavings()]}
                          margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" hide={true} />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value) => [`$${value}`, null]} />
                          <Legend verticalAlign="top" />
                          <Bar
                            dataKey="current"
                            name="Current Spend"
                            fill="#FF8A65"
                          />
                          <Bar
                            dataKey="optimized"
                            name="Optimized Spend"
                            fill="#4DB6AC"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-4">
                      <div className="text-3xl font-bold text-green-600">
                        $
                        {calculatePotentialSavings().current -
                          calculatePotentialSavings().optimized}
                      </div>
                      <div className="text-sm text-gray-500">
                        Potential monthly savings
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Scores Bar Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-bold text-gray-700 mb-4">
                    Category Performance
                  </h2>
                  <ResponsiveContainer width="100%" height={200}>
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
                </div>
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
