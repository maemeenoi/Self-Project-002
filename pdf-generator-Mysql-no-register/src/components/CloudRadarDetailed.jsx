// src/components/CloudRadarDetailed.jsx
"use client"

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from "recharts"

export default function CloudRadarDetailed({ data }) {
  // Handle missing data
  if (
    !data ||
    !data.cloudMaturityAssessment ||
    !data.cloudMaturityAssessment.dimensionalScores
  ) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          Cloud Dimensional Analysis
        </h2>
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 text-center h-64 flex items-center justify-center">
          <p>No dimensional data available</p>
        </div>
      </div>
    )
  }

  // Extract dimensional scores for radar chart
  const radarData = data.cloudMaturityAssessment.dimensionalScores

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">
        Cloud Dimensional Analysis
      </h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={radarData}
            margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
          >
            <PolarGrid gridType="polygon" stroke="#ccc" strokeDasharray="3 3" />
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
              name="Your Organization"
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
                    <div>Your Score: {payload[0]?.value?.toFixed(1)}</div>
                    <div>
                      Industry Standard: {payload[1]?.value?.toFixed(1)}
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

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
        {radarData.map((dimension, index) => (
          <div key={index} className="text-center">
            <div
              className="text-lg font-bold"
              style={{
                color:
                  dimension.score >= dimension.standardScore
                    ? "#10B981"
                    : dimension.score >= dimension.standardScore - 0.5
                    ? "#F59E0B"
                    : "#EF4444",
              }}
            >
              {dimension.score.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">{dimension.dimension}</div>
            <div
              className="text-xs mt-1 py-0.5 px-2 rounded-full mx-auto inline-block"
              style={{
                backgroundColor:
                  dimension.score >= dimension.standardScore
                    ? "#D1FAE5"
                    : dimension.score >= dimension.standardScore - 0.5
                    ? "#FEF3C7"
                    : "#FEE2E2",
                color:
                  dimension.score >= dimension.standardScore
                    ? "#065F46"
                    : dimension.score >= dimension.standardScore - 0.5
                    ? "#92400E"
                    : "#B91C1C",
              }}
            >
              {dimension.score >= dimension.standardScore
                ? "Above Standard"
                : dimension.score === dimension.standardScore
                ? "Meets Standard"
                : "Below Standard"}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
