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
import MVPMaturityTable from "./MVPMaturityTable"

const MVPExecutiveSummary = ({ clientData, page = 1 }) => {
  const { executiveSummary, cloudSpend, maturityAssessment } = clientData

  // Process data for pie chart
  const pieData = cloudSpend.byService
  const totalValue = pieData.reduce((sum, item) => sum + item.value, 0)

  // Colors for pie chart
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
      <div className="w-full h-full bg-white p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          {executiveSummary.sectionTitle || "Executive Summary"}
        </h1>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-500 mb-2">Overview</h2>
          <p className="text-gray-800">{overview.content}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h2 className="text-xl font-bold text-blue-500 mb-2">Purpose</h2>
            <p className="text-gray-800">{purpose.content}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Methodology
            </h2>
            <p className="text-gray-800">{methodology.content}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Primary Recommendations
            </h2>
            {Array.isArray(keyRecommendations.content) ? (
              <ul className="list-disc pl-5 space-y-2">
                {keyRecommendations.content.map((item, index) => (
                  <li key={index} className="text-gray-800">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-800">{keyRecommendations.content}</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Summary Findings
            </h2>
            {Array.isArray(summaryOfFindings.content) ? (
              <ul className="list-disc pl-5 space-y-2">
                {summaryOfFindings.content.map((item, index) => (
                  <li key={index} className="text-gray-800">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-800">{summaryOfFindings.content}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Page 2 content
  if (page === 2) {
    return (
      <div className="w-full h-full bg-white p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          {executiveSummary.sectionTitle || "Executive Summary"} (continued)
        </h1>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Key Metrics
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2 text-gray-800">
                <span className="font-medium">Total Cloud Spend:</span>{" "}
                {formatCurrency(cloudSpend.total)}
              </p>
              <p className="mb-2 text-gray-800">
                <span className="font-medium">Potential Annual Savings:</span>{" "}
                {formatCurrency(cloudSpend.annualSavingsOpportunity)}
              </p>
              <p className="text-gray-800">
                <span className="font-medium">Savings Percentage:</span>{" "}
                {Math.round(
                  (cloudSpend.annualSavingsOpportunity / cloudSpend.total) * 100
                )}
                %
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Expected Impact
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800">{expectedImpact.content}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 ">
          <div>
            <h2 className="text-xl font-bold text-blue-500 mb-2 ">
              Cloud Spend by Service
            </h2>
            <div
              className="bg-gray-50 p-4 rounded-lg border border-indigo-200"
              style={{ height: "350px" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 40, right: 30, left: 30, bottom: 20 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    outerRadius={120}
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
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-blue-500 mb-2">Trends</h2>
            <div
              className="bg-gray-50 p-4 rounded-lg border border-indigo-200"
              style={{ height: "350px" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
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
        </div>
      </div>
    )
  }

  // Page 3 content - Maturity Table
  if (page === 3) {
    return <MVPMaturityTable maturityData={maturityAssessment} />
  }

  // Default case
  return (
    <div className="w-full h-full bg-white p-8">
      <h1 className="text-3xl font-bold text-blue-600">Page not available</h1>
    </div>
  )
}

export default MVPExecutiveSummary
