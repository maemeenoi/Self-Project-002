import React from "react"

const ReportCoverPage = ({ clientData }) => {
  const { reportMetadata } = clientData

  return (
    <div
      className="report-cover w-full h-full"
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
        {/* Network visualization pattern overlay */}
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

          {/* Nodes and connections - simplified network visualization */}
          {/* Central node */}
          <circle cx="50" cy="50" r="2" fill="#ffffff" />

          {/* Satellite nodes */}
          {[...Array(12)].map((_, index) => {
            const angle = (index * Math.PI * 2) / 12
            const distance = 20 + (index % 3) * 8
            const x = 50 + Math.cos(angle) * distance
            const y = 50 + Math.sin(angle) * distance
            const size = 0.5 + (index % 3) * 0.3

            return (
              <React.Fragment key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r={size}
                  fill="#ffffff"
                  fillOpacity={0.6 + (index % 4) * 0.1}
                />
                <line
                  x1="50"
                  y1="50"
                  x2={x}
                  y2={y}
                  stroke="#4F8FEA"
                  strokeWidth="0.2"
                  strokeOpacity="0.5"
                />
              </React.Fragment>
            )
          })}

          {/* Additional connections between satellite nodes */}
          {[...Array(8)].map((_, index) => {
            const sourceIndex = index % 12
            const targetIndex = (index + 3) % 12

            const sourceAngle = (sourceIndex * Math.PI * 2) / 12
            const sourceDistance = 20 + (sourceIndex % 3) * 8
            const sourceX = 50 + Math.cos(sourceAngle) * sourceDistance
            const sourceY = 50 + Math.sin(sourceAngle) * sourceDistance

            const targetAngle = (targetIndex * Math.PI * 2) / 12
            const targetDistance = 20 + (targetIndex % 3) * 8
            const targetX = 50 + Math.cos(targetAngle) * targetDistance
            const targetY = 50 + Math.sin(targetAngle) * targetDistance

            return (
              <line
                key={`connection-${index}`}
                x1={sourceX}
                y1={sourceY}
                x2={targetX}
                y2={targetY}
                stroke="#4F8FEA"
                strokeWidth="0.1"
                strokeOpacity="0.3"
              />
            )
          })}
        </svg>

        {/* White diagonal stripe */}
        <div
          className="absolute top-0 left-0 h-full w-1/3 transform -skew-x-12 bg-white z-10"
          style={{
            background:
              "linear-gradient(to right, #ffffff 70%, rgba(255,255,255,0) 100%)",
          }}
        >
          {/* Report Title Content */}
          <div className="p-10 pt-16 h-full flex flex-col justify-between">
            <div>
              <h1 className="text-blue-900 text-5xl font-bold tracking-tight">
                CLOUD
              </h1>
              <h1 className="text-blue-900 text-5xl font-bold tracking-tight mt-1">
                MATURITY
              </h1>
              <h1 className="text-blue-900 text-5xl font-bold tracking-tight mt-1">
                ASSESSMENT
              </h1>

              <div className="mt-10">
                <h2 className="text-2xl font-bold text-blue-800">
                  {reportMetadata.organizationName}
                </h2>
                <p className="text-lg text-blue-700 mt-1">
                  {reportMetadata.reportDate}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 font-medium">CONFIDENTIAL</p>
            </div>
          </div>
        </div>

        {/* Main Visualization - Abstract Cloud Symbol */}
        <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2 z-0">
          <svg
            width="300"
            height="300"
            viewBox="0 0 100 100"
            className="opacity-40"
          >
            <defs>
              <radialGradient
                id="cloudGlow"
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Glow effect */}
            <circle cx="50" cy="50" r="40" fill="url(#cloudGlow)" />

            {/* Stylized cloud shape */}
            <path
              d="M70,55 C77,55 82,50 82,43 C82,36 77,31 70,31 C70,24 65,18 58,18 C51,18 46,24 46,31 C39,31 34,36 34,43 C34,50 39,55 46,55 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.8"
              opacity="0.8"
            />

            {/* Servers and connections inside */}
            <rect
              x="46"
              y="35"
              width="4"
              height="8"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="54"
              y="30"
              width="4"
              height="8"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="62"
              y="35"
              width="4"
              height="8"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="50"
              y="46"
              width="4"
              height="8"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="58"
              y="46"
              width="4"
              height="8"
              fill="#ffffff"
              opacity="0.7"
            />

            <line
              x1="48"
              y1="43"
              x2="50"
              y2="46"
              stroke="#ffffff"
              strokeWidth="0.5"
            />
            <line
              x1="56"
              y1="38"
              x2="58"
              y2="46"
              stroke="#ffffff"
              strokeWidth="0.5"
            />
            <line
              x1="64"
              y1="43"
              x2="62"
              y2="46"
              stroke="#ffffff"
              strokeWidth="0.5"
            />
            <line
              x1="50"
              y1="35"
              x2="54"
              y2="38"
              stroke="#ffffff"
              strokeWidth="0.5"
            />
            <line
              x1="64"
              y1="35"
              x2="58"
              y2="38"
              stroke="#ffffff"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Company Logo */}
        <div className="absolute bottom-8 right-8 z-20 text-white opacity-90">
          <h2 className="text-3xl font-bold">MakeStuffGo</h2>
          <p className="text-sm mt-1 italic">Cloud Assessment Solutions</p>
        </div>
      </div>
    </div>
  )
}

export default ReportCoverPage
