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
import CloudMaturityVisualizer from "../../components/CloudMaturityVisualizer"
import CloudDimensionBars from "../../components/CloudDimensionBars"
import CloudPillarCards from "../../components/CloudPillarCards"
import CloudRadarDetailed from "../../components/CloudRadarDetailed"
import CloudMaturityPillars from "@/components/CloudMaturityPillars"
import AIInsights from "@/components/AIInsights"
import FlowDiagram from "@/components/Flowdiagram1"

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

        // Check if we have valid responses data structure
        if (!data.responses) {
          console.error("Invalid response format - missing responses array")
          setError("Invalid response data format")
          setIsLoading(false)
          return
        }

        // Check if we have responses
        if (data.responses.length === 0) {
          console.log("No responses found for this client")
          setError(
            "No assessment data found. Please complete the questionnaire first."
          )
          setIsLoading(false)
          return
        }

        // Check responses data structure
        const assessmentQuestions = data.responses.filter(
          (r) => r.QuestionID >= 6 && r.QuestionID <= 19
        )
        console.log(
          `Found ${assessmentQuestions.length} assessment responses (questions 6-19)`
        )

        if (assessmentQuestions.length === 0) {
          console.error("No assessment questions found in responses")
          setError(
            "No assessment data found. Please complete the assessment questions."
          )
          setIsLoading(false)
          return
        }

        // Prepare data for processing
        const responseData = data.responses

        // Attach client info directly to responses array
        responseData.ClientInfo = data.clientInfo

        // Log industry standards before processing
        console.log(
          `Using ${industryStandards.length} industry standards for comparison`
        )

        console.log("Starting data processing...")
        // Process the data
        const module = await import("../../lib/assessmentUtils")
        const processed = module.default.processAssessmentData(
          responseData,
          industryStandards
        )

        console.log("Data processing result:", processed ? "Success" : "Failed")

        if (!processed) {
          setError("Failed to process assessment data")
          setIsLoading(false)
          return
        }

        // Verify key processed data elements
        console.log("Verifying processed data structure")

        if (!processed.cloudMaturityAssessment) {
          console.error("Missing cloudMaturityAssessment in processed data")
        } else {
          console.log("Cloud maturity assessment data present")
        }

        if (!processed.recommendations) {
          console.error("Missing recommendations in processed data")
        } else {
          console.log("Recommendations data present")
        }

        setProcessedData(processed)
      } catch (error) {
        console.error("Error fetching or processing data:", error)
        setError("Error: " + error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResponses()
  }, [selectedClient, industryStandards])

  if (status === "loading") {
    return <div>Loading...</div>
  }

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

  // Add a logout handler function
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Calculate progress percentages
  const getProgressPercentage = (type) => {
    const total =
      countStandards("above") + countStandards("meet") + countStandards("below")
    if (total === 0) return 0
    return Math.round((countStandards(type) / total) * 100)
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
              User Overview
            </h2>

            <div className="flex flex-col md:flex-row">
              {/* Left side - Basic Info */}
              <div className="flex-1 pr-4">
                <div className="mb-4">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl border border-blue-200 mx-auto md:mx-0">
                    {processedData?.reportMetadata?.clientName?.charAt(0) ||
                      user?.clientName?.charAt(0) ||
                      "U"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
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

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Overall Score
                    </h3>
                    <div className="flex items-center">
                      <span className="font-bold text-xl text-blue-600 mr-2">
                        {processedData?.cloudMaturityAssessment?.overallScore?.toFixed(
                          1
                        ) || "N/A"}
                      </span>
                      <span className="text-sm text-gray-600">/ 5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FinOps Maturity Information 
            <div className="mt-5 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    FinOps Maturity Level
                  </h3>
                  <div className="flex items-center">
                    <div
                      className={`px-4 py-1 rounded-full font-medium text-sm ${
                        processedData?.cloudMaturityAssessment?.currentLevel
                          ?.category === "Initial/Emerging"
                          ? "bg-red-100 text-red-800"
                          : processedData?.cloudMaturityAssessment
                              ?.finOpsCategory?.category === "Developing"
                          ? "bg-orange-100 text-orange-800"
                          : processedData?.cloudMaturityAssessment
                              ?.finOpsCategory?.category ===
                            "Advanced/Optimizing"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {processedData?.cloudMaturityAssessment?.finOpsCategory
                        ?.category || "Not Available"}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    FinOps Maturity Percentage
                  </h3>
                  <div className="flex items-center">
                    <span className="font-bold text-xl text-green-600 mr-2">
                      {processedData?.cloudMaturityAssessment
                        ?.overallPercentage || "N/A"}
                      %
                    </span>
                    <span className="text-sm text-gray-600">
                      (
                      {processedData?.cloudMaturityAssessment?.finOpsCategory
                        ?.approach || "Assessment pending"}
                      )
                    </span>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {!isLoading && processedData && (
            <>
              {/* Add AI Insights right after User Overview */}
              {/* <AIInsights processedData={processedData} /> */}
              {/* Standards Compliance Summary - Three separate themed cards */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4">
                  FinOps Standards Compliance Summary
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Above Standard Card */}
                  <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">
                        Above Standard
                      </h3>
                      <span className="text-green-600 text-2xl font-bold">
                        {countStandards("above")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{ width: `${getProgressPercentage("above")}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      FinOps areas where your organization exceeds industry
                      benchmarks - indicating potential cost optimization
                      leadership
                    </p>
                  </div>

                  {/* Meets Standard Card */}
                  <div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">
                        Meets Standard
                      </h3>
                      <span className="text-yellow-600 text-2xl font-bold">
                        {countStandards("meet")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div
                        className="bg-yellow-500 h-2.5 rounded-full"
                        style={{ width: `${getProgressPercentage("meet")}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      FinOps areas aligned with current industry standards -
                      good baseline for further optimization
                    </p>
                  </div>

                  {/* Below Standard Card */}
                  <div className="bg-white p-6 rounded-lg shadow border-t-4 border-red-500">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">
                        Below Standard
                      </h3>
                      <span className="text-red-600 text-2xl font-bold">
                        {countStandards("below")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{ width: `${getProgressPercentage("below")}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      FinOps areas that need attention - highest potential for
                      cost savings and financial optimization
                    </p>
                  </div>
                </div>

                {processedData?.finOpsEnhanced && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <strong>FinOps Enhanced:</strong> This assessment has been
                      enhanced with AI-powered FinOps insights focusing on cost
                      optimization and financial governance opportunities.
                    </p>
                  </div>
                )}

                <div className="flex mt-4 pt-2 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>{" "}
                    Above: Exceeding industry benchmarks (potential cost
                    leadership)
                  </div>
                  <div className="text-sm text-gray-500 mx-4">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>{" "}
                    Meets: At industry standard (optimization opportunities
                    exist)
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>{" "}
                    Below: Improvement needed (highest savings potential)
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
                {/* Radar Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <CloudMaturityPillars data={processedData} />
                </div>
              </div>

              {/*  Charts */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <CloudRadarDetailed data={processedData} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <CloudDimensionBars data={processedData} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <CloudPillarCards data={processedData} maxCards={6} />
              </div>

              {/* Flow Diagram */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <FlowDiagram />
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

          {/*Cloud Maturity Assessment*/}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              Cloud Maturity Assessment
            </h2>
            {processedData && <CloudMaturityVisualizer data={processedData} />}
          </div>

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
