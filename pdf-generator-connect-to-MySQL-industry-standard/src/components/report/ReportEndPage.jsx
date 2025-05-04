import React from "react"

const ReportEndPage = ({ clientData }) => {
  const { reportMetadata } = clientData

  return (
    <div
      className="report-end-page w-full h-full"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Background with gradient */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #111827 100%)",
        }}
      >
        {/* Network pattern overlay */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="#4F8FEA"
                strokeWidth="0.2"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-16 text-white">
          <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold mb-8">Thank You</h1>

            <div className="w-40 h-1 bg-blue-300 mx-auto mb-8"></div>

            <div className="mb-8">
              <p className="text-xl">
                This Cloud Maturity Assessment has been prepared for:
              </p>
              <h2 className="text-3xl font-bold mt-2">
                {reportMetadata.organizationName}
              </h2>
              <p className="text-lg mt-1">{reportMetadata.reportDate}</p>
            </div>

            <div className="mb-12">
              <p className="text-lg mb-6">
                For more information or to schedule your implementation
                consultation, please contact your MakeStuffGo representative.
              </p>

              <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto text-left mt-8">
                <div>
                  <h3 className="font-semibold mb-1">Contact Us</h3>
                  <p className="text-blue-200">support@makestuffgo.com</p>
                  <p className="text-blue-200">+1 (555) 123-4567</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Visit Us Online</h3>
                  <p className="text-blue-200">www.makestuffgo.com</p>
                  <p className="text-blue-200">@MakeStuffGo</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-1">MakeStuffGo</h2>
              <p className="text-lg italic opacity-80">
                Ensuring every dollar you spend on the cloud is working as hard
                as you
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"></div>

        {/* Confidential Watermark */}
        <div
          className="absolute bottom-6 right-6 text-white opacity-30 transform rotate-0"
          style={{ fontSize: "16px", letterSpacing: "1px" }}
        >
          CONFIDENTIAL
        </div>
      </div>
    </div>
  )
}

export default ReportEndPage
