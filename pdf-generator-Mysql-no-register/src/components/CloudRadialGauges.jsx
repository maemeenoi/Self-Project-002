// src/components/CloudRadialGauges.jsx
"use client"

import { useState } from "react"

export default function CloudRadialGauges({ data }) {
  const [selectedDimension, setSelectedDimension] = useState(null)

  // Handle missing data
  if (!data || !data.dimensions) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          Maturity Gauges
        </h2>
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 text-center h-64 flex items-center justify-center">
          <p>No dimension data available</p>
        </div>
      </div>
    )
  }

  // Get valid dimensions (with scores > 0)
  const dimensions = data.dimensions.filter((dim) => dim.score > 0)

  // Get overall score
  const overallScore = data.cloudMaturityAssessment?.overallScore || 0
  const overallPercentage = Math.round((overallScore / 5) * 100)

  // Helper function to get color based on score
  const getScoreColor = (score) => {
    if (score < 1.5) return "#ef4444" // Red
    if (score < 2.5) return "#f59e0b" // Orange
    if (score < 3.5) return "#3b82f6" // Blue
    if (score < 4.5) return "#10b981" // Green
    return "#059669" // Dark Green
  }

  // If a dimension is selected, show detailed view, otherwise show the overview
  const currentDimension = selectedDimension
    ? dimensions.find((d) => d.id === selectedDimension)
    : null

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Maturity Gauges</h2>
        {currentDimension && (
          <button
            onClick={() => setSelectedDimension(null)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to overview
          </button>
        )}
      </div>

      {currentDimension ? (
        // Detailed view for selected dimension
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            {currentDimension.name}
          </h3>
          <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
            {currentDimension.description}
          </p>

          <div className="relative w-64 h-64 mb-3">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="16"
              />

              {/* Progress arc */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={getScoreColor(currentDimension.score)}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${currentDimension.percentage * 5.02} 502`}
                transform="rotate(-90 100 100)"
              />

              {/* Score text */}
              <text
                x="100"
                y="85"
                textAnchor="middle"
                fontSize="36"
                fontWeight="bold"
                fill={getScoreColor(currentDimension.score)}
              >
                {currentDimension.score.toFixed(1)}
              </text>

              {/* Label */}
              <text
                x="100"
                y="115"
                textAnchor="middle"
                fontSize="14"
                fill="#6b7280"
              >
                out of 5.0
              </text>
            </svg>
          </div>

          {/* Maturity level */}
          <div
            className="text-lg font-semibold"
            style={{ color: getScoreColor(currentDimension.score) }}
          >
            Level {currentDimension.maturityLevel}:{" "}
            {currentDimension.maturityName}
          </div>

          {/* Key insights */}
          <div className="mt-6 w-full max-w-md border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-700 mb-2">Key Insights</h4>
            {currentDimension.score < 3 ? (
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  This dimension is below the industry standard (3.5)
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Prioritize improvement in {currentDimension.name}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Aim to reach Level{" "}
                  {Math.min(currentDimension.maturityLevel + 1, 5)} (
                  {getNextMaturityLevel(currentDimension.maturityLevel)})
                </li>
              </ul>
            ) : currentDimension.score < 4 ? (
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  This dimension is near industry standard (3.5)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Continue enhancing {currentDimension.name} capabilities
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Aim to reach Level{" "}
                  {Math.min(currentDimension.maturityLevel + 1, 5)} (
                  {getNextMaturityLevel(currentDimension.maturityLevel)})
                </li>
              </ul>
            ) : (
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  This dimension exceeds industry standard (3.5)
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {currentDimension.name} is a strength area
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Focus on maintaining excellence and sharing best practices
                </li>
              </ul>
            )}
          </div>
        </div>
      ) : (
        // Overview of all dimensions with small gauges
        <div className="flex flex-col">
          {/* Overall score gauge at the top */}
          <div className="flex justify-center items-center mb-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                />

                {/* Progress arc */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={getScoreColor(overallScore)}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={`${overallPercentage * 5.02} 502`}
                  transform="rotate(-90 100 100)"
                />

                {/* Score text */}
                <text
                  x="100"
                  y="100"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="32"
                  fontWeight="bold"
                  fill={getScoreColor(overallScore)}
                >
                  {overallScore.toFixed(1)}
                </text>

                {/* Label */}
                <text
                  x="100"
                  y="130"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  Overall
                </text>
              </svg>
            </div>
          </div>

          {/* Grid of dimension gauges */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {dimensions.map((dimension) => (
              <button
                key={dimension.id}
                onClick={() => setSelectedDimension(dimension.id)}
                className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition duration-200 cursor-pointer border border-gray-200"
              >
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Background circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="16"
                    />

                    {/* Progress arc */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke={getScoreColor(dimension.score)}
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray={`${dimension.percentage * 5.02} 502`}
                      transform="rotate(-90 100 100)"
                    />

                    {/* Score text */}
                    <text
                      x="100"
                      y="95"
                      textAnchor="middle"
                      fontSize="28"
                      fontWeight="bold"
                      fill={getScoreColor(dimension.score)}
                    >
                      {dimension.score.toFixed(1)}
                    </text>

                    {/* Label */}
                    <text
                      x="100"
                      y="120"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6b7280"
                    >
                      Level {dimension.maturityLevel}
                    </text>
                  </svg>
                </div>
                <div className="mt-1 text-sm font-medium text-gray-700 text-center">
                  {dimension.name}
                </div>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 text-xs text-gray-500 grid grid-cols-5 gap-1 pt-3 border-t border-gray-200">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
              <span>Initial</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1"></span>
              <span>Developing</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
              <span>Defined</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
              <span>Managed</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-green-700 rounded-full mr-1"></span>
              <span>Optimizing</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to get next maturity level name
function getNextMaturityLevel(currentLevel) {
  const levels = ["Initial", "Developing", "Defined", "Managed", "Optimizing"]
  return levels[Math.min(currentLevel, 4)]
}
