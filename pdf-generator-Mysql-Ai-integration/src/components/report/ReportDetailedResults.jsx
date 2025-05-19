import React from "react"

const ReportDetailedResults = ({ clientData }) => {
  const { reportMetadata, recommendations } = clientData

  // Group responses by category
  const getGroupedResponse = () => {
    if (!recommendations || !recommendations.responses) {
      return {}
    }

    // Filter to include only assessment questions (QuestionID >= 6)
    const assessmentResponse = recommendations.responses.filter(
      (response) => response.QuestionID >= 6
    )

    // Group by category
    const groupedByCategory = {}

    assessmentResponse.forEach((response) => {
      const categoryMatch = response.QuestionText.match(/\[(.*?)\]/)
      let category = "Uncategorized"

      // Try to extract category from question text if it's in [Category] format
      if (categoryMatch && categoryMatch[1]) {
        category = categoryMatch[1]
      } else {
        // Fallback to using QuestionID ranges to determine category
        if (response.QuestionID >= 6 && response.QuestionID <= 8) {
          category = "Cloud Strategy"
        } else if (response.QuestionID >= 9 && response.QuestionID <= 11) {
          category = "Cloud Cost"
        } else if (response.QuestionID >= 12 && response.QuestionID <= 13) {
          category = "Cloud Security"
        } else if (response.QuestionID >= 14 && response.QuestionID <= 15) {
          category = "Cloud People"
        } else if (response.QuestionID >= 16 && response.QuestionID <= 20) {
          category = "Cloud DevOps"
        }
      }

      // Initialize category array if it doesn't exist
      if (!groupedByCategory[category]) {
        groupedByCategory[category] = []
      }

      groupedByCategory[category].push(response)
    })

    return groupedByCategory
  }

  // Helper function to get status badge based on scores
  const getStatusBadge = (response) => {
    if (!response.Score || !response.StandardScore) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
          No Data
        </span>
      )
    }

    if (response.Score > response.StandardScore) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
          Above Standard
        </span>
      )
    } else if (response.Score === response.StandardScore) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
          Meets Standard
        </span>
      )
    } else {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
          Below Standard
        </span>
      )
    }
  }

  // Helper function to get score color based on value
  const getScoreColor = (score) => {
    if (!score) return "text-gray-400"
    if (score < 2) return "text-red-600"
    if (score < 3) return "text-yellow-600"
    if (score < 4) return "text-blue-600"
    return "text-green-600"
  }

  const groupedResponse = getGroupedResponse()
  const categories = Object.keys(groupedResponse)

  return (
    <div
      className="report-detailed-results w-full h-full"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="bg-white p-8 h-full flex flex-col">
        {/* Page Header */}
        <div className="flex items-center border-b border-gray-200 pb-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-800">
              Detailed Assessment Results
            </h1>
            <p className="text-sm text-gray-500">
              Complete question responses for {reportMetadata.organizationName}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            {reportMetadata.reportDate}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow overflow-y-auto">
          {categories.length > 0 ? (
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category}>
                  <h2 className="text-lg font-bold text-blue-700 mb-3 flex items-center">
                    <svg
                      className="h-5 w-5 mr-1 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    {category}
                  </h2>

                  <div className="bg-gray-50 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Question
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
                          >
                            Score
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
                          >
                            Standard
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {groupedResponse[category].map((response, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-4 py-3 text-sm text-gray-800">
                              {/* Remove category tag from question if present */}
                              {response.QuestionText.replace(/\[.*?\]\s*/, "")}
                            </td>
                            <td
                              className={`px-4 py-3 text-sm font-medium text-center ${getScoreColor(
                                response.Score
                              )}`}
                            >
                              {response.Score || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">
                              {response.StandardScore || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {getStatusBadge(response)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <svg
                className="h-16 w-16 text-gray-300 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="mt-4 text-gray-500">
                No detailed responses available
              </p>
            </div>
          )}
        </div>

        {/* Score Legend */}
        <div className="mt-6 border-t border-gray-200 pt-3">
          <div className="flex justify-between text-xs text-gray-600">
            <div className="flex space-x-4">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                <span>Score 1: Initial</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                <span>Score 2-3: Developing</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                <span>Score 4: Established</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                <span>Score 5: Advanced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page footer with page number */}
        <div className="text-right text-xs text-gray-400 mt-1">
          Page 6 | MakeStuffGo Cloud Assessment
        </div>
      </div>
    </div>
  )
}

export default ReportDetailedResults
