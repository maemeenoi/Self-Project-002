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
                Answer questions about your cloud infrastructure without
                creating an account
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              2
            </div>
            <div className="w-1/2 pl-8">
              <h4 className="font-semibold text-blue-600">
                2. Receive Magic Link
              </h4>
              <p className="text-sm text-gray-600">
                Provide your email and get instant access to your results
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center">
            <div className="w-1/2 pr-8 text-right">
              <h4 className="font-semibold text-blue-600">3. View Dashboard</h4>
              <p className="text-sm text-gray-600">
                Click the magic link to instantly access your personalized
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              4
            </div>
            <div className="w-1/2 pl-8">
              <h4 className="font-semibold text-blue-600">
                4. Optional Password Setup
              </h4>
              <p className="text-sm text-gray-600">
                Create a password if you want to log in directly next time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
