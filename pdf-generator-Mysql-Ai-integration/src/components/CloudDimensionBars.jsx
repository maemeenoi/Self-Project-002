// src/components/CloudDimensionBars.jsx
"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

export default function CloudDimensionBars({ data }) {
  // Handle missing data
  if (!data || !data.dimensions) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          Dimension Performance
        </h2>
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 text-center">
          No dimension data available
        </div>
      </div>
    )
  }

  // Extract dimensions and sort by score (descending)
  const dimensionsData = [...data.dimensions]
    .filter((dim) => dim.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((dim) => ({
      name: dim.name,
      score: dim.score,
      standardScore: 3.5, // Using a default standard score for visualization
    }))

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-bold text-gray-700 mb-4">
        Dimension Performance
      </h2>
      <div style={{ height: "250px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dimensionsData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 5]}
              tickCount={6}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value) => [`${value.toFixed(1)}/5.0`, "Score"]}
            />
            <Legend />
            <Bar
              dataKey="score"
              name="Your Score"
              fill="#4F46E5"
              radius={[0, 4, 4, 0]}
              label={{
                position: "right",
                formatter: (val) => val.toFixed(1),
                fill: "#4b5563",
                fontSize: 11,
              }}
            />
            <Bar
              dataKey="standardScore"
              name="Industry Standard"
              fill="#10B981"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-gray-500 text-center mt-2">
        Comparison of your scores against industry standards across all
        dimensions
      </div>
    </div>
  )
}
