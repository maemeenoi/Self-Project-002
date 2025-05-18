// components/GaugeMeter.jsx
import React from "react"

const GaugeMeter = ({
  value = 3.2,
  maxValue = 5,
  maturityLevel = "Not Available",
  percentage = 0,
  totalScore = 0,
  maxScore = 0,
}) => {
  // Normalize the value to ensure it's within 0-maxValue range
  const normalizedValue = Math.max(0, Math.min(maxValue, parseFloat(value)))

  // Calculate the angle for the needle (0 = -180 degrees, maxValue = 0 degrees)
  // Map from [0,maxValue] range to [-180,0] degrees
  const needleAngle = -180 + (normalizedValue / maxValue) * 180

  // Helper function to get health score label
  const getHealthLabel = (score) => {
    if (score < 1) return "Critical Health"
    if (score < 2) return "Poor Health"
    if (score < 3) return "Fair Health"
    if (score < 4) return "Good Health"
    if (score < 4.6) return "Very Good Health"
    return "Excellent Health"
  }

  // Tick markers for the gauge scale
  const ticks = Array.from({ length: maxValue + 1 }, (_, i) => i)

  // Colors for the gauge segments - red on left (poor) to green on right (good)
  const segmentColors = [
    "#DF5353", // Red - Level 0 (left side - lowest score)
    "#FF8A65", // Light Red - Level 1
    "#FFB15C", // Orange - Level 2
    "#FFCA28", // Light Yellow - Level 3
    "#FFEB3B", // Yellow - Level 4
    "#FFF176", // Light Yellow - Level 5
    "#C5E1A5", // Light Green - Level 6
    "#A5D6A7", // Green - Level 7
    "#81C784", // Light Green - Level 8
    "#4CAF50", // Green - Level 9
    "#388E3C", // Dark Green - Level 10 (right side - highest score)
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-bold text-gray-700 mb-4">
        Overall FinOps Maturity
      </h2>
      <div className="flex flex-col items-center">
        <div className="relative w-full h-64">
          {/* Gauge Background */}
          <svg viewBox="0 0 300 200" className="w-full h-full">
            <defs>
              {/* Shadow for needle */}
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="1"
                  dy="1"
                  stdDeviation="2"
                  floodOpacity="0.3"
                />
              </filter>
            </defs>

            {/* Outer arc segments - colored sections */}
            {segmentColors.map((color, index) => {
              // Each segment is 36 degrees (180 / 5)
              const startAngle = -175 + index * 16
              const endAngle = startAngle + 10

              // Convert angles to radians
              const startRad = (startAngle * Math.PI) / 180
              const endRad = (endAngle * Math.PI) / 180

              // Calculate arc points (radius 110, center at 150,150)
              const x1 = 150 + 110 * Math.cos(startRad)
              const y1 = 150 + 110 * Math.sin(startRad)
              const x2 = 150 + 110 * Math.cos(endRad)
              const y2 = 150 + 110 * Math.sin(endRad)

              // Arc flag is 0 for arcs less than 180 degrees
              const largeArcFlag = 0

              return (
                <path
                  key={index}
                  d={`M ${x1},${y1} A110,110 0 ${largeArcFlag},1 ${x2},${y2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth="30"
                  strokeLinecap="round"
                />
              )
            })}

            {/* Ticks and labels */}
            {ticks.map((tick) => {
              // Position each tick evenly along the arc
              const angle = -180 + (tick / maxValue) * 180
              const rad = (angle * Math.PI) / 180

              // Calculate tick positions
              const innerRadius = 90
              const outerRadius = 110
              const labelRadius = 130

              const x1 = 150 + innerRadius * Math.cos(rad)
              const y1 = 150 + innerRadius * Math.sin(rad)
              const x2 = 150 + outerRadius * Math.cos(rad)
              const y2 = 150 + outerRadius * Math.sin(rad)
              const labelX = 150 + labelRadius * Math.cos(rad)
              const labelY = 150 + labelRadius * Math.sin(rad)

              return (
                <g key={tick}>
                  {/* Tick marks - white lines */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="white"
                    strokeWidth="2"
                  />

                  {/* Tick labels */}
                  <text
                    x={labelX}
                    y={labelY}
                    fontSize="16"
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="#333"
                  >
                    {tick}
                  </text>
                </g>
              )
            })}

            {/* Needle with shadow */}
            <line
              x1="150"
              y1="150"
              x2={150 + 100 * Math.cos((needleAngle * Math.PI) / 180)}
              y2={150 + 100 * Math.sin((needleAngle * Math.PI) / 180)}
              stroke="#777"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#shadow)"
            />

            {/* Needle center pivot */}
            <circle cx="150" cy="150" r="8" fill="#555" />

            {/* Value display */}
            <text
              x="150"
              y="190"
              fontSize="24"
              fontWeight="bold"
              textAnchor="middle"
              fill="#333"
            >
              {normalizedValue.toFixed(1)}/{maxValue}
            </text>
          </svg>
        </div>

        {/* Health score label */}
        <div className="mt-2 text-2xl font-bold text-center">
          {getHealthLabel(normalizedValue)}
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600">
            FinOps maturity level:{" "}
            <span className="text-blue-600 font-bold">{maturityLevel}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Score: {percentage}% ({totalScore}/{maxScore} points)
          </p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-500">
          Note: The gauge represents the overall FinOps maturity level based on
          the provided score.
        </p>
        <p className="text-xs text-gray-500">
          The score is calculated based on the total points achieved out of the
          maximum possible points.
        </p>
        <p className="text-xs text-gray-500">
          The maturity level is determined based on the overall score.
        </p>
        <p className="text-xs text-gray-500">
          The gauge is a visual representation of the FinOps maturity level.
        </p>
      </div>
    </div>
  )
}

export default GaugeMeter
