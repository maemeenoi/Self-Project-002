// components/FinOpsPillarDetailsTable.jsx
import React from "react"

const FinOpsPillarDetailsTable = ({
  pillars,
  getMaturityColor,
  title = "FinOps Pillar Details",
}) => {
  // Return null if no pillars data to render
  if (!pillars || pillars.length === 0) {
    return null
  }

  // Helper function to get badge class based on maturity level
  const getMaturityBadgeClass = (maturityLevel) => {
    switch (maturityLevel) {
      case "High":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-orange-100 text-orange-800"
      case "Low":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>FinOps Pillar</th>
              <th>Score</th>
              <th>Max Score</th>
              <th>Percentage</th>
              <th>Maturity Level</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            {pillars.map((pillar, index) => (
              <tr key={index}>
                <td>
                  <div>
                    <div className="font-medium">{pillar.name}</div>
                    <div className="text-sm text-gray-500">
                      {pillar.description}
                    </div>
                  </div>
                </td>
                <td className="font-medium">{pillar.score}</td>
                <td>{pillar.maxScore}</td>
                <td>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">
                      {pillar.percentage}%
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${pillar.percentage}%`,
                          backgroundColor: getMaturityColor(
                            pillar.maturityLevel
                          ),
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getMaturityBadgeClass(
                      pillar.maturityLevel
                    )}`}
                  >
                    {pillar.maturityLevel}
                  </span>
                </td>
                <td>{pillar.responses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Note: The maturity levels are based on the percentage of the score
          achieved compared to the maximum score.
        </p>
        <p className="text-sm text-gray-500">
          The maturity levels are categorized as High, Medium, and Low based on
          the percentage of the score achieved.
        </p>
      </div>
    </div>
  )
}

export default FinOpsPillarDetailsTable
