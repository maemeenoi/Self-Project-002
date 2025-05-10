// src/components/CloudMaturityVisualizer.jsx
"use client"

import { useState } from "react"
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

export default function CloudMaturityVisualizer({ data }) {
  const [activeView, setActiveView] = useState("radar") // 'radar', 'bar', 'pillars'

  // Handle missing data
  if (!data) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-700">
        No assessment data available. Please complete the questionnaire.
      </div>
    )
  }

  // Extract needed data
  const { cloudMaturityAssessment, dimensions, standardsComparison } = data

  // If dimensions isn't in the expected format, try to adapt from dimensional scores
  const dimensionsData =
    dimensions ||
    cloudMaturityAssessment?.dimensionalScores?.map((dim) => ({
      id: dim.dimension.toLowerCase().replace(/\s+/g, "_"),
      name: dim.dimension,
      score: dim.score,
      percentage: (dim.score / 5) * 100,
      maturityLevel: Math.ceil(dim.score),
      maturityName: getMaturityLevelName(dim.score),
      description: `${dim.dimension} dimension of cloud maturity`,
    })) ||
    []

  // Get a standardized list of dimensional scores for visualization
  const radarData = cloudMaturityAssessment?.dimensionalScores || []

  // Helper function to get maturity level name
  function getMaturityLevelName(score) {
    if (score < 1.5) return "Initial"
    if (score < 2.5) return "Developing"
    if (score < 3.5) return "Defined"
    if (score < 4.5) return "Managed"
    return "Optimizing"
  }

  // Helper function to get color based on score
  function getScoreColor(score) {
    if (score < 1.5) return "#ef4444" // Red
    if (score < 2.5) return "#f59e0b" // Orange
    if (score < 3.5) return "#3b82f6" // Blue
    if (score < 4.5) return "#10b981" // Green
    return "#059669" // Dark Green
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with Overall Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600">
              {cloudMaturityAssessment?.overallScore?.toFixed(1)}
            </div>
            <div className="ml-2 text-sm">
              <span className="block text-gray-500">Overall Score</span>
              <span className="font-medium text-gray-700">
                Level: {cloudMaturityAssessment?.currentLevel}
              </span>
            </div>
          </div>

          {/* Standards compliance summary */}
          {standardsComparison && (
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-sm text-gray-700">
                  {standardsComparison.above} Above Standard
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                <span className="text-sm text-gray-700">
                  {standardsComparison.meeting} Meeting Standard
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span className="text-sm text-gray-700">
                  {standardsComparison.below} Below Standard
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View toggle buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md transition ${
            activeView === "radar"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setActiveView("radar")}
        >
          Radar Chart
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md transition ${
            activeView === "bar"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setActiveView("bar")}
        >
          Bar Chart
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md transition ${
            activeView === "pillars"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setActiveView("pillars")}
        >
          Pillar Cards
        </button>
      </div>

      {/* Visualization area */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        {activeView === "radar" && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={radarData}
                margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
              >
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 12, fill: "#374151" }}
                />
                <PolarRadiusAxis
                  angle={18}
                  domain={[0, 5]}
                  tick={{ fontSize: 10, fill: "#4b5563" }}
                />
                <Radar
                  name="Your Organization"
                  dataKey="score"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Industry Standard"
                  dataKey="standardScore"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.2}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeView === "bar" && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dimensionsData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={95}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [`${value}/5.0`, "Score"]}
                  labelFormatter={(label) => `${label} Dimension`}
                />
                <Bar
                  dataKey="score"
                  fill="#6366F1"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                  label={{
                    position: "right",
                    formatter: (val) => val.toFixed(1),
                    fill: "#4b5563",
                    fontSize: 12,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeView === "pillars" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dimensionsData.map((dimension) => (
              <div
                key={dimension.id}
                className="bg-white p-4 rounded-lg shadow border-t-4"
                style={{ borderTopColor: getScoreColor(dimension.score) }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {dimension.name}
                  </h3>
                  <div
                    className="px-2 py-1 rounded-full font-medium text-white text-sm"
                    style={{ backgroundColor: getScoreColor(dimension.score) }}
                  >
                    {dimension.score.toFixed(1)}/5.0
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {dimension.description}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${dimension.percentage}%`,
                      backgroundColor: getScoreColor(dimension.score),
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Initial</span>
                  <span>Developing</span>
                  <span>Defined</span>
                  <span>Managed</span>
                  <span>Optimizing</span>
                </div>

                <div className="mt-3 text-sm">
                  <span className="font-medium">Maturity Level:</span>{" "}
                  {dimension.maturityName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions/legend */}
      <div className="mt-4 text-sm text-gray-600 border-t border-gray-200 pt-4">
        <p className="font-medium mb-2">Maturity Levels:</p>
        <div className="grid grid-cols-5 gap-2">
          <div>
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
            <span>Level 1: Initial</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1"></span>
            <span>Level 2: Developing</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
            <span>Level 3: Defined</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
            <span>Level 4: Managed</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-green-700 rounded-full mr-1"></span>
            <span>Level 5: Optimizing</span>
          </div>
        </div>
      </div>
    </div>
  )
}
