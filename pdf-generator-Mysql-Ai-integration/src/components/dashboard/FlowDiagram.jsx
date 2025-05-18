// components/layout/FlowDiagram.jsx
import React from "react"

const FlowDiagram = ({ title = "How It Works" }) => {
  // Define the steps in your current workflow
  const steps = [
    {
      number: 1,
      title: "Complete Assessment",
      description:
        "Answer questions about your FinOps maturity with our comprehensive questionnaire",
      icon: (
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
      ),
      iconOnRight: false,
    },
    {
      number: 2,
      title: "Sign In with Google",
      description:
        "Use Google authentication for quick, secure access to your results",
      icon: (
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
      ),
      iconOnRight: true,
    },
    {
      number: 3,
      title: "AI Analysis",
      description:
        "Our AI analyzes your assessment to generate personalized insights and recommendations",
      icon: (
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
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      iconOnRight: false,
    },
    {
      number: 4,
      title: "Interactive Dashboard",
      description:
        "Explore your maturity scores, recommendations, and improvement opportunities",
      icon: (
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
      ),
      iconOnRight: true,
    },
    {
      number: 5,
      title: "AI-Enhanced Report",
      description:
        "Generate a detailed PDF report with AI insights to share with stakeholders",
      icon: (
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
      ),
      iconOnRight: false,
    },
  ]

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>

        {/* Steps */}
        <div className="relative space-y-12 pb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              {/* Left side */}
              <div className="w-1/2 pr-8 text-right">
                {step.iconOnRight ? (
                  <div className="bg-blue-50 p-2 rounded">{step.icon}</div>
                ) : (
                  <>
                    <h4 className="font-semibold text-blue-600">
                      {step.number}. {step.title}
                    </h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </>
                )}
              </div>

              {/* Center circle with number */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {step.number}
              </div>

              {/* Right side */}
              <div className="w-1/2 pl-8">
                {step.iconOnRight ? (
                  <>
                    <h4 className="font-semibold text-blue-600">
                      {step.number}. {step.title}
                    </h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </>
                ) : (
                  <div className="bg-blue-50 p-2 rounded">{step.icon}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FlowDiagram
