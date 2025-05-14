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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import GaugeMeter from "../GaugeMeter"

// Helper component for the maturity gauge
const MaturityGauge = ({ score = 3.2, maxValue = 5 }) => {
  // Calculate angles for semi-circular gauge
  const normalizedValue = Math.max(0, Math.min(maxValue, parseFloat(score)))
  const needleAngle = -180 + (normalizedValue / maxValue) * 180

  // Map level descriptions
  const getLevelDescription = (score) => {
    if (score < 2) return "Level 1: Initial"
    if (score < 3) return "Level 2: Repeatable"
    if (score < 4) return "Level 3: Defined"
    if (score < 4.6) return "Level 4: Managed"
    return "Level 5: Optimized"
  }

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 220 120"
        className="w-full"
        style={{ maxWidth: "300px" }}
      >
        {/* Gradient background for gauge */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="33%" stopColor="#f59e0b" />
            <stop offset="66%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Gauge background arc */}
        <path
          d="M 20 100 A 90 90 0 0 1 200 100"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Gauge value arc */}
        <path
          d={`M 20 100 A 90 90 0 0 1 ${
            20 + 180 * (normalizedValue / maxValue)
          } ${100 - Math.sin((Math.PI * normalizedValue) / maxValue) * 90}`}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Gauge needle */}
        <line
          x1="110"
          y1="100"
          x2={110 + Math.cos((needleAngle * Math.PI) / 180) * 80}
          y2={100 + Math.sin((needleAngle * Math.PI) / 180) * 80}
          stroke="#374151"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Needle pivot */}
        <circle cx="110" cy="100" r="8" fill="#374151" />

        {/* Level markers */}
        {[0, 1, 2, 3, 4, 5].map((level) => {
          const angle = -180 + (level / maxValue) * 180
          const x = 110 + Math.cos((angle * Math.PI) / 180) * 90
          const y = 100 + Math.sin((angle * Math.PI) / 180) * 90

          return (
            <g key={level}>
              <circle cx={x} cy={y} r="3" fill="#1f2937" />
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fill="#1f2937"
                fontSize="10"
              >
                {level}
              </text>
            </g>
          )
        })}

        {/* Score display */}
        <text
          x="110"
          y="70"
          textAnchor="middle"
          fill="#1f2937"
          fontSize="24"
          fontWeight="bold"
        >
          {normalizedValue.toFixed(1)}
        </text>
      </svg>

      <div className="text-center mt-2">
        <div className="text-lg font-bold text-gray-800">
          {getLevelDescription(normalizedValue)}
        </div>
      </div>
    </div>
  )
}

const ReportMaturityAssessment = ({ clientData }) => {
  const { cloudMaturityAssessment } = clientData

  // Get dimensional scores data for radar chart
  const dimensionalScores = cloudMaturityAssessment.dimensionalScores

  // Get level descriptions for maturity level grid
  const maturityLevels = [
    {
      level: 1,
      name: "Initial",
      description: "Ad hoc processes with minimal formalization",
    },
    {
      level: 2,
      name: "Repeatable",
      description: "Basic processes documented with some consistency",
    },
    {
      level: 3,
      name: "Defined",
      description: "Standardized processes with improved collaboration",
    },
    {
      level: 4,
      name: "Managed",
      description: "Measured and controlled practices with metrics",
    },
    {
      level: 5,
      name: "Optimized",
      description: "Continuous improvement with proactive adaptation",
    },
  ]

  return (
    <div
      className="report-maturity-page w-full h-full"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="bg-white p-8 h-full flex flex-col">
        {/* Page Header */}
        <div className="flex items-center border-b border-gray-200 pb-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-800">
              Cloud Maturity Assessment
            </h1>
            <p className="text-sm text-gray-500">
              Analysis of {clientData.reportMetadata.organizationName}'s cloud
              maturity
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            {clientData.reportMetadata.reportDate}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 flex-grow">
          {/* Left Column */}
          <div className="flex flex-col">
            {/* Maturity Gauge */}
            <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">
                Overall Cloud Maturity Score
              </h2>
              <GaugeMeter score={cloudMaturityAssessment.overallScore} />
              <p className="mt-4 text-sm text-gray-600 text-center italic">
                Based on comprehensive assessment across multiple cloud
                dimensions
              </p>
            </div>

            {/* Maturity Level Table */}
            <div className="bg-gray-50 p-4 rounded-lg shadow flex-grow overflow-hidden">
              <h2 className="text-lg font-bold text-gray-700 mb-4">
                Maturity Level Framework
              </h2>
              <div className="overflow-y-auto h-full max-h-48">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-700 font-semibold">
                        Level
                      </th>
                      <th className="px-3 py-2 text-left text-gray-700 font-semibold">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-gray-700 font-semibold">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {maturityLevels.map((level) => (
                      <tr
                        key={level.level}
                        className={`border-b ${
                          cloudMaturityAssessment.currentLevel.includes(
                            `Level ${level.level}:`
                          )
                            ? "bg-blue-50 font-medium"
                            : ""
                        }`}
                      >
                        <td className="px-3 py-2">{level.level}</td>
                        <td className="px-3 py-2">{level.name}</td>
                        <td className="px-3 py-2">{level.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            {/* Radar Chart */}
            <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-bold text-gray-700 mb-2">
                Cloud Dimensional Analysis
              </h2>
              <div style={{ height: "240px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={dimensionalScores}
                    margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                  >
                    <PolarGrid gridType="polygon" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fontSize: 10, fill: "#374151" }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 5]}
                      tick={{ fontSize: 10, fill: "#4b5563" }}
                    />
                    <Radar
                      name="Client Score"
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
              <p className="mt-2 text-xs text-gray-500 italic text-center">
                Comparison of your organization's cloud capabilities across key
                dimensions versus industry standards
              </p>
            </div>

            {/* Dimension Scores Bar Chart */}
            <div className="bg-gray-50 p-4 rounded-lg shadow flex-grow">
              <h2 className="text-lg font-bold text-gray-700 mb-2">
                Dimension Comparison
              </h2>
              <div style={{ height: "200px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dimensionalScores}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      domain={[0, 5]}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="dimension"
                      tick={{ fontSize: 10 }}
                      width={100}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="score"
                      name="Your Score"
                      fill="#6366F1"
                      barSize={15}
                    />
                    <Bar
                      dataKey="standardScore"
                      name="Industry Benchmark"
                      fill="#10B981"
                      barSize={15}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with next steps */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Recommended Next Steps:
          </h3>
          <p className="text-xs text-gray-600">
            This assessment identifies your organization as{" "}
            {cloudMaturityAssessment.currentLevel}. Focus on improving the
            lowest dimensions first to achieve balanced growth in cloud
            capabilities.
          </p>
        </div>

        {/* Page footer with page number */}
        <div className="text-right text-xs text-gray-400 mt-2">
          Page 3 | MakeStuffGo Cloud Assessment
        </div>
      </div>
    </div>
  )
}

export default ReportMaturityAssessment
