import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts"

const ReportCategoryBreakdown = ({ clientData }) => {
  const { reportMetadata, recommendations } = clientData

  // Extract category scores from the data
  const getCategoryScores = () => {
    if (!recommendations || !recommendations.categoryScores) {
      return []
    }

    // Transform the object into an array for the chart
    return Object.entries(recommendations.categoryScores).map(
      ([category, data]) => ({
        category,
        score: data.score,
        standardScore: 3.5, // Default industry standard benchmark
        gap: Math.max(0, 3.5 - data.score), // Calculate gap to standard
      })
    )
  }

  // Get color for score based on value
  const getScoreColor = (score) => {
    if (score < 2) return "#ef4444" // Red
    if (score < 3) return "#f59e0b" // Amber
    if (score < 4) return "#3b82f6" // Blue
    return "#10b981" // Green
  }

  // Format the insights for each category
  const getCategoryInsights = () => {
    // Map of category name to insights
    const insights = {
      "Cloud Strategy": {
        strengths: "Clear business case for cloud adoption.",
        weaknesses:
          "Limited alignment with broader digital transformation initiatives.",
        nextSteps:
          "Develop comprehensive governance framework with stakeholder buy-in.",
      },
      "Cloud Cost": {
        strengths: "Basic cost monitoring in place.",
        weaknesses: "Limited visibility across business units and projects.",
        nextSteps:
          "Implement tagging strategy and automated cost anomaly detection.",
      },
      "Cloud Security": {
        strengths: "Basic security controls implemented.",
        weaknesses: "Reactive approach to security vulnerabilities.",
        nextSteps:
          "Establish proactive security monitoring and compliance validation.",
      },
      "Cloud DevOps": {
        strengths: "Some automation for deployments.",
        weaknesses: "Manual processes causing delays and inconsistencies.",
        nextSteps:
          "Expand infrastructure-as-code coverage and CI/CD pipelines.",
      },
      "Cloud People": {
        strengths: "Technical teams have basic cloud skills.",
        weaknesses: "Skills gaps limiting advanced cloud capabilities.",
        nextSteps:
          "Develop structured cloud training program across technical teams.",
      },
    }

    // If we have real category scores, use them to customize insights
    const categoryScores = getCategoryScores()
    categoryScores.forEach((category) => {
      const score = category.score

      // Customize strength message based on score
      if (score >= 4) {
        insights[category.category].strengths +=
          " Excellent maturity in this dimension."
      } else if (score <= 2) {
        insights[category.category].strengths =
          "Limited strengths identified in this area."
      }

      // Customize weakness message based on score
      if (score <= 2) {
        insights[category.category].weaknesses +=
          " Significant gaps compared to industry benchmarks."
      } else if (score >= 4) {
        insights[category.category].weaknesses =
          "Minor improvement opportunities."
      }
    })

    return insights
  }

  // Prepare domain-specific insights
  const categoryInsights = getCategoryInsights()

  return (
    <div
      className="report-category-breakdown w-full h-full"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="bg-white p-8 h-full flex flex-col">
        {/* Page Header */}
        <div className="flex items-center border-b border-gray-200 pb-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-800">
              Category Breakdown
            </h1>
            <p className="text-sm text-gray-500">
              Detailed assessment results by cloud capability area
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            {reportMetadata.reportDate}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col">
          {/* Category Score Comparison Chart */}
          <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
            <h2 className="text-lg font-bold text-gray-700 mb-2">
              Category Performance Analysis
            </h2>
            <div style={{ height: "250px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={getCategoryScores()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    domain={[0, 5]}
                    label={{
                      value: "Maturity Score",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fontSize: 12 },
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "score")
                        return [`${value.toFixed(1)}/5.0`, "Your Score"]
                      if (name === "standardScore")
                        return [`${value.toFixed(1)}/5.0`, "Industry Benchmark"]
                      if (name === "gap")
                        return [`${value.toFixed(1)}`, "Gap to Benchmark"]
                      return [value, name]
                    }}
                  />
                  <Legend />
                  <Bar dataKey="score" name="Your Score" fill="#4F46E5" />
                  <Bar
                    dataKey="standardScore"
                    name="Industry Benchmark"
                    fill="#10B981"
                  />
                  <Bar dataKey="gap" name="Gap to Benchmark" fill="#F87171" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow overflow-y-auto">
            {Object.entries(categoryInsights).map(
              ([category, insights], index) => {
                // Find the matching category score
                const categoryData = getCategoryScores().find(
                  (item) => item.category === category
                ) || { score: 3, standardScore: 3.5 }

                return (
                  <div
                    key={category}
                    className="bg-gray-50 p-3 rounded-lg shadow border-l-4"
                    style={{
                      borderLeftColor: getScoreColor(categoryData.score),
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-bold text-gray-800">
                        {category}
                      </h3>
                      <div
                        className="px-2 py-1 rounded-lg font-bold text-white text-sm"
                        style={{
                          backgroundColor: getScoreColor(categoryData.score),
                        }}
                      >
                        {categoryData.score.toFixed(1)}/5.0
                      </div>
                    </div>

                    <div className="mt-2 space-y-2">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700">
                          STRENGTHS
                        </h4>
                        <p className="text-xs text-gray-600">
                          {insights.strengths}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-700">
                          IMPROVEMENT AREAS
                        </h4>
                        <p className="text-xs text-gray-600">
                          {insights.weaknesses}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-700">
                          NEXT STEPS
                        </h4>
                        <p className="text-xs text-gray-600">
                          {insights.nextSteps}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </div>

        {/* Interpretation Guide */}
        <div className="mt-6 border-t border-gray-200 pt-3 text-xs text-gray-600">
          <div className="grid grid-cols-4 gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span>Level 1 (0-2): Initial</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <span>Level 2 (2-3): Repeatable</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span>Level 3 (3-4): Defined</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span>Level 4+ (4-5): Managed/Optimizing</span>
            </div>
          </div>
        </div>

        {/* Page footer with page number */}
        <div className="text-right text-xs text-gray-400 mt-1">
          Page 4 | MakeStuffGo Cloud Assessment
        </div>
      </div>
    </div>
  )
}

export default ReportCategoryBreakdown
