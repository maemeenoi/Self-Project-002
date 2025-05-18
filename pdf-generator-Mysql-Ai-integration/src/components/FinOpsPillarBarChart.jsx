// components/FinOpsPillarBarChart.jsx
import React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const FinOpsPillarBarChart = ({
  data,
  title = "FinOps Pillar Performance Comparison",
  height = 400,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 120 }} // Increased bottom margin for labels
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-35}
            textAnchor="end"
            height={15} // Increased height for more space
            tick={{ fontSize: 12 }} // Smaller font for better fit
            tickMargin={10} // Add more margin for the text
          />
          <YAxis
            domain={[0, 100]}
            label={{
              value: "Maturity %",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            formatter={(value, name) => [`${value}%`, "Maturity Score"]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                const data = payload[0].payload
                return `${label} (${data.maturityLevel})`
              }
              return label
            }}
          />
          <Bar
            dataKey="percentage"
            fill="#6366F1"
            radius={[4, 4, 0, 0]}
            // Optional: Add a name for the bar in the legend
            name="Maturity Score"
          />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-500 mt-2">
        This chart compares the maturity scores of different FinOps pillars.
        Each bar represents the percentage of maturity for a specific pillar.
        The maturity level is indicated in the tooltip when hovering over the
        bars.
      </p>
    </div>
  )
}

export default FinOpsPillarBarChart
