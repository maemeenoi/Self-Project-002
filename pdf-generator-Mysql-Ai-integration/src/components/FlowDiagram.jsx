// src/components/FlowDiagram.jsx
import React from "react"

export default function FlowDiagram() {
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold text-center mb-4">How It Works</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>

        {/* Steps */}
        <div className="relative space-y-12 pb-8">
          {/* Step 1 */}
          <div className="flex items-center">
            <div className="w-1/2 pr-8 text-right">
              <h4 className="font-semibold text-blue-600">
                1. Complete Assessment
              </h4>
              <p className="text-sm text-gray-600">
                Answer questions about your cloud infrastructure with a simple
                questionnaire
              </p>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              1
            </div>
            <div className="w-1/2 pl-8">
              <div className="bg-blue-50 p-2 rounded">
                <svg
                  className="h-10 w-10 text-blue-500 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center">
            <div className="w-1/2 pr-8 text-right">
              <div className="bg-blue-50 p-2 rounded">
                <svg
                  className="h-10 w-10 text-blue-500 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              2
            </div>
            <div className="w-1/2 pl-8">
              <h4 className="font-semibold text-blue-600">
                2. Sign In with Google
              </h4>
              <p className="text-sm text-gray-600">
                Simply click the Google Sign-In button for secure and quick
                authentication
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center">
            <div className="w-1/2 pr-8 text-right">
              <h4 className="font-semibold text-blue-600">3. View Dashboard</h4>
              <p className="text-sm text-gray-600">
                Instantly access your personalized cloud maturity assessment
                dashboard
              </p>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              3
            </div>
            <div className="w-1/2 pl-8">
              <div className="bg-blue-50 p-2 rounded">
                <svg
                  className="h-10 w-10 text-blue-500 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-center">
            <div className="w-1/2 pr-8 text-right">
              <div className="bg-blue-50 p-2 rounded">
                <svg
                  className="h-10 w-10 text-blue-500 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              4
            </div>
            <div className="w-1/2 pl-8">
              <h4 className="font-semibold text-blue-600">
                4. Generate PDF Report
              </h4>
              <p className="text-sm text-gray-600">
                Create a detailed PDF report of your assessment results to share
                with stakeholders
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
