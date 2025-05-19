import React from "react"

const ReportExecutiveSummary = ({ clientData }) => {
  const {
    executiveSummary,
    overallFindings,
    strengths,
    improvementAreas,
    recommendations,
    recommendations: { implementationRoadmap = [] } = {},
  } = clientData

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      {/* Page Header */}
      <div className="flex items-center border-b border-gray-200 pb-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-blue-800">
            Executive Summary
          </h1>
          <p className="text-sm text-gray-500">
            Executive Summary of {clientData.reportMetadata.organizationName}.
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {clientData.reportMetadata.reportDate}
        </div>
      </div>

      <div className="space-y-6">
        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">
            Executive Summary
          </h3>
          <p className="text-gray-700">{executiveSummary}</p>
        </div>

        {/* Overall Findings */}
        {overallFindings && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              Overall Findings
            </h3>
            <p className="text-gray-700">{overallFindings}</p>
          </div>
        )}

        {/* Strengths and Improvement Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-semibold text-green-800 mb-2">Key Strengths</h3>
            <ul className="space-y-2">
              {strengths?.map((strength, index) => (
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
              {improvementAreas?.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="mt-6 border-t border-gray-200 pt-4"></div>
      {/* Page footer with page number */}
      <div className="text-right text-xs text-gray-400 mt-2">
        Page 2 | MakeStuffGo Cloud Assessment
      </div>
    </div>
  )
}

export default ReportExecutiveSummary
