import React from "react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const ReportExecutiveSummary = ({ clientData }) => {
  const { executiveSummary, cloudMaturityAssessment, recommendations } =
    clientData
  const { reportMetadata } = clientData

  // Get key findings for the summary
  const getKeyFindings = () => {
    if (executiveSummary && executiveSummary.subtopics) {
      const summaryTopic = executiveSummary.subtopics.find(
        (topic) => topic.title === "Summary of Findings"
      )

      if (summaryTopic && Array.isArray(summaryTopic.content)) {
        return summaryTopic.content
      } else if (summaryTopic && typeof summaryTopic.content === "string") {
        return [summaryTopic.content]
      }
    }

    // Fallback findings based on maturity score
    const score = cloudMaturityAssessment.overallScore

    return [
      `Overall cloud maturity score is ${score.toFixed(1)}/5.0, indicating ${
        score < 3 ? "room for improvement" : "a solid foundation"
      }.`,
      `${
        score < 3 ? "Significant" : "Some"
      } opportunities identified to enhance cloud governance and cost optimization.`,
      `Cloud strategy alignment with business goals needs ${
        score < 3 ? "significant attention" : "continued focus"
      }.`,
    ]
  }

  // Get top recommendations
  const getTopRecommendations = () => {
    if (recommendations && recommendations.keyRecommendations) {
      return recommendations.keyRecommendations.slice(0, 4)
    }
    return []
  }

  return (
    <div
      className="report-executive-summary w-full h-full"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="bg-white p-8 h-full flex flex-col">
        {/* Page Header */}
        <div className="flex items-center border-b border-gray-200 pb-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-800">
              Executive Summary
            </h1>
            <p className="text-sm text-gray-500">
              Cloud assessment overview for {reportMetadata.organizationName}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            {reportMetadata.reportDate}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-6 flex-grow">
          {/* Left Column - Overview & Key Findings */}
          <div className="flex flex-col">
            {/* Overview */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-bold mb-2">Assessment Overview</h2>
              <p className="text-sm">
                This report presents an assessment of{" "}
                {reportMetadata.organizationName}'s cloud infrastructure
                maturity based on industry standards and best practices. The
                assessment covers key areas including cloud strategy, cost
                management, security, operations, and technical implementation.
              </p>

              <div className="mt-3 flex justify-between items-center">
                <div>
                  <span className="text-xs opacity-80">
                    Overall Maturity Score
                  </span>
                  <div className="text-2xl font-bold">
                    {cloudMaturityAssessment.overallScore.toFixed(1)}/5.0
                  </div>
                </div>
                <div>
                  <span className="text-xs opacity-80">
                    Current Maturity Level
                  </span>
                  <div className="text-lg font-semibold">
                    {cloudMaturityAssessment.currentLevel.split(":")[0]}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Findings */}
            <div className="bg-gray-50 p-4 rounded-lg shadow flex-grow">
              <h2 className="text-lg font-bold text-gray-700 mb-3">
                Key Findings
              </h2>
              <ul className="space-y-2">
                {getKeyFindings().map((finding, index) => (
                  <li key={index} className="text-sm flex items-start">
                    <div className="text-blue-500 mr-2 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">{finding}</span>
                  </li>
                ))}
              </ul>

              {/* Maturity Level Description */}
              <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-700 mb-1">
                  Current Maturity State: {cloudMaturityAssessment.currentLevel}
                </h3>
                <p className="text-xs text-blue-800">
                  {cloudMaturityAssessment.overallScore < 2
                    ? "Initial stage with ad-hoc processes and limited standardization."
                    : cloudMaturityAssessment.overallScore < 3
                    ? "Repeatable processes with basic documentation and some consistency."
                    : cloudMaturityAssessment.overallScore < 4
                    ? "Defined processes with standardization and improved collaboration."
                    : cloudMaturityAssessment.overallScore < 4.6
                    ? "Managed processes with metrics-driven optimization."
                    : "Optimizing with continuous improvement and proactive adaptation."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Charts & Recommendations */}
          <div className="flex flex-col">
            {/* Top Recommendations */}
            <div className="bg-gray-50 p-4 rounded-lg shadow flex-grow">
              <h2 className="text-lg font-bold text-gray-700 mb-3">
                Key Recommendations
              </h2>
              <div className="space-y-3 overflow-y-auto max-h-48">
                {getTopRecommendations().map((rec, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded border ${
                      rec.priority === "Critical"
                        ? "bg-red-50 border-red-200"
                        : rec.priority === "High"
                        ? "bg-orange-50 border-orange-200"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-medium">{rec.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          rec.priority === "Critical"
                            ? "bg-red-100 text-red-800"
                            : rec.priority === "High"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Impact: {rec.impact}
                    </p>
                  </div>
                ))}
              </div>

              {getTopRecommendations().length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No recommendations available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="mt-6 border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-500">
            This executive summary provides an overview of the cloud assessment
            results. Detailed analysis and recommendations are available in the
            following pages.
          </p>
        </div>

        {/* Page footer with page number */}
        <div className="text-right text-xs text-gray-400 mt-1">
          Page 2 | MakeStuffGo Cloud Assessment
        </div>
      </div>
    </div>
  )
}

export default ReportExecutiveSummary
