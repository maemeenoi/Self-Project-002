// components/FinOpsKeyRecommendations.jsx
import React from "react"

const FinOpsKeyRecommendations = ({
  recommendations,
  title = "Key FinOps Recommendations",
}) => {
  // Return null if no recommendations to render
  if (!recommendations || recommendations.length === 0) {
    return null
  }
  // Helper to get priority styling
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800"
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800" // Default style for any other priority
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">{title}</h2>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">
                  {rec.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{rec.rationale}</p>
                <p className="text-sm font-medium text-blue-600">
                  Description: {rec.description}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityStyle(
                  rec.priority
                )}`}
              >
                {rec.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-500">
          Note: The recommendations are based on the current maturity level and
          should be prioritized based on your organization's specific needs and
          goals.
        </p>
      </div>
    </div>
  )
}

export default FinOpsKeyRecommendations
