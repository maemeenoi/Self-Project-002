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

export default function Dashboard() {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientResponses, setClientResponses] = useState([])
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
              const processed = module.default.processAssessmentData(data)
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
  }, [selectedClient])

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
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-600 mb-2">
                      Client Info
                    </h3>
                    <p>
                      <span className="font-medium">Organization:</span>{" "}
                      {processedData.reportMetadata.organizationName}
                    </p>
                    <p>
                      <span className="font-medium">Report Period:</span>{" "}
                      {processedData.reportMetadata.reportPeriod}
                    </p>
                    <p>
                      <span className="font-medium">Organization Size:</span>{" "}
                      {processedData.reportMetadata.clientSize}
                    </p>
                    <p>
                      <span className="font-medium">Industry:</span>{" "}
                      {processedData.reportMetadata.clientIndustry}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 col-span-2">
                    <h3 className="text-lg font-semibold text-purple-600 mb-2">
                      Key Findings
                    </h3>
                    <ul className="list-disc pl-5 text-sm">
                      {processedData.executiveSummary.subtopics
                        .find((topic) => topic.title === "Summary of Findings")
                        ?.content.map((finding, index) => (
                          <li key={index} className="mb-1">
                            {finding}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Radar Chart for Dimensional Analysis */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Maturity Dimensions
                    </h3>
                    <div style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          cx="50%"
                          cy="50%"
                          outerRadius="70%"
                          data={
                            processedData.cloudMaturityAssessment.subtopics.find(
                              (topic) => topic.title === "Dimensional Analysis"
                            )?.dimensionalScores || []
                          }
                        >
                          <PolarGrid />
                          <PolarAngleAxis dataKey="dimension" />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.6}
                          />
                          <Legend />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Maturity Assessment
                    </h3>
                    <div className="mb-4">
                      <p className="text-gray-800">
                        {
                          processedData.cloudMaturityAssessment.subtopics.find(
                            (topic) =>
                              topic.title === "Current Cloud Maturity Level"
                          )?.content
                        }
                      </p>
                    </div>
                    <div className="flex flex-wrap mt-4">
                      {processedData.cloudMaturityAssessment.maturityLevels.map(
                        (level, index) => (
                          <div
                            key={index}
                            className={`m-1 p-2 text-xs rounded-lg ${
                              level.name ===
                              processedData.cloudMaturityAssessment.currentLevel
                                ? "bg-blue-100 border border-blue-300"
                                : "bg-gray-100 border border-gray-200"
                            }`}
                          >
                            <p className="font-medium">{level.name}</p>
                            <p className="text-gray-600">{level.description}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Key Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {processedData.recommendations.keyRecommendations
                      .slice(0, 4)
                      .map((rec, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded border border-gray-200"
                        >
                          <h4 className="font-medium text-blue-700">
                            {rec.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {rec.rationale}
                          </p>
                          <div className="flex justify-between mt-2 text-xs">
                            <span>{rec.impact}</span>
                            <span
                              className={`px-2 py-1 rounded-full ${
                                rec.priority === "Critical"
                                  ? "bg-red-100 text-red-700"
                                  : rec.priority === "High"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {rec.priority} Priority
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Maturity Assessment Tab */}
            {activeTab === "maturity" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-blue-600 mb-3">
                      Understanding Cloud Maturity
                    </h3>
                    <p className="text-gray-800 mb-4">
                      {
                        processedData.cloudMaturityAssessment.subtopics.find(
                          (topic) =>
                            topic.title === "Understanding Cloud Maturity"
                        )?.content
                      }
                    </p>

                    <h3 className="text-xl font-bold text-blue-600 mb-3">
                      Current Maturity Level
                    </h3>
                    <p className="text-gray-800 mb-4">
                      {
                        processedData.cloudMaturityAssessment.subtopics.find(
                          (topic) =>
                            topic.title === "Current Cloud Maturity Level"
                        )?.content
                      }
                    </p>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">
                        Maturity Score
                      </h3>
                      <div className="flex items-center">
                        <div className="text-5xl font-bold text-blue-600">
                          {processedData.cloudMaturityAssessment.overallScore}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-800">
                            out of 5.0
                          </p>
                          <p className="text-sm text-gray-600">
                            {processedData.cloudMaturityAssessment.currentLevel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-blue-600 mb-3">
                      Maturity Dimensions
                    </h3>
                    <div
                      className="bg-blue-900 p-4 rounded-lg"
                      style={{ height: "300px" }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          cx="50%"
                          cy="50%"
                          outerRadius="80%"
                          data={
                            processedData.cloudMaturityAssessment.subtopics.find(
                              (topic) => topic.title === "Dimensional Analysis"
                            )?.dimensionalScores || []
                          }
                        >
                          <PolarGrid stroke="#525073" />
                          <PolarAngleAxis
                            dataKey="dimension"
                            stroke="#ffffff"
                            tick={{ fill: "#ffffff", fontSize: 11 }}
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 5]}
                            stroke="#ffffff"
                            tick={{ fill: "#ffffff" }}
                          />
                          <Radar
                            name="Maturity Score"
                            dataKey="score"
                            stroke="#4FC3F7"
                            fill="#4FC3F7"
                            fillOpacity={0.6}
                          />
                          <Legend wrapperStyle={{ color: "#ffffff" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#2E274C",
                              borderColor: "#4F4D6A",
                              color: "#ffffff",
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-bold text-blue-600 mb-2">
                          Short-Term Focus Areas
                        </h3>
                        <ul className="list-disc pl-5">
                          {processedData.cloudMaturityAssessment.subtopics
                            .find(
                              (topic) =>
                                topic.title ===
                                "Growth Trajectory & Recommendations"
                            )
                            ?.shortTermFocus.map((item, index) => (
                              <li key={index} className="mb-1 text-gray-800">
                                {item}
                              </li>
                            ))}
                        </ul>
                      </div>

                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <h3 className="font-bold text-indigo-600 mb-2">
                          Long-Term Objectives
                        </h3>
                        <ul className="list-disc pl-5">
                          {processedData.cloudMaturityAssessment.subtopics
                            .find(
                              (topic) =>
                                topic.title ===
                                "Growth Trajectory & Recommendations"
                            )
                            ?.longTermObjectives.map((item, index) => (
                              <li key={index} className="mb-1 text-gray-800">
                                {item}
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Maturity Table */}
                <div className="mb-6">
                  <MVPMaturityTable
                    maturityData={processedData.cloudMaturityAssessment}
                  />
                </div>
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === "recommendations" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Key Recommendations */}
                  <div>
                    <h3 className="text-xl font-bold text-blue-600 mb-3">
                      Key Recommendations
                    </h3>
                    <div className="space-y-4">
                      {processedData.recommendations.keyRecommendations.map(
                        (rec, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="text-lg font-semibold text-gray-800">
                                {rec.title}
                              </h4>
                              <span
                                className={`px-2 py-1 text-xs rounded-full font-medium
                                ${
                                  rec.priority === "Critical"
                                    ? "bg-red-100 text-red-700"
                                    : rec.priority === "High"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {rec.priority}
                              </span>
                            </div>
                            <p className="text-gray-600 my-2">
                              {rec.rationale}
                            </p>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Impact:</span>{" "}
                              {rec.impact}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Implementation Priority */}
                  <div>
                    <h3 className="text-xl font-bold text-blue-600 mb-3">
                      Implementation Priority Matrix
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Critical Priority */}
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <h3 className="font-bold text-red-600 mb-2 text-sm">
                          Critical Priority
                        </h3>
                        <ul className="list-disc pl-4 text-xs">
                          {processedData.recommendations.keyRecommendations
                            .filter((rec) => rec.priority === "Critical")
                            .map((rec, index) => (
                              <li key={index} className="text-gray-700 mb-1">
                                {rec.title}
                              </li>
                            ))}
                          {processedData.recommendations.keyRecommendations.filter(
                            (rec) => rec.priority === "Critical"
                          ).length === 0 && (
                            <li className="text-gray-500 italic">
                              None identified
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* High Priority */}
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <h3 className="font-bold text-orange-600 mb-2 text-sm">
                          High Priority
                        </h3>
                        <ul className="list-disc pl-4 text-xs">
                          {processedData.recommendations.keyRecommendations
                            .filter((rec) => rec.priority === "High")
                            .map((rec, index) => (
                              <li key={index} className="text-gray-700 mb-1">
                                {rec.title}
                              </li>
                            ))}
                          {processedData.recommendations.keyRecommendations.filter(
                            (rec) => rec.priority === "High"
                          ).length === 0 && (
                            <li className="text-gray-500 italic">
                              None identified
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Medium Priority */}
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <h3 className="font-bold text-yellow-600 mb-2 text-sm">
                          Medium Priority
                        </h3>
                        <ul className="list-disc pl-4 text-xs">
                          {processedData.recommendations.keyRecommendations
                            .filter((rec) => rec.priority === "Medium")
                            .map((rec, index) => (
                              <li key={index} className="text-gray-700 mb-1">
                                {rec.title}
                              </li>
                            ))}
                          {processedData.recommendations.keyRecommendations.filter(
                            (rec) => rec.priority === "Medium"
                          ).length === 0 && (
                            <li className="text-gray-500 italic">
                              None identified
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Standard Priority */}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <h3 className="font-bold text-blue-600 mb-2 text-sm">
                          Standard Priority
                        </h3>
                        <ul className="list-disc pl-4 text-xs">
                          {processedData.recommendations.keyRecommendations
                            .filter((rec) => rec.priority === "Standard")
                            .map((rec, index) => (
                              <li key={index} className="text-gray-700 mb-1">
                                {rec.title}
                              </li>
                            ))}
                          {processedData.recommendations.keyRecommendations.filter(
                            (rec) => rec.priority === "Standard"
                          ).length === 0 && (
                            <li className="text-gray-500 italic">
                              None identified
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Implementation Roadmap */}
                    <div className="mt-6">
                      <h3 className="text-xl font-bold text-blue-600 mb-3">
                        Implementation Roadmap
                      </h3>
                      <div className="flex flex-wrap justify-between">
                        {processedData.recommendations.implementationRoadmap.map(
                          (phase, index) => (
                            <div
                              key={index}
                              className="w-full sm:w-1/2 md:w-1/2 lg:w-1/4 p-2"
                            >
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 h-full">
                                <h3 className="text-md font-bold text-blue-700 mb-2">
                                  {phase.phase}
                                </h3>
                                <ul className="list-disc pl-4 text-sm">
                                  {phase.actions.map((action, i) => (
                                    <li key={i} className="text-gray-700 mb-1">
                                      {action}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h3 className="text-xl font-bold text-indigo-600 mb-3">
                    Next Steps
                  </h3>
                  <ul className="list-disc pl-5">
                    {processedData.recommendations.nextSteps.map(
                      (step, index) => (
                        <li key={index} className="text-gray-800 mb-2">
                          {step}
                        </li>
                      )
                    )}
                  </ul>
                  <div className="mt-4 text-center">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
                      Schedule Implementation Call
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
