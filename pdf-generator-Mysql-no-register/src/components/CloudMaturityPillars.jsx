// src/components/CloudMaturityPillars.jsx
"use client"

import { useState } from "react"

export default function CloudMaturityPillars({ data }) {
  const [activeColumn, setActiveColumn] = useState(null)

  // Handle missing data
  if (!data || !data.dimensions) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          Cloud Maturity Pillars
        </h2>
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 text-center">
          No dimension data available
        </div>
      </div>
    )
  }

  // Get valid dimensions with scores > 0
  const dimensions = data.dimensions?.filter((dim) => dim.score > 0) || []

  // If no dimensions with valid scores, use a fallback
  if (
    dimensions.length === 0 &&
    data.cloudMaturityAssessment?.dimensionalScores
  ) {
    // Try to use dimensional scores from cloudMaturityAssessment as fallback
    data.cloudMaturityAssessment.dimensionalScores.forEach((dim, index) => {
      dimensions.push({
        id: `dim-${index}`,
        name: dim.dimension,
        score: dim.score,
        description: `${dim.dimension} maturity assessment`,
      })
    })
  }

  // Map maturity level to a name
  const getMaturityLevelName = (score) => {
    if (score < 1.5) return "Initial"
    if (score < 2.5) return "Developing"
    if (score < 3.5) return "Defined"
    if (score < 4.5) return "Managed"
    return "Optimizing"
  }

  // Get Tailwind color classes for maturity level
  const getMaturityColorClasses = (score) => {
    if (score < 1.5) return "bg-red-500 text-white" // Red
    if (score < 2.5) return "bg-orange-500 text-white" // Orange
    if (score < 3.5) return "bg-blue-500 text-white" // Blue
    if (score < 4.5) return "bg-green-500 text-white" // Green
    return "bg-teal-500 text-white" // Teal
  }

  // Get pillar background color classes
  const getPillarColorClasses = (dimensionName) => {
    const colorMap = {
      "Strategic Alignment": "bg-gradient-to-b from-indigo-400 to-indigo-600",
      "Cost Visibility & Value Assessment":
        "bg-gradient-to-b from-orange-400 to-orange-600",
      "Cloud Adoption": "bg-gradient-to-b from-teal-400 to-teal-600",
      "Security Posture": "bg-gradient-to-b from-pink-400 to-pink-600",
      "Operational Excellence": "bg-gradient-to-b from-blue-400 to-blue-600",
      "Organizational Enablement":
        "bg-gradient-to-b from-purple-400 to-purple-600",
      // Fallback colors for any other categories
      "Cloud Strategy": "bg-gradient-to-b from-indigo-400 to-indigo-600",
      "Cloud Cost": "bg-gradient-to-b from-orange-400 to-orange-600",
      "Cloud Security": "bg-gradient-to-b from-pink-400 to-pink-600",
      "Cloud People": "bg-gradient-to-b from-purple-400 to-purple-600",
      "Cloud DevOps": "bg-gradient-to-b from-blue-400 to-blue-600",
    }

    return (
      colorMap[dimensionName] || "bg-gradient-to-b from-gray-400 to-gray-600"
    )
  }

  // Calculate percentage height for visual representation
  const getHeightStyle = (score) => {
    const percentage = Math.max(5, (score / 5) * 100) // Minimum 5% height
    return { height: `${percentage}%` }
  }

  // Get overall maturity score
  const overallScore =
    data.cloudMaturityAssessment?.overallScore ||
    (dimensions.length > 0
      ? dimensions.reduce((sum, dim) => sum + dim.score, 0) / dimensions.length
      : 0)

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Cloud Maturity Pillars
        </h2>
        <div className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
          <span className="text-sm text-gray-600">Overall Maturity:</span>
          <span className="ml-2 font-bold text-blue-600">
            {overallScore.toFixed(1)}/5.0
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div className="flex items-end space-x-4 h-72 mb-8 pt-6 relative border-b border-l border-gray-200">
        {/* Y-axis labels and grid lines */}
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={`level-${level}`}
            className="absolute left-0 right-0 border-t border-dashed border-gray-200"
            style={{
              bottom: `${(level / 5) * 100}%`,
            }}
          >
            <span className="absolute -left-6 -top-3 text-xs font-medium text-gray-500">
              {level}
            </span>
          </div>
        ))}

        {/* Overall score pillar */}
        <div
          className="flex flex-col items-center relative group"
          onMouseEnter={() => setActiveColumn("overall")}
          onMouseLeave={() => setActiveColumn(null)}
        >
          <div className="absolute -top-6 left-0 right-0 text-center text-xs font-semibold text-gray-500">
            Overall
          </div>
          <div
            className={`w-14 rounded-t-lg bg-gradient-to-b from-blue-400 to-blue-600 shadow relative overflow-hidden transition-all duration-300 ${
              activeColumn === "overall" ? "ring-2 ring-blue-300" : ""
            }`}
            style={getHeightStyle(overallScore)}
          >
            {/* Level indicator */}
            <div className="absolute top-2 left-0 right-0 flex justify-center">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${getMaturityColorClasses(
                  overallScore
                )}`}
              >
                {getMaturityLevelName(overallScore).charAt(0)}
              </span>
            </div>

            {/* Score */}
            <div className="absolute bottom-2 left-0 right-0 text-center text-white font-bold">
              {overallScore.toFixed(1)}
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
          </div>
        </div>

        {/* Dimension pillars */}
        {dimensions.map((dimension, index) => (
          <div
            key={dimension.id || `dim-${index}`}
            className="flex flex-col items-center relative group"
            onMouseEnter={() => setActiveColumn(dimension.id || `dim-${index}`)}
            onMouseLeave={() => setActiveColumn(null)}
          >
            <div className="absolute -top-6 left-0 right-0 text-center text-xs font-semibold text-gray-500 truncate px-1">
              {dimension.name.length > 12
                ? dimension.name
                    .split(" ")
                    .map((word) => word.charAt(0))
                    .join("")
                : dimension.name}
            </div>
            <div
              className={`w-14 rounded-t-lg shadow relative overflow-hidden transition-all duration-300 ${getPillarColorClasses(
                dimension.name
              )} ${
                activeColumn === (dimension.id || `dim-${index}`)
                  ? "ring-2 ring-blue-300"
                  : ""
              }`}
              style={getHeightStyle(dimension.score)}
            >
              {/* Level indicator */}
              <div className="absolute top-2 left-0 right-0 flex justify-center">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${getMaturityColorClasses(
                    dimension.score
                  )}`}
                >
                  {Math.round(dimension.score)}
                </span>
              </div>

              {/* Score */}
              <div className="absolute bottom-2 left-0 right-0 text-center text-white font-bold">
                {dimension.score.toFixed(1)}
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend for maturity levels */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2">
        {[1, 2, 3, 4, 5].map((level) => {
          const colorClass = getMaturityColorClasses(level)
          return (
            <div key={`legend-${level}`} className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${colorClass}`} />
              <span className="text-xs text-gray-700">
                Level {level}: {getMaturityLevelName(level)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Details card for active column */}
      {activeColumn && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm transition-all duration-300 transform">
          {activeColumn === "overall" ? (
            <div>
              <div className="font-semibold text-blue-800 text-lg mb-1">
                Overall Cloud Maturity
              </div>
              <div className="flex items-center mb-2">
                <span className="font-medium text-gray-700 mr-2">
                  Maturity Level:
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${getMaturityColorClasses(
                    overallScore
                  )}`}
                >
                  {getMaturityLevelName(overallScore)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-2">Score:</span>
                <span className="text-lg font-bold text-blue-700">
                  {overallScore.toFixed(1)}
                </span>
                <span className="text-gray-500 ml-1">/5.0</span>
              </div>
              <div className="mt-4 text-gray-600">
                This represents your organization's overall cloud maturity
                across all dimensions.
              </div>
            </div>
          ) : (
            <div>
              {(() => {
                const dim = dimensions.find(
                  (d) =>
                    d.id === activeColumn || `dim-${d.index}` === activeColumn
                )
                if (!dim) return null

                return (
                  <>
                    <div className="font-semibold text-blue-800 text-lg mb-1">
                      {dim.name}
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="font-medium text-gray-700 mr-2">
                        Maturity Level:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${getMaturityColorClasses(
                          dim.score
                        )}`}
                      >
                        {getMaturityLevelName(dim.score)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 mr-2">
                        Score:
                      </span>
                      <span className="text-lg font-bold text-blue-700">
                        {dim.score.toFixed(1)}
                      </span>
                      <span className="text-gray-500 ml-1">/5.0</span>
                    </div>
                    <div className="mt-2 text-gray-600">{dim.description}</div>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
