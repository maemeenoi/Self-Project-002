import React from "react"

const ReportCoverPage = ({ clientData }) => {
  const { reportMetadata } = clientData

  return (
    <div
      className="report-page report-cover w-full h-full flex flex-col"
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#ffffff", // Plain white background for compatibility
      }}
    >
      {/* Top header */}
      <div
        className="h-24 w-full"
        style={{
          backgroundColor: "#1e40af", // Solid blue instead of gradient
        }}
      >
        <div className="flex justify-center items-center h-full">
          <div className="text-white text-2xl font-bold">MakeStuffGo</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-blue-900 mb-10">
            Cloud Maturity Assessment
          </h1>

          <div className="w-20 h-1 bg-blue-600 mx-auto mb-10"></div>

          <div className="mt-10">
            <h2 className="text-3xl font-bold text-blue-800">
              {reportMetadata.organizationName}
            </h2>
            <p className="text-xl text-blue-700 mt-3">
              {reportMetadata.reportDate}
            </p>
          </div>

          <div className="mt-16 text-gray-600">
            <p className="text-lg">Prepared by</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">
              MakeStuffGo Cloud Solutions
            </p>
          </div>
        </div>
      </div>

      {/* Bottom border */}
      <div className="h-6 w-full bg-blue-600"></div>
    </div>
  )
}

export default ReportCoverPage
