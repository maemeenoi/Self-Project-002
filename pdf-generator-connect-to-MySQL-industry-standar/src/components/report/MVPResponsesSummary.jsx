"use client"

export default function MVPResponsesSummaryForPDF({ responses, page = 1 }) {
  if (!responses || responses.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No responses available to display.
      </div>
    )
  }

  // Only include real assessment questions (QuestionID >= 6)
  const filteredResponses = responses.filter(
    (response) => response.QuestionID >= 6
  )

  if (filteredResponses.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No responses available for questions 6 and onward.
      </div>
    )
  }

  // Split with 7 items on the first page and the rest on the second
  const firstPageItems = 7
  const firstPage = filteredResponses.slice(0, firstPageItems)
  const secondPage = filteredResponses.slice(firstPageItems)

  if (page === 1) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">
          Responses Summary
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border-b border-gray-300 p-3 text-left">
                  Question
                </th>
                <th className="border-b border-gray-300 p-3 text-left">
                  Client Score
                </th>
                <th className="border-b border-gray-300 p-3 text-left">
                  Industry Standard
                </th>
              </tr>
            </thead>
            <tbody>
              {firstPage.map((response) => (
                <tr key={response.ResponseID} className="hover:bg-gray-50">
                  <td className="border-b border-gray-300 p-3">
                    {response.QuestionText}
                  </td>
                  <td className="border-b border-gray-300 p-3">
                    {response.Score !== null ? response.Score : "N/A"}
                  </td>
                  <td className="border-b border-gray-300 p-3">
                    {response.StandardText || "No standard available"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Page 2
  if (page === 2) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">
          Responses Summary (continued)
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border-b border-gray-300 p-3 text-left">
                  Question
                </th>
                <th className="border-b border-gray-300 p-3 text-left">
                  Client Score
                </th>
                <th className="border-b border-gray-300 p-3 text-left">
                  Industry Standard
                </th>
              </tr>
            </thead>
            <tbody>
              {secondPage.map((response) => (
                <tr key={response.ResponseID} className="hover:bg-gray-50">
                  <td className="border-b border-gray-300 p-3">
                    {response.QuestionText}
                  </td>
                  <td className="border-b border-gray-300 p-3">
                    {response.Score !== null ? response.Score : "N/A"}
                  </td>
                  <td className="border-b border-gray-300 p-3">
                    {response.StandardText || "No standard available"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
