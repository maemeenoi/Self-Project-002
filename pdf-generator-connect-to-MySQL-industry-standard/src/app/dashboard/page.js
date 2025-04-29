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
import dynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image" // Add Image import here
import ReportGenerator from "../../components/report/ReportGenerator"
import * as d3 from "d3"

const GaugeMeter = ({ value }) => {
  const ref = useRef()

  useEffect(() => {
    const percent = value / 5
    const width = 400
    const height = 220
    const barWidth = 50
    const numSections = 5
    const chartInset = 10
    const padRad = 0.05
    const radius = Math.min(width, height * 2) / 2

    d3.select(ref.current).selectAll("*").remove()

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)

    const chart = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height})`)

    let totalPercent = 0.75
    const sectionPerc = 1 / numSections / 2

    const arcColorFn = d3.scaleLinear().domain([0, numSections - 1])
    const colors = ["#900C3F", "#C70039", "#FF5733", "#FFC300", "#DAF7A6"]

    for (let i = 0; i < numSections; i++) {
      const arcStartRad = percToRad(totalPercent)
      const arcEndRad = arcStartRad + percToRad(sectionPerc)
      totalPercent += sectionPerc

      const arc = d3
        .arc()
        .innerRadius(radius - barWidth)
        .outerRadius(radius)
        .startAngle(arcStartRad)
        .endAngle(arcEndRad)

      chart.append("path").attr("d", arc).attr("fill", colors[i]) // Instead of arcColorFn(i)
    }

    // Needle
    const needleLen = radius * 0.9
    const needleRadius = 6

    const thetaRad = percToRad(0.75 - percent / 2)

    const topX = 0 - needleLen * Math.cos(thetaRad)
    const topY = 0 - needleLen * Math.sin(thetaRad)

    const leftX = 0 - needleRadius * Math.cos(thetaRad - Math.PI / 2)
    const leftY = 0 - needleRadius * Math.sin(thetaRad - Math.PI / 2)

    const rightX = 0 - needleRadius * Math.cos(thetaRad + Math.PI / 2)
    const rightY = 0 - needleRadius * Math.sin(thetaRad + Math.PI / 2)

    const needleLine = `M ${leftX} ${leftY} L ${topX} ${topY} L ${rightX} ${rightY}`

    chart
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", needleRadius)
      .attr("fill", "#333")

    chart.append("path").attr("d", needleLine).attr("fill", "#333")

    chart
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", 30)
      .attr("font-size", "18px")
      .attr("fill", "#444")
      .text(`${value.toFixed(1)} / 5.0`)
  }, [value])

  return (
    <div className="flex flex-col items-center">
      <div ref={ref}></div>
      <div className="mt-4 text-lg font-semibold text-center">
        Maturity Level: {getMatureityLabel(value)}
      </div>
    </div>
  )
}

function percToRad(perc) {
  return degToRad(perc * 360)
}

function degToRad(deg) {
  return (deg * Math.PI) / 180
}

// Helper function to get maturity level label
const getMatureityLabel = (score) => {
  return score
}

export default function Dashboard() {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [industryStandards, setIndustryStandards] = useState([])
  const [processedData, setProcessedData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const getOrganizationName = () => {
    if (!processedData?.reportMetadata?.organizationName) {
      console.log("Organization name not found, using default")
      return "Unknown Organization"
    }
    return processedData.reportMetadata.organizationName
  }

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch("/api/clients")
        const data = await response.json()
        setClients(data)
      } catch (error) {
        setError("Failed to load clients.")
      }
    }
    fetchClients()
  }, [])

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
        }
      } catch (error) {
        setError("Failed to load responses.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchResponses()
  }, [selectedClient, industryStandards])

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

  const countStandards = (type) => {
    // Check if the required data exists
    if (
      !processedData ||
      !processedData.recommendations ||
      !Array.isArray(processedData.recommendations.responses)
    ) {
      console.log("Data structure for standard counting is not available")
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

  return (
    <div className="flex min-h-screen bg-base-200" data-theme="corporate">
      {/* Top Navigation Bar */}
      <nav className="navbar bg-base-100 fixed top-0 z-50 shadow-md p-0 flex justify-between h-16">
        {/* Logo and Organization Name */}
        <div className="flex items-center gap-2 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="h-8 w-auto" />
            <span className="font-bold text-lg text-primary">
              {"MakeStuffGo"}
            </span>
          </Link>
        </div>

        {/* Profile Dropdown */}
        <div className="flex items-center gap-4 pr-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              {selectedClient?.ClientName || "Guest User"}
            </p>
            <p className="text-xs text-gray-500">
              {getOrganizationName() || "Cloud Assessment Client"}
            </p>
          </div>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-white flex items-center justify-center">
                {selectedClient?.ClientName?.charAt(0) || "G"}
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
                <a>Sign Out</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Sidebar */}
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-base-300 p-4 hidden md:flex flex-col">
        {/* User Profile Card */}
        <div className="flex flex-col items-start mb-6">
          <div className="font-bold text-lg">
            {selectedClient?.ClientName || "Client Name"}
          </div>
          <div className="text-xs text-gray-400">
            {selectedClient?.OrganizationName || "Company Name"}
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="hover:bg-base-100 p-2 rounded-lg flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
            <span>Dashboard</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex pt-16 min-h-screen bg-base-200">
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

            {/* Breadcrumb */}
            <nav className="text-sm breadcrumbs">
              <ul>
                <li>
                  <a href="#" className="text-primary">
                    Dashboard
                  </a>
                </li>
                <li>
                  <span className="text-gray-500">Overview</span>
                </li>
              </ul>
            </nav>
          </div>

          {/* Client selector */}
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

          {/* Standards Status Cards Row - This replaces the stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-lg shadow">
              <h2 className="text-lg">Above Standard</h2>
              <p className="text-4xl font-bold">{countStandards("above")}</p>
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
              <p className="text-4xl font-bold">{countStandards("below")}</p>
              <p className="text-sm mt-2">
                Number of metrics below industry standard
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          )}

          {!isLoading && processedData && (
            <>
              {/* Maturity Score + Radar Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Maturity Score with improved gauge */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-bold text-gray-700 mb-4">
                    Cloud Maturity Level
                  </h2>
                  <GaugeMeter
                    value={processedData.cloudMaturityAssessment.overallScore}
                  />
                  <p className="text-center text-gray-600 mt-4">
                    Current maturity level:{" "}
                    {processedData.cloudMaturityAssessment.currentLevel}
                  </p>
                </div>

                {/* Enhanced Radar Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
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

          {!selectedClient && !isLoading && (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h2 className="text-xl font-semibold text-gray-700">
                Welcome to the Cloud Assessment Dashboard
              </h2>
              <p className="text-gray-600 mt-2">
                Please select a client to view assessment data.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
