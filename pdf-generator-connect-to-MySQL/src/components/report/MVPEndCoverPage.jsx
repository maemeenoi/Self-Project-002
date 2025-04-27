import React from "react"

const MVPEndCoverPage = ({ clientData }) => {
  const { organizationName, reportDate } = clientData.reportMetadata

  return (
    <div className="flex h-full w-full relative overflow-hidden bg-blue-900">
      {/* Background with gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-blue-900"
          style={{
            background: "linear-gradient(to bottom right, #1e3a8a, #000000)",
          }}
        >
          {/* Network pattern overlay */}
          <svg
            className="w-full h-full opacity-30"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
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
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-10 text-white">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-6">Thank You</h1>

          <p className="text-xl mb-6">
            For more information or to schedule your implementation call, please
            contact your MakeStuffGo representative.
          </p>

          <div className="w-28 h-1 bg-blue-400 mx-auto my-8"></div>

          <div className="text-lg">
            <p className="mb-2">Report prepared for:</p>
            <p className="text-2xl font-semibold mb-4">{organizationName}</p>
            <p className="text-sm opacity-80">{reportDate}</p>
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-1">MakeStuffGo</h2>
            <p className="text-lg italic opacity-80">
              Ensuring every dollar you spend on the cloud is working as hard as
              you
            </p>
          </div>

          <div className="mt-6 text-sm opacity-70">
            <p>
              www.makestuffgo.com | info@makestuffgo.com | +1 (555) 123-4567
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MVPEndCoverPage
