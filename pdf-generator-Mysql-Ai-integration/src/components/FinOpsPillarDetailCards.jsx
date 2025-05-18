// components/FinOpsPillarDetailCards.jsx
import React from "react"

const FinOpsPillarDetailCards = ({
  pillars,
  getMaturityColor,
  title = "FinOps Pillar Deep Dive",
  columnConfig = {
    default: 1,
    md: 2,
    lg: 3,
  },
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">{title}</h2>
      <div
        className={`grid grid-cols-${columnConfig.default} md:grid-cols-${columnConfig.md} lg:grid-cols-${columnConfig.lg} gap-6`}
      >
        {pillars?.map((pillar) => (
          <div
            key={pillar.id}
            className="border rounded-lg p-4"
            style={{
              borderLeft: `4px solid ${getMaturityColor(pillar.maturityLevel)}`,
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">
                {pillar.name}
              </h3>
              <div
                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{
                  backgroundColor: getMaturityColor(pillar.maturityLevel),
                }}
              >
                {pillar.percentage}%
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Maturity Level</span>
                <span className="text-xs font-medium">
                  {pillar.maturityLevel}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${pillar.percentage}%`,
                    backgroundColor: getMaturityColor(pillar.maturityLevel),
                  }}
                ></div>
              </div>

              <p className="text-xs text-gray-600 mt-2">
                {pillar.maturityDescription}
              </p>

              {pillar.recommendations && pillar.recommendations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-700">
                    Top Recommendation:
                  </p>
                  <p className="text-xs text-gray-600">
                    {pillar.recommendations[0].title}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-500">
          Note: The maturity levels are based on the FinOps Foundation's
          guidelines.
        </p>
        <p className="text-xs text-gray-500">
          The maturity percentage indicates the current state of the FinOps
          pillar.
        </p>
      </div>
    </div>
  )
}

export default FinOpsPillarDetailCards
