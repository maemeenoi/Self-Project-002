// components/FinOpsImplementationRoadmap.jsx
import React from "react"

const FinOpsImplementationRoadmap = ({
  roadmap,
  title = "FinOps Implementation Roadmap",
  columnConfig = {
    default: 1,
    md: 2,
    lg: 4,
  },
}) => {
  // Return null if no roadmap data to render
  if (!roadmap || roadmap.length === 0) {
    return null
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">{title}</h2>
      <div
        className={`grid grid-cols-${columnConfig.default} md:grid-cols-${columnConfig.md} lg:grid-cols-${columnConfig.lg} gap-4`}
      >
        {roadmap.map((phase, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center mr-3">
                {index + 1}
              </div>
              <h3 className="font-semibold text-sm text-gray-800">
                {phase.phase}
              </h3>
            </div>
            <ul className="space-y-2">
              {phase.actions.map((action, actionIndex) => (
                <li
                  key={actionIndex}
                  className="text-xs text-gray-600 flex items-start"
                >
                  <span className="text-blue-500 mr-1">•</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-500">
          Note: The roadmap is a suggested implementation path and can be
          adjusted based on your organization's specific needs and priorities.
        </p>
      </div>
    </div>
  )
}

export default FinOpsImplementationRoadmap
