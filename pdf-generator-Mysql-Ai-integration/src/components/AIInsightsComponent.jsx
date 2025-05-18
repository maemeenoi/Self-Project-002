// AIInsightsComponent.jsx
import React from "react"

/**
 * Component to display AI-generated FinOps insights
 * @param {Object} props
 * @param {Object} props.insights - The AI insights data
 * @param {boolean} props.isLoading - Loading state
 */
const AIInsightsComponent = ({ insights, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          AI-Powered Insights
        </h2>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-500">Generating FinOps insights...</p>
        </div>
      </div>
    )
  }

  // If no insights available
  if (!insights || !insights.analysis) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          AI-Powered Insights
        </h2>
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <p className="mt-2">
            AI insights are being generated. Check back soon.
          </p>
        </div>
      </div>
    )
  }

  const { analysis } = insights

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        AI-Powered FinOps Insights
      </h2>

      <div className="space-y-6">
        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">
            Executive Summary
          </h3>
          <p className="text-gray-700">{analysis.executiveSummary}</p>
        </div>

        {/* Overall Findings */}
        {analysis.overallFindings && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              Overall Findings
            </h3>
            <p className="text-gray-700">{analysis.overallFindings}</p>
          </div>
        )}

        {/* Strengths and Improvement Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-semibold text-green-800 mb-2">Key Strengths</h3>
            <ul className="space-y-2">
              {analysis.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvement Areas */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <h3 className="font-semibold text-amber-800 mb-2">
              Improvement Areas
            </h3>
            <ul className="space-y-2">
              {analysis.improvementAreas?.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">
            Strategic Recommendations
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {analysis.recommendations?.map((rec, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
              >
                <h4 className="font-medium text-gray-800">{rec.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {rec.pillar || ""}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                    {rec.priority || "Recommended"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Timeline */}
        {analysis.timelineSteps && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">
              Implementation Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {["30day", "60day", "90day", "Beyond 90 Days"].map(
                (timeframe, idx) =>
                  analysis.timelineSteps[timeframe] && (
                    <div key={idx} className="border rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center mr-2">
                          {idx + 1}
                        </div>
                        <h4 className="font-medium text-sm text-gray-800">
                          {timeframe === "30day"
                            ? "First 30 Days"
                            : timeframe === "60day"
                            ? "31-60 Days"
                            : timeframe === "90day"
                            ? "61-90 Days"
                            : timeframe === "Beyond 90 Days"
                            ? "Beyond 90 Days"
                            : ""}
                        </h4>
                      </div>
                      <ul className="space-y-1">
                        {analysis.timelineSteps[timeframe]?.map((step, i) => (
                          <li
                            key={i}
                            className="text-xs text-gray-600 flex items-start"
                          >
                            <span className="text-blue-500 mr-1">•</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIInsightsComponent
