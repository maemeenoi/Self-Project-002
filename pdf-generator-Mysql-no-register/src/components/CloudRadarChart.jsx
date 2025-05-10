// src/components/CloudRadarChart.jsx
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

export default function CloudRadarChart({ data }) {
  // Handle missing data
  if (
    !data ||
    !data.cloudMaturityAssessment ||
    !data.cloudMaturityAssessment.dimensionalScores
  ) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          Cloud Dimensional Analysis
        </h2>
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 text-center">
          No dimensional data available
        </div>
      </div>
    )
  }

  // Extract dimensional scores for radar chart
  const radarData = data.cloudMaturityAssessment.dimensionalScores

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-bold text-gray-700 mb-4">
        Cloud Dimensional Analysis
      </h2>
      <div style={{ height: "250px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={radarData}
            margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
          >
            <PolarGrid gridType="polygon" stroke="#ccc" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{
                fontSize: 11,
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
                fontSize: "12px",
                marginTop: "10px",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
