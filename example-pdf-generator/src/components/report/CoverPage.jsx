// CoverPage.jsx
import React from "react"

const CoverPage = ({ clientData }) => {
  const { organizationName } = clientData.reportMetadata

  return (
    <div className="flex flex-col h-screen w-full relative overflow-hidden">
      {/* Background image - network/cloud visualization */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-blue-900 to-black">
          {/* Network line pattern overlay */}
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
              <radialGradient
                id="networkGlow"
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <stop offset="0%" stopColor="#4F8FEA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#000B38" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            <circle cx="50" cy="50" r="30" fill="url(#networkGlow)" />
            {/* Random network lines */}
            {[...Array(15)].map((_, i) => (
              <line
                key={i}
                x1={Math.random() * 100}
                y1={Math.random() * 100}
                x2={Math.random() * 100}
                y2={Math.random() * 100}
                stroke="#4F8FEA"
                strokeWidth="0.2"
                opacity={Math.random() * 0.5 + 0.5}
              />
            ))}
            {/* Random network nodes */}
            {[...Array(15)].map((_, i) => (
              <circle
                key={i + "node"}
                cx={Math.random() * 100}
                cy={Math.random() * 100}
                r={Math.random() * 1 + 0.5}
                fill="#4F8FEA"
                opacity={Math.random() * 0.5 + 0.5}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* White side panel */}
      <div className="absolute left-0 top-0 bottom-0 bg-white w-1/3 z-10">
        {/* Report title */}
        <div className="pl-8 pt-16">
          <h1 className="text-6xl font-bold tracking-tight">CLOUD COST</h1>
          <h1 className="text-6xl font-bold tracking-tight mt-2">EFFICIENCY</h1>
          <h1 className="text-6xl font-bold tracking-tight mt-2">REPORT</h1>

          <h2 className="text-3xl font-semibold mt-8">
            {organizationName.toUpperCase()}
          </h2>

          <p className="text-lg mt-6">{clientData.reportMetadata.reportDate}</p>
          <p className="text-lg mt-6">
            {clientData.reportMetadata.reportPeriod}
          </p>

          <p className="text-sm text-gray-500 absolute bottom-8">
            {clientData.reportMetadata.generatedBy}
          </p>
        </div>
      </div>

      {/* MakeStuffGo logo in bottom right */}
      <div className="absolute bottom-8 right-8 z-20">
        <h2 className="text-4xl font-bold text-white">MakeStuffGo</h2>
      </div>
    </div>
  )
}

export default CoverPage
