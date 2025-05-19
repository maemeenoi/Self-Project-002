import React from "react"
import GaugeMeter from "@/components/dashboard/finops/GaugeMeter"
import FinOpsPillarRadarChart from "@/components/dashboard/finops/FinOpsPillarRadarChart"

const ReportMaturityAssessment = ({ clientData }) => {
  const { cloudMaturityAssessment, overallFinOpsMaturity } = clientData

  // Prepare radar chart data from FinOps pillars
  const getRadarData = () => {
    if (!clientData?.finOpsPillars) return []

    return clientData.finOpsPillars.map((pillar) => ({
      pillar: pillar.name,
      score: pillar.percentage,
      benchmark: 50, // 50% as baseline
      maxScore: 100,
    }))
  }

  // Get level descriptions for maturity level grid
  const maturityLevels = [
    {
      level: 1,
      name: "Initial",
      description: "Ad hoc processes with minimal formalization",
    },
    {
      level: 2,
      name: "Repeatable",
      description: "Basic processes documented with some consistency",
    },
    {
      level: 3,
      name: "Defined",
      description: "Standardized processes with improved collaboration",
    },
    {
      level: 4,
      name: "Managed",
      description: "Measured and controlled practices with metrics",
    },
    {
      level: 5,
      name: "Optimized",
      description: "Continuous improvement with proactive adaptation",
    },
  ]

  return (
    <div
      className="report-maturity-page w-full h-full"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="bg-white p-8 h-full flex flex-col">
        {/* Page Header */}
        <div className="flex items-center border-b border-gray-200 pb-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-800">
              Cloud Maturity Assessment
            </h1>
            <p className="text-sm text-gray-500">
              Analysis of {clientData.reportMetadata.organizationName}'s cloud
              maturity
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            {clientData.reportMetadata.reportDate}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 flex-grow">
          {/* Left Column */}
          <div className="flex flex-col">
            {/* Maturity Gauge */}
            <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
              <GaugeMeter
                value={overallFinOpsMaturity?.percentage / 10 || 0}
                maxValue={10}
                maturityLevel={overallFinOpsMaturity?.level || "Not Available"}
                percentage={overallFinOpsMaturity?.percentage || 0}
                totalScore={overallFinOpsMaturity?.totalScore || 0}
                maxScore={overallFinOpsMaturity?.maxScore || 0}
              />
            </div>
            {/* Maturity Level Table */}
            <div className="bg-gray-50 p-4 rounded-lg shadow flex-grow=">
              <h2 className="text-lg font-bold text-gray-700 mb-4">
                Maturity Level Framework
              </h2>
              <div className=" h-full max-h-48">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-700 font-semibold">
                        Level
                      </th>
                      <th className="px-3 py-2 text-left text-gray-700 font-semibold">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-gray-700 font-semibold">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {maturityLevels.map((level) => (
                      <tr
                        key={level.level}
                        className={`border-b ${
                          cloudMaturityAssessment.currentLevel.includes(
                            `Level ${level.level}:`
                          )
                            ? "bg-blue-50 font-medium"
                            : ""
                        }`}
                      >
                        <td className="px-3 py-2">{level.level}</td>
                        <td className="px-3 py-2">{level.name}</td>
                        <td className="px-3 py-2">{level.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            {/* Radar Chart */}
            <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-bold text-gray-700 mb-2">
                Cloud Dimensional Analysis
              </h2>
              <FinOpsPillarRadarChart data={getRadarData()} />

              <p className="mt-2 text-xs text-gray-500 italic text-center">
                Comparison of your organization's cloud capabilities across key
                dimensions versus industry standards
              </p>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-6 border-t border-gray-200 pt-4"></div>
        {/* Page footer with page number */}
        <div className="text-right text-xs text-gray-400 mt-2">
          Page 3 | MakeStuffGo Cloud Assessment
        </div>
      </div>
    </div>
  )
}

export default ReportMaturityAssessment
