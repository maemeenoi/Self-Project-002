"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
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
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [aiInsights, setAiInsights] = useState([])
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [aiDataReady, setAiDataReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function processPendingAssessment() {
      try {
        // Check if we're coming from assessment with Google auth
        const source = searchParams.get("source")

        if (source === "assessment" && session?.user?.email) {
          console.log("Processing pending assessment after Google auth")

          // Retrieve stored assessment answers
          let pendingAnswers
          try {
            const storedData = sessionStorage.getItem(
              "pendingAssessmentAnswers"
            )
            if (!storedData) {
              console.error("No stored assessment data found")
              return
            }

            pendingAnswers = JSON.parse(storedData)
            console.log(`Retrieved ${pendingAnswers.length} stored answers`)
          } catch (parseError) {
            console.error(
              "Error retrieving stored assessment data:",
              parseError
            )
            return
          }

          // Submit the answers to the server
          console.log("Submitting assessment data to server...")
          const response = await fetch("/api/questionnaire/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              answers: pendingAnswers,
              email: session.user.email,
              authMethod: "google",
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error(
              "Error submitting assessment after Google auth:",
              errorData
            )
          } else {
            console.log("Assessment successfully submitted after Google auth")

            // Clear the stored answers
            sessionStorage.removeItem("pendingAssessmentAnswers")

            // Reload the page to show the assessment results (without the source parameter)
            router.replace("/dashboard")
          }
        }
      } catch (error) {
        console.error("Error processing pending assessment:", error)
      }
    }

    if (status === "authenticated") {
      processPendingAssessment()
    }
  }, [session, status, searchParams, router])

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/dashboard")
      console.log("Redirecting to login page")
    } else if (status === "authenticated" && session.user) {
      // Set user from session
      console.log("User authenticated:", session.user)
      setUser(session.user)

      // If user has a clientId, automatically select it
      if (session.user?.clientId) {
        setSelectedClient({
          ClientID: session.user.clientId,
          ClientName: session.user.clientName || "Unknown",
        })
      }
    }
  }, [status, session, router])

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

  // Fetch industry standards with debugging
  useEffect(() => {
    async function fetchIndustryStandards() {
      try {
        console.log("Fetching industry standards...")
        const response = await fetch("/api/industry-standards")

        if (!response.ok) {
          console.error(
            "Industry standards API returned error:",
            response.status,
            response.statusText
          )
          return
        }

        const data = await response.json()
        console.log(
          `Received ${data.length} industry standards:`,
          data.slice(0, 2)
        )
        setIndustryStandards(data)
      } catch (error) {
        console.error("Error fetching industry standards:", error)
      }
    }

    fetchIndustryStandards()
  }, [])

  // Fetch responses when a client is selected with enhanced debugging
  useEffect(() => {
    if (!selectedClient) {
      console.log("No client selected, skipping response fetch")
      return
    }

    if (industryStandards.length === 0) {
      console.log("No industry standards loaded yet, waiting...")
      return
    }

    async function fetchResponses() {
      setIsLoading(true)
      setError(null)
      setAiDataReady(false) // Reset AI data readiness flag

      try {
        console.log(
          `Fetching responses for client ID: ${selectedClient.ClientID}`
        )
        // Fetch responses with client info included
        const response = await fetch(
          `/api/responses/${selectedClient.ClientID}`
        )

        if (!response.ok) {
          const errorText = await response.text()
          console.error(
            "Responses API returned error:",
            response.status,
            errorText
          )
          setError(
            `Failed to load responses: ${response.status} ${response.statusText}`
          )
          setIsLoading(false)
          return
        }

        const data = await response.json()
        console.log("Responses API returned data:", {
          clientInfo: data.clientInfo,
          responsesCount: data.responses?.length || 0,
        })

        // Validation checks...

        // Prepare data for processing
        const responseData = data.responses

        // Attach client info directly to responses array
        responseData.ClientInfo = data.clientInfo

        console.log("Starting data processing...")

        // Process the base assessment data first
        const module = await import("../../lib/assessmentUtils")
        const baseProcessedData = module.default.processAssessmentData(
          responseData,
          industryStandards
        )

        if (!baseProcessedData) {
          setError("Failed to process assessment data")
          setIsLoading(false)
          return
        }

        // Set the base processed data first
        setProcessedData(baseProcessedData)
        setIsLoading(false)

        // Now fetch and integrate AI data separately
        console.log("Fetching AI analysis data...")
        setIsLoadingInsights(true)

        try {
          // Fetch AI analysis data
          const aiResponse = await fetch(
            `/api/consolidated-analysis/${selectedClient.ClientID}`
          )

          if (aiResponse.ok) {
            const aiData = await aiResponse.json()
            console.log("Successfully fetched AI data:", aiData)

            // Integrate AI data with base processed data
            const integratedData = await module.default.integrateAIAnalysis(
              selectedClient.ClientID,
              baseProcessedData
            )

            // Update processed data with AI-enhanced data
            if (integratedData) {
              console.log("Setting AI-enhanced data:", integratedData)
              setProcessedData(integratedData)

              // Set AI insights for component display
              setAiInsights(aiData)

              // Mark AI data as ready
              setAiDataReady(true)
            }
          } else {
            console.log(
              "AI data not available, will generate without AI insights"
            )
          }
        } catch (aiError) {
          console.error("Error fetching AI data:", aiError)
        } finally {
          setIsLoadingInsights(false)
        }
      } catch (error) {
        console.error("Error fetching or processing data:", error)
        setError("Error: " + error.message)
        setIsLoading(false)
      }
    }

    fetchResponses()
  }, [selectedClient, industryStandards])

  useEffect(() => {
    async function loadAIInsights() {
      if (processedData && selectedClient) {
        setIsLoadingInsights(true)
        try {
          const response = await fetch(
            `/api/consolidated-analysis/${selectedClient.ClientID}`
          )
          if (response.ok) {
            const data = await response.json()
            setAiInsights(data)
          }
        } catch (error) {
          console.error("Failed to load AI insights:", error)
        } finally {
          setIsLoadingInsights(false)
        }
      }
    }

    loadAIInsights()
  }, [processedData, selectedClient])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  // Count how many standards are above/below/meeting for FinOps
  const countFinOpsStandards = (type) => {
    if (!processedData?.finOpsPillars) {
      return 0
    }

    try {
      if (type === "above")
        return processedData.finOpsPillars.filter(
          (p) => p.maturityLevel === "High"
        ).length
      if (type === "meet")
        return processedData.finOpsPillars.filter(
          (p) => p.maturityLevel === "Medium"
        ).length
      if (type === "below")
        return processedData.finOpsPillars.filter(
          (p) => p.maturityLevel === "Low"
        ).length
      return 0
    } catch (error) {
      console.error("Error calculating FinOps standards count:", error)
      return 0
    }
  }

  // Handle report generation states
  const handleGenerationStart = () => {
    if (!aiDataReady && !isGeneratingReport) {
      // If AI data is still loading, show a confirmation dialog
      if (isLoadingInsights) {
        const proceed = window.confirm(
          "AI insights are still loading. Do you want to generate the report without AI insights, or wait for them to complete?"
        )

        if (!proceed) {
          // User chose to wait
          return
        }
      }
    }

    // Start generating the report with whatever data we have
    setIsGeneratingReport(true)
    setIsReportComplete(false)
  }

  const handleGenerationComplete = () => {
    setIsGeneratingReport(false)
    setIsReportComplete(true)
  }

  // Add a logout handler function
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Calculate progress percentages for FinOps
  const getFinOpsProgressPercentage = (type) => {
    const total =
      countFinOpsStandards("above") +
      countFinOpsStandards("meet") +
      countFinOpsStandards("below")
    if (total === 0) return 0
    return Math.round((countFinOpsStandards(type) / total) * 100)
  }

  // Helper function to get maturity color based on level
  const getMaturityColor = (level) => {
    switch (level) {
      case "High":
        return "#10b981" // Green
      case "Medium":
        return "#f59e0b" // Amber
      case "Low":
        return "#ef4444" // Red
      default:
        return "#6b7280" // Gray
    }
  }

  // Prepare radar chart data from FinOps pillars
  const getRadarData = () => {
    if (!processedData?.finOpsPillars) return []

    return processedData.finOpsPillars.map((pillar) => ({
      pillar: pillar.name,
      score: pillar.percentage,
      benchmark: 50, // 50% as baseline
      maxScore: 100,
    }))
  }

  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Fixed Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Site Title */}
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="font-bold text-xl text-blue-600"
              >
                MakeStuffGo
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              {session?.user && (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-700">
                    {session.user.name || session.user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 pt-16 w-full">
        <main className="flex-1 p-6 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="max-w-2xl lg:mx-0">
                <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                  FinOps Cloud Maturity Dashboard
                </h1>
                <p className="text-large text-gray-500">
                  {processedData?.reportMetadata?.reportDate ||
                    "Your FinOps assessment results"}
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

          {/* User Overview Card */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              Organization Overview
            </h2>

            <div className="flex flex-col md:flex-row">
              {/* Left side - Basic Info */}
              <div className="flex-1 pr-4">
                <div className="mb-4">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl border border-blue-200 mx-auto md:mx-0">
                    {processedData?.reportMetadata?.organizationName?.charAt(
                      0
                    ) ||
                      user?.organizationName?.charAt(0) ||
                      "O"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Contact Name
                    </h3>
                    <p className="font-semibold text-gray-800">
                      {processedData?.reportMetadata?.clientName ||
                        user?.clientName ||
                        "Unknown"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Organization
                    </h3>
                    <p className="font-semibold text-gray-800">
                      {processedData?.reportMetadata?.organizationName ||
                        "Unknown Organization"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="font-semibold text-gray-800">
                      {user?.email || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side - FinOps Info */}
              <div className="flex-1 pt-4 md:pt-0 md:pl-4 md:border-l border-gray-200">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Industry
                    </h3>
                    <p className="font-semibold text-gray-800">
                      {processedData?.reportMetadata?.industryType ||
                        "Not specified"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Company Size
                    </h3>
                    <p className="font-semibold text-gray-800">
                      {processedData?.reportMetadata?.clientSize ||
                        "Not specified"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Assessment Date
                    </h3>
                    <p className="font-semibold text-gray-800">
                      {processedData?.reportMetadata?.reportDate || "Today"}
                    </p>
                  </div>

                  {/* FinOps Maturity Score */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      FinOps Maturity Score
                    </h3>
                    <div className="flex items-center">
                      <span className="font-bold text-xl text-blue-600 mr-2">
                        {processedData?.overallFinOpsMaturity?.percentage ||
                          "N/A"}
                        %
                      </span>
                      <span className="text-sm text-gray-600">
                        ({processedData?.overallFinOpsMaturity?.level || "N/A"})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FinOps Maturity Badge */}
            <div className="mt-5 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Current FinOps Maturity Level
                  </h3>
                  <div className="flex items-center">
                    <div
                      className={`px-4 py-1 rounded-full font-medium text-sm ${
                        processedData?.overallFinOpsMaturity?.level?.includes(
                          "High"
                        )
                          ? "bg-green-100 text-green-800"
                          : processedData?.overallFinOpsMaturity?.level?.includes(
                              "Medium"
                            )
                          ? "bg-orange-100 text-orange-800"
                          : processedData?.overallFinOpsMaturity?.level?.includes(
                              "Low"
                            )
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {processedData?.overallFinOpsMaturity?.level ||
                        "Not Available"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Total Points
                  </h3>
                  <p className="font-bold text-xl text-blue-600">
                    {processedData?.overallFinOpsMaturity?.totalScore || 0}/
                    {processedData?.overallFinOpsMaturity?.maxScore || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights Section - Add this after the FinOps Pillars Detailed Cards section */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              AI-Powered Insights
            </h2>

            {isLoadingInsights ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : aiInsights && Object.keys(aiInsights).length > 0 ? (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Executive Summary
                  </h3>
                  <p className="text-gray-700">
                    {aiInsights.analysis?.executiveSummary}
                  </p>
                </div>

                {/* Strengths and Improvement Areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 className="font-semibold text-green-800 mb-2">
                      Key Strengths
                    </h3>
                    <ul className="space-y-2">
                      {aiInsights.analysis?.strengths?.map(
                        (strength, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Improvement Areas */}
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <h3 className="font-semibold text-amber-800 mb-2">
                      Improvement Areas
                    </h3>
                    <ul className="space-y-2">
                      {aiInsights.analysis?.improvementAreas?.map(
                        (area, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-amber-500 mr-2">•</span>
                            <span className="text-gray-700">{area}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                {/* Strategic Recommendations */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Strategic Recommendations
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {aiInsights.analysis?.recommendations?.map((rec, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
                      >
                        <h4 className="font-medium text-gray-800">
                          {rec.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {rec.description}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {rec.pillar || rec.timeline}
                          </span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                            {rec.priority || "Recommended"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Implementation Timeline */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Implementation Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["30day", "60day", "90day"].map((timeframe, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center mr-2">
                            {idx + 1}
                          </div>
                          <h4 className="font-medium text-sm text-gray-800">
                            {timeframe === "30day"
                              ? "First 30 Days"
                              : timeframe === "60day"
                              ? "31-60 Days"
                              : "61-90 Days"}
                          </h4>
                        </div>
                        <ul className="space-y-1">
                          {aiInsights.analysis?.timelineSteps?.[timeframe]?.map(
                            (step, i) => (
                              <li
                                key={i}
                                className="text-xs text-gray-600 flex items-start"
                              >
                                <span className="text-blue-500 mr-1">•</span>
                                {step}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <p className="mt-2">
                  AI insights are being generated. Check back soon.
                </p>
              </div>
            )}
          </div>

          {!isLoading && processedData && (
            <>
              {/* FinOps Standards Compliance Summary */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">
                  FinOps Pillar Maturity Summary
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* High Maturity (Above Standard) */}
                  <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">
                        High Maturity
                      </h3>
                      <span className="text-green-600 text-2xl font-bold">
                        {countFinOpsStandards("above")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{
                          width: `${getFinOpsProgressPercentage("above")}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      FinOps areas with advanced capabilities - potential cost
                      optimization leadership and best practices
                    </p>
                  </div>

                  {/* Medium Maturity */}
                  <div className="bg-white p-6 rounded-lg shadow border-t-4 border-orange-500">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">
                        Medium Maturity
                      </h3>
                      <span className="text-orange-600 text-2xl font-bold">
                        {countFinOpsStandards("meet")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div
                        className="bg-orange-500 h-2.5 rounded-full"
                        style={{
                          width: `${getFinOpsProgressPercentage("meet")}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      FinOps areas with solid foundation - ready for
                      optimization and advanced implementation
                    </p>
                  </div>

                  {/* Low Maturity (Below Standard) */}
                  <div className="bg-white p-6 rounded-lg shadow border-t-4 border-red-500">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">
                        Low Maturity
                      </h3>
                      <span className="text-red-600 text-2xl font-bold">
                        {countFinOpsStandards("below")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{
                          width: `${getFinOpsProgressPercentage("below")}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      FinOps areas requiring immediate attention - highest
                      potential for cost savings and operational improvements
                    </p>
                  </div>
                </div>

                <div className="flex mt-4 pt-2 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>{" "}
                    High: Advanced capabilities (70%+ maturity)
                  </div>
                  <div className="text-sm text-gray-500 mx-4">
                    <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1"></span>{" "}
                    Medium: Developing capabilities (30-70% maturity)
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>{" "}
                    Low: Initial/emerging capabilities (&lt;30% maturity)
                  </div>
                </div>
              </div>

              {/* FinOps Pillar Overview - Enhanced Radar Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* FinOps Maturity Gauge */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-bold text-gray-700 mb-4">
                    Overall FinOps Maturity
                  </h2>
                  <GaugeMeter
                    value={
                      processedData.overallFinOpsMaturity?.percentage / 20 || 0
                    }
                    maxValue={5}
                  />
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600">
                      FinOps maturity level:{" "}
                      <span className="text-blue-600 font-bold">
                        {processedData.overallFinOpsMaturity?.level ||
                          "Not Available"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Score:{" "}
                      {processedData.overallFinOpsMaturity?.percentage || 0}% (
                      {processedData.overallFinOpsMaturity?.totalScore || 0}/
                      {processedData.overallFinOpsMaturity?.maxScore || 0}{" "}
                      points)
                    </p>
                  </div>
                </div>

                {/* FinOps Pillars Radar Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-bold text-gray-700 mb-4">
                    FinOps Pillar Analysis
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={getRadarData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="pillar" />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tickCount={5}
                      />
                      <Radar
                        name="Your Score"
                        dataKey="score"
                        stroke="#6366F1"
                        strokeWidth={2}
                        fill="#6366F1"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Baseline (50%)"
                        dataKey="benchmark"
                        stroke="#10B981"
                        strokeWidth={2}
                        fill="#10B981"
                        fillOpacity={0.1}
                      />
                      <Tooltip
                        formatter={(value, name) => [`${value}%`, name]}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* FinOps Pillars Detailed Cards */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">
                  FinOps Pillar Deep Dive
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processedData.finOpsPillars?.map((pillar) => (
                    <div
                      key={pillar.id}
                      className="border rounded-lg p-4"
                      style={{
                        borderLeft: `4px solid ${getMaturityColor(
                          pillar.maturityLevel
                        )}`,
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {pillar.name}
                        </h3>
                        <div
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{
                            backgroundColor: getMaturityColor(
                              pillar.maturityLevel
                            ),
                          }}
                        >
                          {pillar.percentage}%
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            Maturity Level
                          </span>
                          <span className="text-xs font-medium">
                            {pillar.maturityLevel}
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${pillar.percentage}%`,
                              backgroundColor: getMaturityColor(
                                pillar.maturityLevel
                              ),
                            }}
                          ></div>
                        </div>

                        <p className="text-xs text-gray-600 mt-2">
                          {pillar.maturityDescription}
                        </p>

                        {pillar.recommendations.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-700">
                              Top Recommendation:
                            </p>
                            <p className="text-xs text-gray-600">
                              {pillar.recommendations[0].title}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FinOps Pillars Bar Chart Comparison */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">
                  FinOps Pillar Performance Comparison
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={processedData.finOpsPillars}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      domain={[0, 100]}
                      label={{
                        value: "Maturity %",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value}%`,
                        "Maturity Score",
                      ]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          const data = payload[0].payload
                          return `${label} (${data.maturityLevel})`
                        }
                        return label
                      }}
                    />
                    <Bar
                      dataKey="percentage"
                      fill="#6366F1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Implementation Roadmap */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">
                  FinOps Implementation Roadmap
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {processedData.recommendations?.implementationRoadmap?.map(
                    (phase, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center mr-3">
                            {index + 1}
                          </div>
                          <h3 className="font-semibold text-sm text-gray-800">
                            {phase.phase}
                          </h3>
                        </div>
                        <ul className="space-y-2">
                          {phase.actions.map((action, actionIndex) => (
                            <li
                              key={actionIndex}
                              className="text-xs text-gray-600 flex items-start"
                            >
                              <span className="text-blue-500 mr-1">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Detailed Recommendations */}
              {processedData.recommendations?.keyRecommendations?.length >
                0 && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                  <h2 className="text-lg font-bold text-gray-700 mb-4">
                    Key FinOps Recommendations
                  </h2>
                  <div className="space-y-4">
                    {processedData.recommendations.keyRecommendations.map(
                      (rec, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-1">
                                {rec.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {rec.rationale}
                              </p>
                              <p className="text-sm font-medium text-blue-600">
                                Impact: {rec.impact}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                rec.priority === "Critical"
                                  ? "bg-red-100 text-red-800"
                                  : rec.priority === "High"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {rec.priority}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Time to Value Analysis */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">
                  FinOps Value Realization Timeline
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={processedData.timeToValue?.current || []}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" unit=" weeks" />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip formatter={(value) => [`${value} weeks`, null]} />
                    <Legend />
                    <Bar dataKey="value" name="Current" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 mt-2">
                  Based on your FinOps maturity level, these are the estimated
                  timeframes for various value realization activities. Higher
                  maturity typically leads to faster value realization.
                </p>
              </div>

              {/* FinOps Assessment Details Table */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">
                  FinOps Pillar Details
                </h2>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>FinOps Pillar</th>
                        <th>Score</th>
                        <th>Max Score</th>
                        <th>Percentage</th>
                        <th>Maturity Level</th>
                        <th>Responses</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.finOpsPillars?.map((pillar, index) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <div className="font-medium">{pillar.name}</div>
                              <div className="text-sm text-gray-500">
                                {pillar.description}
                              </div>
                            </div>
                          </td>
                          <td className="font-medium">{pillar.score}</td>
                          <td>{pillar.maxScore}</td>
                          <td>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">
                                {pillar.percentage}%
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${pillar.percentage}%`,
                                    backgroundColor: getMaturityColor(
                                      pillar.maturityLevel
                                    ),
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                pillar.maturityLevel === "High"
                                  ? "bg-green-100 text-green-800"
                                  : pillar.maturityLevel === "Medium"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {pillar.maturityLevel}
                            </span>
                          </td>
                          <td>{pillar.responses}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!processedData &&
            !error &&
            !isLoading &&
            (user?.clientId || selectedClient) && (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <h2 className="text-xl font-semibold text-gray-700">
                  No FinOps assessment data found
                </h2>
                <p className="text-gray-600 mt-2">
                  Please complete the FinOps assessment questionnaire to see
                  your cloud financial management maturity scores.
                </p>
                <Link href="/questionnaire" className="btn btn-primary mt-4">
                  Take FinOps Assessment Now
                </Link>
              </div>
            )}
        </main>
      </div>
    </div>
  )
}
