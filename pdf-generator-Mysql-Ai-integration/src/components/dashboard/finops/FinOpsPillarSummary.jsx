// components/FinOpsPillarSummary.jsx
import React from "react"

const FinOpsPillarSummary = ({
  countFinOpsStandards,
  getFinOpsProgressPercentage,
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">
        FinOps Pillar Maturity Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* High Maturity (Above Standard) */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800">High Maturity</h3>
            <span className="text-green-600 text-2xl font-bold">
              {countFinOpsStandards("above")}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{
                width: `${getFinOpsProgressPercentage("above")}%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            FinOps areas with advanced capabilities - potential cost
            optimization leadership and best practices
          </p>
        </div>

        {/* Medium Maturity */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-orange-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800">Medium Maturity</h3>
            <span className="text-orange-600 text-2xl font-bold">
              {countFinOpsStandards("meet")}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
            <div
              className="bg-orange-500 h-2.5 rounded-full"
              style={{
                width: `${getFinOpsProgressPercentage("meet")}%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            FinOps areas with solid foundation - ready for optimization and
            advanced implementation
          </p>
        </div>

        {/* Low Maturity (Below Standard) */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-red-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800">Low Maturity</h3>
            <span className="text-red-600 text-2xl font-bold">
              {countFinOpsStandards("below")}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{
                width: `${getFinOpsProgressPercentage("below")}%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            FinOps areas requiring immediate attention - highest potential for
            cost savings and operational improvements
          </p>
        </div>
      </div>

      <div className="flex mt-4 pt-2 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>{" "}
          High: Advanced capabilities (70%+ maturity)
        </div>
        <div className="text-sm text-gray-500 mx-4">
          <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1"></span>{" "}
          Medium: Developing capabilities (30-70% maturity)
        </div>
        <div className="text-sm text-gray-500">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>{" "}
          Low: Initial/emerging capabilities (&lt;30% maturity)
        </div>
      </div>
    </div>
  )
}

export default FinOpsPillarSummary
