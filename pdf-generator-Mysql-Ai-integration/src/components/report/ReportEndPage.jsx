import React from "react"

const ReportEndPage = ({ clientData }) => {
  const { reportMetadata } = clientData

  return (
    <div
      className="report-page report-end-page w-full h-full"
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#ffffff", // Plain white background for compatibility
      }}
    >
      {/* Top border */}
      <div className="h-6 w-full bg-blue-600"></div>

      {/* Content Container */}
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <h1 className="text-4xl font-bold text-blue-800 mb-8">Thank You</h1>

        <div className="w-32 h-1 bg-blue-400 mx-auto mb-8"></div>

        <div className="mb-8">
          <p className="text-xl text-gray-700">
            This Cloud Maturity Assessment has been prepared for:
          </p>
          <h2 className="text-3xl font-bold text-blue-900 mt-2">
            {reportMetadata.organizationName}
          </h2>
          <p className="text-lg text-gray-700 mt-1">
            {reportMetadata.reportDate}
          </p>
        </div>

        <div className="mb-12 max-w-lg">
          <p className="text-lg text-gray-700 mb-6">
            For more information or to schedule your implementation
            consultation, please contact your MakeStuffGo representative.
          </p>

          <div className="grid grid-cols-2 gap-8 text-left mt-8">
            <div>
              <h3 className="font-semibold mb-1 text-blue-800">Contact Us</h3>
              <p className="text-gray-700">support@makestuffgo.com</p>
              <p className="text-gray-700">+1 (555) 123-4567</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-blue-800">
                Visit Us Online
              </h3>
              <p className="text-gray-700">www.makestuffgo.com</p>
              <p className="text-gray-700">@MakeStuffGo</p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold text-blue-800 mb-1">MakeStuffGo</h2>
          <p className="text-lg italic text-gray-600">
            Ensuring every dollar you spend on the cloud is working as hard as
            you
          </p>
        </div>
      </div>

      {/* Bottom border */}
      <div className="h-6 w-full bg-blue-600"></div>
    </div>
  )
}

export default ReportEndPage
