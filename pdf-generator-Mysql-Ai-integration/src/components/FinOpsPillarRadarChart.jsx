// components/FinOpsPillarRadarChart.jsx
import React from "react"
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

const FinOpsPillarRadarChart = ({
  data,
  title = "FinOps Pillar Analysis",
  height = 300,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-bold text-gray-700 mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="pillar" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={5} />
          <Radar
            name="Your Score"
            dataKey="score"
            stroke="#6366F1"
            strokeWidth={2}
            fill="#6366F1"
            fillOpacity={0.3}
          />
          <Radar
            name="Baseline (50%)"
            dataKey="benchmark"
            stroke="#10B981"
            strokeWidth={2}
            fill="#10B981"
            fillOpacity={0.1}
          />
          <Tooltip formatter={(value, name) => [`${value}%`, name]} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          This chart visualizes your FinOps maturity across different pillars.
          The blue area represents your score, while the green area indicates
          the baseline (50%).
        </p>
      </div>
    </div>
  )
}

export default FinOpsPillarRadarChart
