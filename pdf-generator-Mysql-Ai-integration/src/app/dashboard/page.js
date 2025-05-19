"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import ReportGenerator from "../../components/report/ReportGenerator"
import GaugeMeter from "../../components/dashboard/finops/GaugeMeter"
import AIInsightsComponent from "@/components/dashboard/AIInsightsComponent"
import FinOpsPillarSummary from "@/components/dashboard/finops/FinOpsPillarSummary"
import FinOpsPillarRadarChart from "@/components/dashboard/finops/FinOpsPillarRadarChart"
import FinOpsPillarDetailCards from "@/components/dashboard/finops/FinOpsPillarDetailCards"
import FinOpsPillarBarChart from "@/components/dashboard/finops/FinOpsPillarBarChart"
import FinOpsKeyRecommendations from "@/components/dashboard/finops/FinOpsKeyRecommendations"
import FinOpsImplementationRoadmap from "@/components/dashboard/finops/FinOpsImplementationRoadmap"
import FinOpsPillarDetailsTable from "@/components/dashboard/finops/FinOpsPillarDetailsTable"
import OrganizationOverviewCard from "@/components/dashboard/OrganizationOverviewCard"

// Report Components Example
import ReportCoverPage from "@/components/report/ReportCoverPage"
import ReportExecutiveSummary from "@/components/report/ReportExecutiveSummary"
import ReportMaturityAssessment from "@/components/report/ReportMaturityAssessment"
import ReportRecommendations from "@/components/report/ReportRecommendations"
import ReportDetailedResults from "@/components/report/ReportDetailedResults"
import ReportCategoryBreakdown from "@/components/report/ReportCategoryBreakdown"
import ReportEndPage from "@/components/report/ReportEndPage"

export default function Dashboard() {
  const [clients, setClient] = useState([])
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
  const [aiError, setAiError] = useState(null)

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
    async function fetchClient() {
      if (user && !user.clientId) {
        try {
          const response = await fetch("/api/clients")
          const data = await response.json()
          setClient(data)
        } catch (error) {
          setError("Failed to load clients.")
        }
      }
    }

    if (user) {
      fetchClient()
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

        // Prepare data for processing
        const responseData = data.responses
        responseData.ClientInfo = data.clientInfo

        // Process base assessment data
        const module = await import("../../lib/assessmentUtils")
        const baseData = module.default.processAssessmentData(
          responseData,
          industryStandards
        )

        if (!baseData) {
          setError("Failed to process assessment data")
          setIsLoading(false)
          return
        }

        // Set base data first so UI shows something quickly
        setProcessedData(baseData)
        setIsLoading(false)

        // Now fetch AI analysis
        await fetchAndIntegrateAIAnalysis(selectedClient.ClientID, baseData)
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

  const fetchAndIntegrateAIAnalysis = async (clientId, baseData) => {
    if (!clientId || !baseData) return

    setIsLoadingInsights(true)
    setAiError(null)

    try {
      // Try to fetch existing AI analysis
      console.log(`Fetching AI analysis for client ${clientId}`)
      let analysisData

      try {
        const response = await fetch(`/api/consolidated-analysis/${clientId}`)

        if (response.ok) {
          analysisData = await response.json()
          console.log("Successfully fetched existing AI analysis")
        } else if (response.status === 404) {
          console.log("No existing analysis found, will generate new one")

          // Generate new analysis
          const genResponse = await fetch(
            `/api/consolidated-analysis/${clientId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ assessmentData: baseData }),
            }
          )

          if (genResponse.ok) {
            analysisData = await genResponse.json()
            console.log("Successfully generated new AI analysis")
          } else {
            console.error(
              "Failed to generate analysis:",
              await genResponse.text()
            )
            throw new Error("Failed to generate AI analysis")
          }
        } else {
          console.error(
            "Error fetching analysis:",
            response.status,
            await response.text()
          )
          throw new Error(`API returned status ${response.status}`)
        }
      } catch (fetchError) {
        console.error("Error during API interaction:", fetchError)
        setAiError("Failed to fetch or generate AI analysis")
        throw fetchError
      }

      if (analysisData) {
        // Integrate the AI analysis with the base data
        const module = await import("../../lib/assessmentUtils")
        const integratedData = await module.default.integrateAIAnalysis(
          clientId,
          baseData
        )

        if (integratedData) {
          console.log("Setting integrated data with AI analysis")
          setProcessedData(integratedData)
        }
      }
    } catch (error) {
      console.error("AI analysis integration error:", error)
      setAiError(error.message)
    } finally {
      setIsLoadingInsights(false)
    }
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
          <OrganizationOverviewCard
            organizationData={processedData}
            userData={user}
          />

          {/* AI Insights Component */}
          {!isLoading && processedData && (
            <AIInsightsComponent
              insights={aiInsights}
              isLoading={isLoadingInsights}
              clientId={selectedClient?.ClientID}
              clientName={selectedClient?.ClientName}
              onInsightsReady={() => setAiDataReady(true)}
            />
          )}

          {!isLoading && processedData && (
            <>
              {/* FinOps Standards Compliance Summary */}
              <FinOpsPillarSummary
                countFinOpsStandards={countFinOpsStandards}
                getFinOpsProgressPercentage={getFinOpsProgressPercentage}
              />

              {/* FinOps Pillar Overview*/}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* FinOps Maturity Gauge */}
                <GaugeMeter
                  value={
                    processedData.overallFinOpsMaturity?.percentage / 10 || 0
                  }
                  maxValue={10}
                  maturityLevel={
                    processedData.overallFinOpsMaturity?.level ||
                    "Not Available"
                  }
                  percentage={
                    processedData.overallFinOpsMaturity?.percentage || 0
                  }
                  totalScore={
                    processedData.overallFinOpsMaturity?.totalScore || 0
                  }
                  maxScore={processedData.overallFinOpsMaturity?.maxScore || 0}
                />

                {/* FinOps Pillars Radar Chart */}
                <FinOpsPillarRadarChart data={getRadarData()} />
              </div>

              {/* FinOps Pillars Detailed Cards */}
              <FinOpsPillarDetailCards
                pillars={processedData.finOpsPillars}
                getMaturityColor={getMaturityColor}
              />

              {/* FinOps Pillars Bar Chart Comparison */}
              <FinOpsPillarBarChart data={processedData.finOpsPillars} />

              {/* Implementation Roadmap */}
              <FinOpsImplementationRoadmap
                roadmap={
                  processedData.recommendations?.implementationRoadmap || []
                }
              />

              {/* Detailed Recommendations */}
              <FinOpsKeyRecommendations
                recommendations={
                  processedData.recommendations?.keyRecommendations || []
                }
              />

              {/* FinOps Assessment Details Table */}
              <FinOpsPillarDetailsTable
                pillars={processedData.finOpsPillars}
                getMaturityColor={getMaturityColor}
              />

              {/* Report Example */}
              <ReportCoverPage clientData={processedData} />
              <ReportExecutiveSummary clientData={processedData} />
              <ReportMaturityAssessment clientData={processedData} />
              <ReportRecommendations clientData={processedData} />
              <ReportDetailedResults clientData={processedData} />
              {/* <ReportCategoryBreakdown clientData={processedData} /> */}
              <ReportEndPage clientData={processedData} />
            </>
          )}

          {!processedData &&
            error &&
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
                <p className="text-gray-500 mt-2">
                  Or reload the page
                  <button
                    className="btn btn-secondary ml-2"
                    onClick={() => router.reload()}
                  >
                    Reload
                  </button>
                </p>
              </div>
            )}
        </main>
      </div>
    </div>
  )
}
