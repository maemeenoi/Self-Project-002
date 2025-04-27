// src/app/dashboard/page.js
"use client"

import { useState, useEffect } from "react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import ReportGenerator from "../../components/report/ReportGenerator"
import MVPMaturityTable from "../../components/report/MVPMaturityTable"
import AssessmentSummary from "../../components/report/AssessmentSummary"

export default function Dashboard() {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientResponses, setClientResponses] = useState([])
  const [industryStandards, setIndustryStandards] = useState([])
  const [processedData, setProcessedData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch clients on component mount
  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch("/api/clients")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        console.log("Debugging response:", response)
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error("Error fetching clients:", error)
        setError("Failed to load clients. Please try again later.")
      }
    }

    fetchClients()
  }, [])

  // Fetch client responses when a client is selected
  useEffect(() => {
    if (!selectedClient) return
    // Only process data if industry standards are available
    if (industryStandards.length === 0) return

    async function fetchResponses() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/responses/${selectedClient.ClientID}`
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setClientResponses(data)

        // Process the responses into report data
        if (data && data.length > 0) {
          // Import directly to ensure it's available
          import("../../lib/assessmentUtils")
            .then((module) => {
              const processed = module.default.processAssessmentData(
                data,
                industryStandards
              )
              setProcessedData(processed)
            })
            .catch((err) => {
              console.error("Error importing assessment utils:", err)
              setError("Error processing assessment data")
            })
        } else {
          setError("No assessment data available for this client")
        }
      } catch (error) {
        console.error("Error fetching responses:", error)
        setError(`Failed to load assessment data: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResponses()
  }, [selectedClient, industryStandards]) // Add industryStandards as a dependency

  // Fetch industry standards on component mount
  useEffect(() => {
    async function fetchIndustryStandards() {
      try {
        const response = await fetch("/api/industry-standards")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Industry Standards Data:", data)
        setIndustryStandards(data)
      } catch (error) {
        console.error("Error fetching industry standards:", error)
      }
    }

    fetchIndustryStandards()
  }, [])
  return (
    <div className="container mx-auto p-4">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg mb-6">
        <h1 className="text-3xl font-bold">Cloud Assessment Dashboard</h1>
        <p className="mt-1 text-blue-100">
          MakeStuffGo - Ensuring every dollar you spend on the cloud is working
          as hard as you
        </p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3">
          <h2 className="text-xl font-semibold mb-2">Select Client</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clients.length > 0 ? (
              clients.map((client) => (
                <div
                  key={client.ClientID}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 
                  ${
                    selectedClient?.ClientID === client.ClientID
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedClient(client)}
                >
                  <h3 className="font-medium">{client.ClientName}</h3>
                  <p className="text-sm text-gray-600">{client.ContactEmail}</p>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-gray-500">
                No clients found. Please check your database connection.
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          <div className="flex flex-col gap-3">
            {processedData && (
              <ReportGenerator
                clientData={processedData}
                onGenerationStart={() => {}}
                onGenerationComplete={() => {}}
                isGenerating={false}
                isComplete={false}
              />
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading assessment data...</span>
        </div>
      )}

      {!isLoading && processedData && (
        <div className="bg-white shadow rounded-lg">
          <div className="bg-blue-800 text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  Assessment Report:{" "}
                  {processedData.reportMetadata.organizationName}
                </h2>
                <p className="text-blue-200">
                  Generated on {processedData.reportMetadata.reportDate}
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg">Overall Maturity Score</p>
                <div className="text-4xl font-bold">
                  {processedData.cloudMaturityAssessment.overallScore}/5.0
                </div>
                <p className="text-sm text-blue-200">
                  {processedData.cloudMaturityAssessment.currentLevel}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("maturity")}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === "maturity"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Maturity Assessment
              </button>
              <button
                onClick={() => setActiveTab("recommendations")}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === "recommendations"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Recommendations
              </button>
              <button
                onClick={() => setActiveTab("responsesSummary")}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === "responsesSummary"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Responses Summary
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Client Info Section */}
                <div className="bg-blue-50 p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">
                    Client Information
                  </h2>
                  <p>
                    <span className="font-semibold">Organization:</span>{" "}
                    {processedData.reportMetadata.organizationName}
                  </p>
                  <p>
                    <span className="font-semibold">Industry:</span>{" "}
                    {processedData.reportMetadata.clientIndustry}
                  </p>
                  <p>
                    <span className="font-semibold">Organization Size:</span>{" "}
                    {processedData.reportMetadata.clientSize}
                  </p>
                  <p>
                    <span className="font-semibold">Contact Email:</span>{" "}
                    {processedData.reportMetadata.clientEmail}
                  </p>
                </div>

                {/* Maturity Snapshot Section */}
                <div className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-700 mb-2">
                      Cloud Maturity Snapshot
                    </h2>
                    <p className="text-lg">
                      Overall Maturity Score:{" "}
                      <span className="font-bold">
                        {processedData.cloudMaturityAssessment.overallScore}/5.0
                      </span>
                    </p>
                    <p className="text-gray-700">
                      Maturity Level:{" "}
                      {processedData.cloudMaturityAssessment.currentLevel}
                    </p>
                  </div>
                </div>

                {/* Industry Standards Match Section */}
                {processedData.responses && (
                  <div className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row justify-around">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">
                        Above Standard
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        {
                          processedData.responses.filter(
                            (r) =>
                              r.Score !== null &&
                              r.StandardScore !== null &&
                              r.Score > r.StandardScore
                          ).length
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">
                        Meets Standard
                      </h3>
                      <p className="text-2xl font-bold text-yellow-600">
                        {
                          processedData.responses.filter(
                            (r) =>
                              r.Score !== null &&
                              r.StandardScore !== null &&
                              r.Score === r.StandardScore
                          ).length
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">
                        Below Standard
                      </h3>
                      <p className="text-2xl font-bold text-red-600">
                        {
                          processedData.responses.filter(
                            (r) =>
                              r.Score !== null &&
                              r.StandardScore !== null &&
                              r.Score < r.StandardScore
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Purpose and Methodology Section */}
                <div className="bg-white p-6 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">
                      Purpose
                    </h3>
                    <p>
                      To assess and recommend improvements for cloud practices
                      and maturity.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">
                      Methodology
                    </h3>
                    <p>
                      Assessment responses analyzed against industry standards
                      to identify gaps and opportunities.
                    </p>
                  </div>
                </div>

                {/* Key Focus Areas Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">
                    Key Focus Areas
                  </h2>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Cloud Cost Optimization</li>
                    <li>Infrastructure as Code (IaC) Practices</li>
                    <li>Automation and DevOps Improvements</li>
                    <li>Governance and Operational Excellence</li>
                  </ul>
                </div>

                {/* Summary of Findings Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">
                    Summary of Findings
                  </h2>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    {processedData.executiveSummary.subtopics
                      .find((topic) => topic.title === "Summary of Findings")
                      ?.content.map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Maturity Assessment Tab */}
            {activeTab === "maturity" && (
              <div className="space-y-8">
                {/* Understanding Cloud Maturity Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">
                    Understanding Cloud Maturity
                  </h2>
                  <p className="text-gray-700">
                    {processedData.cloudMaturityAssessment.subtopics.find(
                      (topic) => topic.title === "Understanding Cloud Maturity"
                    )?.content ||
                      "Cloud maturity measures the effectiveness and optimization of cloud adoption and practices."}
                  </p>
                </div>

                {/* Current Cloud Maturity Level Section */}
                <div className="bg-blue-50 p-6 rounded-lg shadow flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-blue-700 mb-2">
                      Current Cloud Maturity Level
                    </h2>
                    <p className="text-gray-700">
                      {processedData.cloudMaturityAssessment.subtopics.find(
                        (topic) =>
                          topic.title === "Current Cloud Maturity Level"
                      )?.content ||
                        "Your organization's current maturity level description."}
                    </p>
                  </div>
                  <div className="text-center mt-6 md:mt-0">
                    <div className="text-5xl font-bold text-blue-600">
                      {processedData.cloudMaturityAssessment.overallScore}/5.0
                    </div>
                    <p className="text-gray-600 mt-1">
                      {processedData.cloudMaturityAssessment.currentLevel}
                    </p>
                  </div>
                </div>

                {/* Dimensional Analysis - Radar Chart Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">
                    Dimensional Analysis
                  </h2>
                  <div style={{ width: "100%", height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        data={
                          processedData.cloudMaturityAssessment
                            .dimensionalScores
                        }
                      >
                        <PolarGrid stroke="#ccc" />
                        <PolarAngleAxis
                          dataKey="dimension"
                          stroke="#333"
                          tick={{ fill: "#555", fontSize: 12 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                        <Radar
                          name="Maturity Score"
                          dataKey="score"
                          stroke="#3182ce"
                          fill="#63b3ed"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Growth Trajectory & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold text-blue-700 mb-4">
                      Short-Term Focus Areas
                    </h3>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                      {processedData.cloudMaturityAssessment.subtopics
                        .find(
                          (topic) =>
                            topic.title ===
                            "Growth Trajectory & Recommendations"
                        )
                        ?.shortTermFocus.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                    </ul>
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold text-indigo-700 mb-4">
                      Long-Term Strategic Objectives
                    </h3>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                      {processedData.cloudMaturityAssessment.subtopics
                        .find(
                          (topic) =>
                            topic.title ===
                            "Growth Trajectory & Recommendations"
                        )
                        ?.longTermObjectives.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                    </ul>
                  </div>
                </div>

                {/* Continuous Delivery Maturity Assessment Table */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <MVPMaturityTable
                    maturityData={processedData.cloudMaturityAssessment}
                  />
                </div>
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === "recommendations" && (
              <div className="space-y-8">
                {/* Key Recommendations Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">
                    Key Recommendations
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {processedData.recommendations.keyRecommendations.map(
                      (rec, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {rec.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium
                ${
                  rec.priority === "Critical"
                    ? "bg-red-100 text-red-700"
                    : rec.priority === "High"
                    ? "bg-orange-100 text-orange-700"
                    : rec.priority === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                }
              `}
                            >
                              {rec.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {rec.rationale}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            <strong>Impact:</strong> {rec.impact}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Implementation Priority Matrix Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">
                    Implementation Priority Matrix
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {["Critical", "High", "Medium", "Standard"].map(
                      (priority) => (
                        <div
                          key={priority}
                          className="bg-gray-50 p-4 rounded-lg border"
                        >
                          <h3
                            className={`font-bold mb-2 text-sm ${
                              priority === "Critical"
                                ? "text-red-600"
                                : priority === "High"
                                ? "text-orange-600"
                                : priority === "Medium"
                                ? "text-yellow-600"
                                : "text-blue-600"
                            }`}
                          >
                            {priority} Priority
                          </h3>
                          <ul className="list-disc pl-4 text-xs space-y-1">
                            {processedData.recommendations.keyRecommendations
                              .filter((rec) => rec.priority === priority)
                              .map((rec, index) => (
                                <li key={index} className="text-gray-700">
                                  {rec.title}
                                </li>
                              ))}
                            {processedData.recommendations.keyRecommendations.filter(
                              (rec) => rec.priority === priority
                            ).length === 0 && (
                              <li className="text-gray-400 italic">
                                No actions
                              </li>
                            )}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Implementation Roadmap Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">
                    Implementation Roadmap
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {processedData.recommendations.implementationRoadmap.map(
                      (phase, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 p-4 rounded-lg border shadow-sm"
                        >
                          <h3 className="text-md font-bold text-blue-700 mb-2">
                            {phase.phase}
                          </h3>
                          <ul className="list-disc pl-4 text-sm space-y-1">
                            {phase.actions.map((action, i) => (
                              <li key={i} className="text-gray-700">
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Next Steps Section */}
                <div className="bg-indigo-50 p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-bold text-indigo-700 mb-4">
                    Next Steps
                  </h2>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    {processedData.recommendations.nextSteps.map(
                      (step, index) => (
                        <li key={index}>{step}</li>
                      )
                    )}
                  </ul>
                  <div className="mt-6 text-center">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg">
                      Schedule Planning Session
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Responses Summary Tab */}
            {activeTab === "responsesSummary" && (
              <div>
                <AssessmentSummary
                  responses={processedData.recommendations.responses}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
