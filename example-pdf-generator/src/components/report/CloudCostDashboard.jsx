import React, { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"

const CloudCostDashboard = ({ page = 1 }) => {
  // This would normally come from props or API, using our sample data directly
  const [clientData] = useState({
    reportMetadata: {
      organizationName: "Cloudy LTD",
      reportPeriod: "Q1 2025",
      reportDate: "April 14, 2025",
    },
    cloudSpend: {
      total: 1368390,
      annualSavingsOpportunity: 431580,
      byService: [
        { name: "Compute", value: 647500 },
        { name: "Storage", value: 312450 },
        { name: "Database", value: 218940 },
        { name: "Networking", value: 109500 },
        { name: "Other", value: 80000 },
      ],
      trends: [
        { name: "Q1 2024", spend: 162000, projected: 162000 },
        { name: "Q2 2024", spend: 173500, projected: 170000 },
        { name: "Q3 2024", spend: 485000, projected: 480000 },
        { name: "Q4 2024", spend: 547890, projected: 520000 },
        { name: "Q1 2025", spend: 1368390, projected: 1360000 },
        { name: "Q2 2025", spend: null, projected: 910000 },
      ],
    },
    cloudMaturityAssessment: {
      overallScore: 3.2,
      currentLevel: "Level 3: Established",
      subtopics: [
        {
          title: "Dimensional Analysis",
          dimensionalScores: [
            { dimension: "Cost Optimization", score: 2.7 },
            { dimension: "Security", score: 3.8 },
            { dimension: "Reliability", score: 3.6 },
            { dimension: "Performance", score: 3.1 },
            { dimension: "Operational Excellence", score: 3.0 },
            { dimension: "Sustainability", score: 2.8 },
          ],
        },
      ],
    },
    recommendations: {
      keyRecommendations: [
        {
          title: "Implement Automated Scaling",
          impact: "15% reduction in compute costs",
          priority: "Critical",
        },
        {
          title: "Schedule Non-Production Environments",
          impact: "68% reduction in non-production costs",
          priority: "Critical",
        },
        {
          title: "Standardize Tagging Strategy",
          impact: "Improved cost allocation and governance",
          priority: "High",
        },
        {
          title: "Expand Infrastructure as Code",
          impact: "75% reduction in provisioning time",
          priority: "High",
        },
        {
          title: "Implement Storage Lifecycle Management",
          impact: "25% reduction in storage costs",
          priority: "Medium",
        },
      ],
    },
  })

  // Process data for various charts
  const pieData = clientData.cloudSpend.byService
  const COLORS = ["#4FC3F7", "#4DB6AC", "#FFD54F", "#FF8A65", "#BA68C8"]
  const radarData =
    clientData.cloudMaturityAssessment.subtopics
      .find((topic) => topic.title === "Dimensional Analysis")
      ?.dimensionalScores.map((item) => ({
        dimension: item.dimension,
        score: item.score,
        fullMark: 5,
      })) || []

  // For savings potential chart
  const savingsData = [
    { name: "Current Spend", value: clientData.cloudSpend.total },
    {
      name: "Potential Savings",
      value: clientData.cloudSpend.annualSavingsOpportunity,
    },
    {
      name: "Optimized Cost",
      value:
        clientData.cloudSpend.total -
        clientData.cloudSpend.annualSavingsOpportunity,
    },
  ]

  // Group recommendations by priority for the bar chart
  const recommendationsByPriority = {
    Critical: clientData.recommendations.keyRecommendations.filter(
      (r) => r.priority === "Critical"
    ).length,
    High: clientData.recommendations.keyRecommendations.filter(
      (r) => r.priority === "High"
    ).length,
    Medium: clientData.recommendations.keyRecommendations.filter(
      (r) => r.priority === "Medium"
    ).length,
    Low: clientData.recommendations.keyRecommendations.filter(
      (r) => r.priority === "Low"
    )
      ? clientData.recommendations.keyRecommendations.filter(
          (r) => r.priority === "Low"
        ).length
      : 0,
  }

  const priorityData = Object.keys(recommendationsByPriority).map((key) => ({
    name: key,
    count: recommendationsByPriority[key],
  }))

  // Custom network visualization for the header
  const NetworkVisualization = () => (
    <svg
      className="w-full h-40"
      viewBox="0 0 800 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path
            d="M 30 0 L 0 0 0 30"
            fill="none"
            stroke="#4F8FEA"
            strokeWidth="0.5"
            opacity="0.2"
          />
        </pattern>
        <radialGradient
          id="networkGlow"
          cx="50%"
          cy="50%"
          r="50%"
          fx="50%"
          fy="50%"
        >
          <stop offset="0%" stopColor="#4F8FEA" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1A237E" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="200" fill="url(#grid)" />

      {/* Main central node */}
      <circle cx="400" cy="100" r="30" fill="url(#networkGlow)" />
      <circle cx="400" cy="100" r="10" fill="#4FC3F7" />

      {/* Connected nodes */}
      {[
        { x: 250, y: 70, size: 8 },
        { x: 300, y: 150, size: 7 },
        { x: 500, y: 60, size: 8 },
        { x: 550, y: 130, size: 6 },
        { x: 450, y: 170, size: 5 },
        { x: 200, y: 120, size: 6 },
        { x: 600, y: 80, size: 7 },
      ].map((node, i) => (
        <g key={i}>
          <line
            x1="400"
            y1="100"
            x2={node.x}
            y2={node.y}
            stroke="#4F8FEA"
            strokeWidth="2"
            opacity="0.5"
          />
          <circle
            cx={node.x}
            cy={node.y}
            r={node.size}
            fill="#4DB6AC"
            opacity="0.8"
          />
        </g>
      ))}

      {/* Data packets moving along lines */}
      {[
        { x1: 400, y1: 100, x2: 250, y2: 70, offset: 0.3 },
        { x1: 400, y1: 100, x2: 500, y2: 60, offset: 0.7 },
        { x1: 400, y1: 100, x2: 550, y2: 130, offset: 0.5 },
      ].map((path, i) => {
        const x = path.x1 + (path.x2 - path.x1) * path.offset
        const y = path.y1 + (path.y2 - path.y1) * path.offset
        return <circle key={`packet-${i}`} cx={x} cy={y} r="3" fill="#FFD54F" />
      })}
    </svg>
  )

  // Page 1 content - first 5 charts
  if (page === 1) {
    return (
      <div className="w-full h-full bg-white p-8">
        <div className="mb-6 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {clientData.reportMetadata.organizationName}
              </h1>
              <p className="text-blue-200">
                Cloud Cost Efficiency Dashboard -{" "}
                {clientData.reportMetadata.reportPeriod}
              </p>
            </div>
            <div>
              <p className="text-lg font-semibold">Total Cloud Spend:</p>
              <p className="text-2xl font-bold">
                ${clientData.cloudSpend.total.toLocaleString()}
              </p>
            </div>
          </div>
          <NetworkVisualization />
        </div>

        {/* Dashboard Grid - 2x2 layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Chart 1: Cloud Spend Distribution (Pie Chart) */}
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Cloud Spend Distribution
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Cost Trends (Line Chart) */}
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Cost Trends & Forecast
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientData.cloudSpend.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    stroke="#4FC3F7"
                    name="Actual Spend"
                    strokeWidth={2}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#4DB6AC"
                    name="Projected Spend"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Cloud Maturity Assessment (Radar Chart) */}
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Cloud Maturity Assessment
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  data={radarData}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} />
                  <Radar
                    name="Maturity Score"
                    dataKey="score"
                    stroke="#4FC3F7"
                    fill="#4FC3F7"
                    fillOpacity={0.6}
                  />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}/5.0`} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-600">
                Overall Maturity Score:{" "}
                <span className="font-bold">
                  {clientData.cloudMaturityAssessment.overallScore}/5.0
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Current Level:{" "}
                <span className="font-bold">
                  {clientData.cloudMaturityAssessment.currentLevel}
                </span>
              </p>
            </div>
          </div>

          {/* Chart 4: Savings Potential (Area Chart) */}
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Annual Savings Potential
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={savingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stackId="1"
                    stroke="#FF8A65"
                    fill="#FF8A65"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-600">
                Potential Annual Savings:{" "}
                <span className="font-bold text-green-600">
                  $
                  {clientData.cloudSpend.annualSavingsOpportunity.toLocaleString()}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Savings Percentage:{" "}
                <span className="font-bold text-green-600">
                  {(
                    (clientData.cloudSpend.annualSavingsOpportunity /
                      clientData.cloudSpend.total) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  // Page 2 content - second row of charts
  return (
    <div className="w-full h-full bg-white p-8">
      {/* Second row of charts */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Chart 5: Recommendations by Priority (Bar Chart) */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recommendations by Priority
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Number of Recommendations"
                  fill="#4FC3F7"
                  barSize={60}
                >
                  {priorityData.map((entry, index) => {
                    let color = "#4FC3F7"
                    if (entry.name === "Critical") color = "#FF5252"
                    if (entry.name === "High") color = "#FFD54F"
                    if (entry.name === "Medium") color = "#4DB6AC"
                    if (entry.name === "Low") color = "#9CCC65"
                    return <Cell key={`cell-${index}`} fill={color} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Total Recommendations:{" "}
              <span className="font-bold">
                {clientData.recommendations.keyRecommendations.length}
              </span>
            </p>
          </div>
        </div>

        {/* Chart 6: Key Recommendations Table */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Key Recommendations
          </h2>
          <div className="h-64 overflow-y-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Recommendation
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Impact
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clientData.recommendations.keyRecommendations.map(
                  (rec, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-2 px-4 text-sm text-gray-900">
                        {rec.title}
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-900">
                        {rec.impact}
                      </td>
                      <td className="py-2 px-4 text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          rec.priority === "Critical"
                            ? "bg-red-100 text-red-800"
                            : rec.priority === "High"
                            ? "bg-yellow-100 text-yellow-800"
                            : rec.priority === "Medium"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                        >
                          {rec.priority}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart 7: Spend vs Savings Comparison */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Spend vs Savings by Service
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clientData.cloudSpend.byService}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="value" name="Current Spend" fill="#4FC3F7" />
                {/* Simulating potential savings per service as it's not in the original data */}
                <Bar
                  dataKey="value"
                  name="Potential Savings"
                  fill="#FF8A65"
                  // Using a custom stackId and calculating a savings percentage
                  stackId="a"
                  // This transforms the original value to show only the "savings" portion
                  data={clientData.cloudSpend.byService.map((item) => ({
                    ...item,
                    value: item.value * (Math.random() * 0.2 + 0.1), // Simulating 10-30% savings
                  }))}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 8: Implementation Timeline */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Implementation Timeline
          </h2>
          <div className="h-64 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute h-1 w-full bg-gray-200 top-1/2 transform -translate-y-1/2"></div>

                  {/* Timeline nodes */}
                  <div className="relative flex justify-between">
                    {/* Immediate */}
                    <div className="text-center">
                      <div className="bg-blue-500 h-6 w-6 rounded-full mx-auto mb-2 border-4 border-white"></div>
                      <div className="text-xs font-medium">
                        Immediate
                        <br />
                        (0-30 days)
                      </div>
                      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100 text-xs w-24">
                        Auto-scaling setup
                      </div>
                    </div>

                    {/* Short-term */}
                    <div className="text-center">
                      <div className="bg-green-500 h-6 w-6 rounded-full mx-auto mb-2 border-4 border-white"></div>
                      <div className="text-xs font-medium">
                        Short-term
                        <br />
                        (1-3 months)
                      </div>
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-100 text-xs w-24">
                        Tagging strategy
                      </div>
                    </div>

                    {/* Medium-term */}
                    <div className="text-center">
                      <div className="bg-yellow-500 h-6 w-6 rounded-full mx-auto mb-2 border-4 border-white"></div>
                      <div className="text-xs font-medium">
                        Medium-term
                        <br />
                        (3-6 months)
                      </div>
                      <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-100 text-xs w-24">
                        Expand IaC
                      </div>
                    </div>

                    {/* Long-term */}
                    <div className="text-center">
                      <div className="bg-red-500 h-6 w-6 rounded-full mx-auto mb-2 border-4 border-white"></div>
                      <div className="text-xs font-medium">
                        Long-term
                        <br />
                        (6-12 months)
                      </div>
                      <div className="mt-2 p-2 bg-red-50 rounded border border-red-100 text-xs w-24">
                        FinOps integration
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>
          Generated by MakeStuffGo on {clientData.reportMetadata.reportDate}
        </p>
        <p className="font-semibold mt-1">
          Ensuring every dollar you spend on the cloud is working as hard as you
        </p>
      </div>
    </div>
  )
}

export default CloudCostDashboard
// Note: This component is a simplified example and does not include all the
