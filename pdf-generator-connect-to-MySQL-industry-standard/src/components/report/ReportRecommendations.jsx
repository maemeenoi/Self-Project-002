import React from "react"

const ReportRecommendations = ({ clientData }) => {
  const { reportMetadata, recommendations } = clientData

  // Helper function to get priority class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-50 border-red-200 text-red-700"
      case "High":
        return "bg-orange-50 border-orange-200 text-orange-700"
      case "Medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-700"
      default:
        return "bg-blue-50 border-blue-200 text-blue-700"
    }
  }

  // Helper function to get priority badge class
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800"
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  // Organize recommendations by priority
  const getRecommendationsByPriority = () => {
    if (!recommendations || !recommendations.keyRecommendations) {
      return { Critical: [], High: [], Medium: [], Low: [] }
    }

    const grouped = {
      Critical: [],
      High: [],
      Medium: [],
      Low: [],
    }

    recommendations.keyRecommendations.forEach((rec) => {
      if (grouped[rec.priority]) {
        grouped[rec.priority].push(rec)
      } else {
        grouped.Low.push(rec)
      }
    })

    return grouped
  }

  // Get implementation roadmap phases
  const getImplementationPhases = () => {
    if (!recommendations || !recommendations.implementationRoadmap) {
      // Provide default implementation phases if not available
      return [
        {
          phase: "Immediate (0-30 days)",
          actions: [
            "Implement automated instance scheduling",
            "Standardize resource tagging",
          ],
        },
        {
          phase: "Short-term (1-3 months)",
          actions: [
            "Right-size oversized instances",
            "Implement storage lifecycle policies",
          ],
        },
        {
          phase: "Medium-term (3-6 months)",
          actions: [
            "Expand Infrastructure as Code (IaC) practices",
            "Implement cost anomaly detection",
          ],
        },
        {
          phase: "Long-term (6-12 months)",
          actions: [
            "Adopt FinOps best practices",
            "Enhance container orchestration",
          ],
        },
      ]
    }

    return recommendations.implementationRoadmap
  }

  const recommendationsByPriority = getRecommendationsByPriority()
  const implementationPhases = getImplementationPhases()

  return (
    <div
      className="report-recommendations w-full h-full"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="bg-white p-8 h-full flex flex-col">
        {/* Page Header */}
        <div className="flex items-center border-b border-gray-200 pb-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-800">
              Recommendations & Action Plan
            </h1>
            <p className="text-sm text-gray-500">
              Prioritized improvements for {reportMetadata.organizationName}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            {reportMetadata.reportDate}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col">
          {/* Implementation Roadmap */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow mb-6 border border-blue-100">
            <h2 className="text-lg font-bold text-blue-800 mb-3">
              Implementation Roadmap
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {implementationPhases.map((phase, index) => (
                <div key={index} className="relative">
                  {/* Phase header */}
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <h3 className="text-sm font-semibold text-blue-800 mt-1">
                      {phase.phase}
                    </h3>
                  </div>

                  {/* Phase content */}
                  <div className="bg-white p-3 rounded border border-blue-200 h-32 overflow-y-auto">
                    <ul className="text-xs space-y-2">
                      {phase.actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start">
                          <svg
                            className="h-3 w-3 text-blue-500 mt-0.5 mr-1 flex-shrink-0"
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
                          <span className="text-gray-700">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Connector line (except for last phase) */}
                  {index < implementationPhases.length - 1 && (
                    <div
                      className="absolute top-4 right-0 w-1/2 h-0.5 bg-blue-300 z-0"
                      style={{ left: "75%" }}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations By Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow overflow-y-auto">
            {/* Critical Priority */}
            <div
              className={`p-4 rounded-lg shadow ${
                recommendationsByPriority.Critical.length > 0
                  ? "bg-red-50 border border-red-200"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <h2 className="flex items-center text-lg font-bold text-red-800 mb-3">
                <svg
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.31-.876 2.31-1.993 0-.6-.238-1.169-.65-1.593M2.41 10.72a4.5 4.5 0 005.056 2.7 4.48 4.48 0 002.712-5.058 4.5 4.5 0 00-5.057-2.708A4.48 4.48 0 002.41 10.72z"
                  />
                </svg>
                Critical Priority
              </h2>

              {recommendationsByPriority.Critical.length > 0 ? (
                <div className="space-y-3">
                  {recommendationsByPriority.Critical.map((rec, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded border border-red-200"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold text-gray-800">
                          {rec.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadgeClass(
                            rec.priority
                          )}`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {rec.rationale}
                      </p>
                      <p className="text-xs font-medium text-gray-700 mt-1">
                        Impact: {rec.impact}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No critical priority recommendations
                </p>
              )}
            </div>

            {/* High Priority */}
            <div
              className={`p-4 rounded-lg shadow ${
                recommendationsByPriority.High.length > 0
                  ? "bg-orange-50 border border-orange-200"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <h2 className="flex items-center text-lg font-bold text-orange-800 mb-3">
                <svg
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.31-.876 2.31-1.993 0-.6-.238-1.169-.65-1.593M2.41 10.72a4.5 4.5 0 005.056 2.7 4.48 4.48 0 002.712-5.058 4.5 4.5 0 00-5.057-2.708A4.48 4.48 0 002.41 10.72z"
                  />
                </svg>
                High Priority
              </h2>

              {recommendationsByPriority.High.length > 0 ? (
                <div className="space-y-3">
                  {recommendationsByPriority.High.map((rec, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded border border-orange-200"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold text-gray-800">
                          {rec.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadgeClass(
                            rec.priority
                          )}`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {rec.rationale}
                      </p>
                      <p className="text-xs font-medium text-gray-700 mt-1">
                        Impact: {rec.impact}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No high priority recommendations
                </p>
              )}
            </div>

            {/* Medium Priority */}
            <div
              className={`p-4 rounded-lg shadow ${
                recommendationsByPriority.Medium.length > 0
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <h2 className="flex items-center text-lg font-bold text-yellow-800 mb-3">
                <svg
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Medium Priority
              </h2>

              {recommendationsByPriority.Medium.length > 0 ? (
                <div className="space-y-3">
                  {recommendationsByPriority.Medium.map((rec, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded border border-yellow-200"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold text-gray-800">
                          {rec.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadgeClass(
                            rec.priority
                          )}`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {rec.rationale}
                      </p>
                      <p className="text-xs font-medium text-gray-700 mt-1">
                        Impact: {rec.impact}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No medium priority recommendations
                </p>
              )}
            </div>

            {/* Standard/Low Priority */}
            <div
              className={`p-4 rounded-lg shadow ${
                recommendationsByPriority.Low.length > 0
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <h2 className="flex items-center text-lg font-bold text-blue-800 mb-3">
                <svg
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Standard Priority
              </h2>

              {recommendationsByPriority.Low.length > 0 ? (
                <div className="space-y-3">
                  {recommendationsByPriority.Low.map((rec, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded border border-blue-200"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold text-gray-800">
                          {rec.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadgeClass(
                            rec.priority
                          )}`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {rec.rationale}
                      </p>
                      <p className="text-xs font-medium text-gray-700 mt-1">
                        Impact: {rec.impact}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No standard priority recommendations
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps & Benefits */}
        <div className="mt-6 border-t border-gray-200 pt-3">
          <div className="flex space-x-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-700">
                Next Steps
              </h3>
              <ul className="mt-1 text-xs text-gray-600 space-y-1">
                {recommendations && recommendations.nextSteps ? (
                  recommendations.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-1">•</span> {step}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-1">•</span> Schedule
                      implementation planning session
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-1">•</span> Assign
                      responsibility for each recommendation
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-1">•</span> Establish
                      regular review cadence to track progress
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-700">
                Expected Benefits
              </h3>
              <ul className="mt-1 text-xs text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="text-green-500 mr-1">•</span> 20-35%
                  reduction in cloud operational costs
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-1">•</span> Improved
                  governance and compliance posture
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-1">•</span> Faster
                  time-to-market for new capabilities
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-1">•</span> Enhanced
                  security and risk management
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Page footer with page number */}
        <div className="text-right text-xs text-gray-400 mt-1">
          Page 5 | MakeStuffGo Cloud Assessment
        </div>
      </div>
    </div>
  )
}

export default ReportRecommendations
