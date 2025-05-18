// components/dashboard/OrganizationOverviewCard.jsx
import React from "react"

const OrganizationOverviewCard = ({
  organizationData,
  userData,
  title = "Organization Overview",
}) => {
  // Extract data from props with fallbacks
  const {
    organizationName = "Unknown Organization",
    clientName = "Unknown",
    industryType = "Not specified",
    clientSize = "Not specified",
    reportDate = "Today",
  } = organizationData?.reportMetadata || {}

  const { email = "Not provided", organizationName: userOrgName } =
    userData || {}

  // Get maturity data with fallbacks
  const maturityPercentage =
    organizationData?.overallFinOpsMaturity?.percentage || "N/A"
  const maturityLevel = organizationData?.overallFinOpsMaturity?.level || "N/A"

  // Get first character for avatar
  const avatarInitial =
    organizationName?.charAt(0) || userOrgName?.charAt(0) || "O"

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">{title}</h2>

      <div className="flex flex-col md:flex-row">
        {/* Left side - Basic Info */}
        <div className="flex-1 pr-4">
          <div className="mb-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl border border-blue-200 mx-auto md:mx-0">
              {avatarInitial}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Contact Name
              </h3>
              <p className="font-semibold text-gray-800">{clientName}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Organization
              </h3>
              <p className="font-semibold text-gray-800">{organizationName}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="font-semibold text-gray-800">{email}</p>
            </div>
          </div>
        </div>

        {/* Right side - FinOps Info */}
        <div className="flex-1 pt-4 md:pt-0 md:pl-4 md:border-l border-gray-200">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Industry</h3>
              <p className="font-semibold text-gray-800">{industryType}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Company Size
              </h3>
              <p className="font-semibold text-gray-800">{clientSize}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Assessment Date
              </h3>
              <p className="font-semibold text-gray-800">{reportDate}</p>
            </div>

            {/* FinOps Maturity Score */}
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                FinOps Maturity Score
              </h3>
              <div className="flex items-center">
                <span className="font-bold text-xl text-blue-600 mr-2">
                  {maturityPercentage}
                  {maturityPercentage !== "N/A" && "%"}
                </span>
                <span className="text-sm text-gray-600">({maturityLevel})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationOverviewCard
