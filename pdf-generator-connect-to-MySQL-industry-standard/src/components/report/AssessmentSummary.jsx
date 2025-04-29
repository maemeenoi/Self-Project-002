"use client"

export default function AssessmentSummary({ responses }) {
  if (!responses || responses.length === 0) {
    return <div>No responses available.</div>
  }

  // Filter responses to show only question 6 onward
  const filteredResponses = responses.filter(
    (response) => response.QuestionID >= 6
  )

  // Check if there are any filtered responses
  if (filteredResponses.length === 0) {
    return <div>No responses available for questions 6 and onward.</div>
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">
          Assessment Responses Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700">
                  Question
                </th>
                <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700">
                  Client Score
                </th>
                <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700">
                  Industry Standard
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredResponses.map((response) => (
                <tr key={response.ResponseID} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 text-sm text-gray-800">
                    {response.QuestionText}
                  </td>
                  <td className="border border-gray-300 p-3 text-sm text-gray-800">
                    {response.Score !== null ? response.Score : "N/A"}
                  </td>
                  <td className="border border-gray-300 p-3 text-sm text-gray-800">
                    {response.StandardText || "No standard available"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
