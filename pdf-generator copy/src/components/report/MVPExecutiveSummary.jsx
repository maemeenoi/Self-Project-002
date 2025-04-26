import React from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

const MVPExecutiveSummary = ({ clientData, page = 1 }) => {
  const { executiveSummary, cloudSpend, recommendations } = clientData

  // Process data for pie chart
  const pieData = cloudSpend.byService
  const COLORS = ["#4FC3F7", "#4DB6AC", "#FFD54F", "#FF8A65", "#BA68C8"]

  // Line chart data for cost trends
  const lineData = cloudSpend.trends

  // Helper function to format currency
  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`
  }

  // Helper function to find content sections
  const findSection = (title) => {
    return (
      executiveSummary.subtopics.find((topic) => topic.title === title) || {
        content: "Not available",
      }
    )
  }

  // Get the specific sections
  const overview = findSection("Overview")
  const purpose = findSection("Purpose")
  const methodology = findSection("Methodology")
  const keyRecommendations = findSection("Key Recommendations")
  const summaryOfFindings = findSection("Summary of Findings")
  const expectedImpact = findSection("Expected Impact")

  // Page 1 content
  if (page === 1) {
    return (
      <div className="w-full h-full bg-white p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          {executiveSummary.sectionTitle || "Executive Summary"}
        </h1>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-blue-500 mb-1">Overview</h2>
          <p className="text-sm text-gray-800">{overview.content}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <h2 className="text-lg font-bold text-blue-500 mb-1">Purpose</h2>
            <p className="text-sm text-gray-800">{purpose.content}</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-blue-500 mb-1">
              Methodology
            </h2>
            <p className="text-sm text-gray-800">{methodology.content}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-bold text-blue-500 mb-1">
              Primary Recommendations
            </h2>
            {Array.isArray(keyRecommendations.content) ? (
              <ul className="list-disc pl-5 space-y-1">
                {keyRecommendations.content.map((item, index) => (
                  <li key={index} className="text-sm text-gray-800">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-800">
                {keyRecommendations.content}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-blue-500 mb-1">
              Summary Findings
            </h2>
            {Array.isArray(summaryOfFindings.content) ? (
              <ul className="list-disc pl-5 space-y-1">
                {summaryOfFindings.content.map((item, index) => (
                  <li key={index} className="text-sm text-gray-800">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-800">
                {summaryOfFindings.content}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Page 2 content
  if (page === 2) {
    return (
      <div className="w-full h-full bg-white p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          {executiveSummary.sectionTitle || "Executive Summary"} (continued)
        </h1>

        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Key Recommendations with Rationale */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-blue-500 mb-2">
              Key Recommendations with Rationale
            </h2>
            <div className="space-y-2">
              {recommendations.keyRecommendations
                .slice(0, 2)
                .map((rec, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-2 rounded-lg border border-gray-200"
                  >
                    <h3 className="font-bold text-blue-600 text-sm">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-gray-700 mt-1">
                      {rec.rationale}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        Impact: {rec.impact}
                      </span>
                      <span
                        className={`text-xs px-1 py-0.5 rounded ${
                          rec.priority === "Critical"
                            ? "bg-red-100 text-red-700"
                            : rec.priority === "High"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-blue-500 mb-2">
              Expected Impact
            </h2>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-800">{expectedImpact.content}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-bold text-blue-500 mb-2">
              Cloud Spend by Service
            </h2>
            <div
              className="bg-gray-50 p-3 rounded-lg border border-indigo-200"
              style={{ height: "240px" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={true}
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
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    fontSize="10px"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-blue-500 mb-2">
              Cost Trends
            </h2>
            <div
              className="bg-gray-50 p-3 rounded-lg border border-indigo-200"
              style={{ height: "240px" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis
                    tickFormatter={(value) => `$${value / 1000}k`}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
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
        </div>
      </div>
    )
  }

  // Default case
  return (
    <div className="w-full h-full bg-white p-6">
      <h1 className="text-2xl font-bold text-blue-600">Page not available</h1>
    </div>
  )
}

export default MVPExecutiveSummary
