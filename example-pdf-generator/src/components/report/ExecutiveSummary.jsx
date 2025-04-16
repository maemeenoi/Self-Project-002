// components/report/ExecutiveSummary.jsx
import React from "react"

const ExecutiveSummary = ({ clientData, page = 1 }) => {
  const { executiveSummary, cloudSpend } = clientData

  // Helper function to find content sections
  const findSection = (title) => {
    return (
      executiveSummary.subtopics.find((topic) => topic.title === title) || {
        content: "Not available",
      }
    )
  }

  // Get the specific sections
  const overview = findSection("Overview")
  const purpose = findSection("Purpose")
  const methodology = findSection("Methodology")
  const keyFocuses = findSection("Key Focuses")
  const summaryOfFindings = findSection("Summary of Findings")
  const keyRecommendations = findSection("Key Recommendations")
  const expectedImpact = findSection("Expected Impact")

  // Page 1 content - First 3 sections
  if (page === 1) {
    return (
      <div className="w-full h-full bg-white p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          01. Executive Summary
        </h1>

        <div className="grid grid-cols-2 gap-8 h-full">
          {/* Left Column */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-500 mb-2">Overview</h2>
              <p className="text-gray-800 text-sm leading-relaxed">
                {overview.content}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-500 mb-2">Purpose</h2>
              <p className="text-gray-800 text-sm leading-relaxed">
                {purpose.content}
              </p>
            </div>

            {/* Stats at the bottom */}
            <div className="mt-auto bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Total Cloud Spend</p>
              <p className="text-2xl font-bold">
                ${cloudSpend.total.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Annual cloud expenditure across all services
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-500 mb-2">
                Methodology
              </h2>
              <p className="text-gray-800 text-sm leading-relaxed">
                {methodology.content}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-500 mb-2">
                Key Focuses
              </h2>
              {Array.isArray(keyFocuses.content) ? (
                <ul className="list-disc pl-5 space-y-1">
                  {keyFocuses.content.map((item, index) => (
                    <li
                      key={index}
                      className="text-gray-800 text-sm leading-relaxed"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-800 text-sm leading-relaxed">
                  {keyFocuses.content}
                </p>
              )}
            </div>

            {/* Stats at the bottom */}
            <div className="mt-auto bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Potential Annual Savings</p>
              <p className="text-2xl font-bold">
                ${cloudSpend.annualSavingsOpportunity.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Based on AI-driven optimization recommendations
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Page 2 content - Remaining sections
  return (
    <div className="w-full h-full bg-white p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Executive Summary (continued)
      </h1>

      <div className="grid grid-cols-2 gap-8 h-full">
        {/* Left Column */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Summary of Findings
            </h2>
            {Array.isArray(summaryOfFindings.content) ? (
              <ul className="list-disc pl-5 space-y-1">
                {summaryOfFindings.content.map((item, index) => (
                  <li
                    key={index}
                    className="text-gray-800 text-sm leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-800 text-sm leading-relaxed">
                {summaryOfFindings.content}
              </p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Expected Impact
            </h2>
            <p className="text-gray-800 text-sm leading-relaxed">
              {expectedImpact.content}
            </p>
          </div>

          <div className="mt-auto bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-600 mb-2">
              Implementation Timeline
            </h3>
            <p className="text-sm text-gray-700">
              We recommend a phased implementation approach over the next 3-6
              months to systematically capture cost savings while minimizing
              operational disruption. Detailed implementation roadmap is
              provided in Section 9.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Key Recommendations
            </h2>
            {Array.isArray(keyRecommendations.content) ? (
              <ul className="list-disc pl-5 space-y-1">
                {keyRecommendations.content.map((item, index) => (
                  <li
                    key={index}
                    className="text-gray-800 text-sm leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-800 text-sm leading-relaxed">
                {keyRecommendations.content}
              </p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Key Benefits
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Cost Optimization
                </h3>
                <p className="text-xs text-gray-600">
                  Reduce cloud spend without sacrificing performance
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Resource Efficiency
                </h3>
                <p className="text-xs text-gray-600">
                  Improve utilization across compute resources
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Financial Governance
                </h3>
                <p className="text-xs text-gray-600">
                  Enhance visibility over cloud expenditures
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Operational Excellence
                </h3>
                <p className="text-xs text-gray-600">
                  Streamline cloud operations with automation
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-bold text-blue-600 mb-2">Next Steps</h3>
            <p className="text-sm text-gray-700">
              The following sections provide detailed analysis and actionable
              recommendations. We recommend beginning with the high-impact,
              low-effort optimizations identified in Section 4 for immediate
              cost savings with minimal disruption.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExecutiveSummary
