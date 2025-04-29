import React from "react"

const MVPRecommendationsActionPlan = ({ clientData }) => {
  const { recommendations } = clientData

  // Group recommendations by priority for the priority matrix
  const priorityMatrix = {
    Critical: recommendations.keyRecommendations.filter(
      (rec) => rec.priority === "Critical"
    ),
    High: recommendations.keyRecommendations.filter(
      (rec) => rec.priority === "High"
    ),
    Medium: recommendations.keyRecommendations.filter(
      (rec) => rec.priority === "Medium"
    ),
    Standard: recommendations.keyRecommendations.filter(
      (rec) => rec.priority === "Standard"
    ),
  }

  // Helper function to format currency
  const formatCurrency = (value) => {
    return `$${value?.toLocaleString() || "0"}`
  }

  return (
    <div className="w-full h-full bg-white p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        {recommendations.sectionTitle}
      </h1>

      <div className="grid grid-cols-2 gap-6 h-full">
        {/* Left Column */}
        <div className="flex flex-col">
          {/* Implementation Priority Matrix */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-blue-500 mb-2">
              Implementation Priority Matrix
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Critical Priority */}
              <div className="bg-red-50 p-2 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-600 mb-1 text-xs">
                  Critical Priority
                </h3>
                <ul className="list-disc pl-4 text-xs">
                  {priorityMatrix.Critical.map((rec, index) => (
                    <li key={index} className="text-gray-700 mb-0.5">
                      {rec.title}
                    </li>
                  ))}
                  {priorityMatrix.Critical.length === 0 && (
                    <li className="text-gray-500 italic">None identified</li>
                  )}
                </ul>
              </div>

              {/* High Priority */}
              <div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
                <h3 className="font-bold text-orange-600 mb-1 text-xs">
                  High Priority
                </h3>
                <ul className="list-disc pl-4 text-xs">
                  {priorityMatrix.High.map((rec, index) => (
                    <li key={index} className="text-gray-700 mb-0.5">
                      {rec.title}
                    </li>
                  ))}
                  {priorityMatrix.High.length === 0 && (
                    <li className="text-gray-500 italic">None identified</li>
                  )}
                </ul>
              </div>

              {/* Medium Priority */}
              <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                <h3 className="font-bold text-yellow-600 mb-1 text-xs">
                  Medium Priority
                </h3>
                <ul className="list-disc pl-4 text-xs">
                  {priorityMatrix.Medium.map((rec, index) => (
                    <li key={index} className="text-gray-700 mb-0.5">
                      {rec.title}
                    </li>
                  ))}
                  {priorityMatrix.Medium.length === 0 && (
                    <li className="text-gray-500 italic">None identified</li>
                  )}
                </ul>
              </div>

              {/* Standard Priority */}
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-600 mb-1 text-xs">
                  Standard Priority
                </h3>
                <ul className="list-disc pl-4 text-xs">
                  {priorityMatrix.Standard.map((rec, index) => (
                    <li key={index} className="text-gray-700 mb-0.5">
                      {rec.title}
                    </li>
                  ))}
                  {priorityMatrix.Standard.length === 0 && (
                    <li className="text-gray-500 italic">None identified</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

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
        </div>

        {/* Right Column */}
        <div className="flex flex-col">
          {/* Implementation Roadmap */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-blue-500 mb-2">
              Implementation Roadmap
            </h2>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex justify-between">
                {recommendations.implementationRoadmap.map((phase, index) => (
                  <div
                    key={index}
                    className="text-center"
                    style={{ width: "22%" }}
                  >
                    <h3 className="text-xs font-bold text-blue-600 mb-1">
                      {phase.phase}
                    </h3>
                    <div className="bg-white p-1 rounded border border-blue-100 text-xs text-left h-24 overflow-y-auto">
                      <ul className="list-disc pl-3 text-xs">
                        {phase.actions.map((action, i) => (
                          <li key={i} className="mb-1 text-gray-700 text-xs">
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Recommendations */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-blue-500 mb-2">
              Additional Recommendations
            </h2>
            <div className="space-y-2">
              {recommendations.keyRecommendations
                .slice(2, 4)
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

          {/* Next Steps */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-blue-500 mb-2">Next Steps</h2>
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
              <ul className="list-disc pl-4">
                {recommendations.nextSteps.map((step, index) => (
                  <li key={index} className="text-gray-800 mb-1 text-xs">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MVPRecommendationsActionPlan
