// components/report/Introduction.jsx
import React from "react"

const Introduction = ({ clientData, page = 1 }) => {
  const { introduction } = clientData

  // Find specific sections if they exist
  const findSection = (title) => {
    return (
      introduction?.subtopics?.find((topic) => topic.title === title) || {
        content: "Not available",
      }
    )
  }

  const cloudCostOptimization = findSection("Cloud Cost Optimization Concepts")
  const finOps = findSection("FinOps Core Principles")
  const iaC = findSection("Infrastructure as Code (IaC) Overview")
  const businessValue = findSection("The Business Value of Cloud Efficiency")

  // First page with image and basic introduction
  if (page === 1) {
    return (
      <div className="w-full h-full bg-white flex">
        {/* Left side - Large image */}
        <div className="w-1/2 relative">
          {/* This can be replaced with an actual image from your assets */}
          <div className="w-full h-full bg-blue-50 relative overflow-hidden">
            <img
              src="/02.png" // Direct path to the image in the public folder
              alt="Cloud professionals collaborating"
              className="w-full h-full object-cover"
            />

            {/* Green accent at bottom left, similar to the reference image */}
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500"></div>
          </div>
        </div>

        {/* Right side - Introduction content */}
        <div className="w-1/2 p-10 flex flex-col">
          <h1 className="text-4xl font-bold text-green-600 mb-8">
            Introduction
          </h1>

          <div className="mb-8">
            <p className="text-gray-800 leading-relaxed">
              Cloud Cost Efficiency is an innovative approach to cloud
              management and operations that optimizes as much of the resource
              allocation, configuration, and spending as possible across your
              infrastructure. This ensures maximum value from every dollar spent
              on cloud services while maintaining performance across multiple
              workloads and environments. Optimization helps to eliminate wasted
              resources, improves operational efficiency, and supports
              intelligent decision-making regarding your cloud investments. In
              the past, organizations could survive with ad-hoc cloud spending,
              however this approach becomes increasingly expensive and
              unsustainable as cloud footprints grow.
            </p>
          </div>

          <p className="text-gray-800 leading-relaxed mb-8">
            To achieve Cloud Cost Efficiency, the following areas must be
            incorporated into the organizational culture:
          </p>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              1.1 Continuous Optimization
            </h2>
            <p className="text-gray-800 leading-relaxed">
              It is important to establish a process which feeds into Cloud Cost
              Efficiency. Continuous Optimization monitors resource utilization,
              identifies waste, and automatically adjusts provisioning to match
              actual needs while ensuring performance.
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              1.2 Infrastructure as Code
            </h2>
            <p className="text-gray-800 leading-relaxed">
              This is the approach where infrastructure is defined and managed
              through code that can be templated, versioned, and automated to
              ensure consistency across all environments from development
              through to production.
            </p>
          </div>

          {/* Page number at bottom right, similar to the reference image */}
          <div className="mt-auto self-end">
            <div className="w-10 h-10 bg-green-500 flex items-center justify-center">
              <span className="text-white font-bold">5</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Second page with more detailed content
  return (
    <div className="w-full h-full bg-white p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Introduction (continued)
      </h1>

      <div className="grid grid-cols-2 gap-8 h-full">
        {/* Left Column */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              1.3 Resource Governance
            </h2>
            <p className="text-gray-800">
              Resource governance establishes consistent policies and guardrails
              that ensure cloud resources are provisioned according to
              organizational standards. This includes tagging strategies, access
              controls, and usage policies that enable accountability and
              prevent sprawl.
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              1.4 FinOps Core Principles
            </h2>
            <p className="text-gray-800">{finOps.content}</p>

            {/* FinOps Principles Visualization */}
            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-3">
                {finOps.principles?.map((principle, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded-lg border border-blue-200 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-blue-600">
                      {principle.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Infrastructure as Code (IaC) Overview
            </h2>
            <p className="text-gray-800">{iaC.content}</p>

            {/* IaC Benefits Visual */}
            <div className="mt-4 bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-bold text-indigo-600 mb-2">
                Key Benefits of IaC
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {iaC.benefits?.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center mr-2 mt-1">
                      <span className="text-indigo-600 font-bold text-xs">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-indigo-600">
                        {benefit.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              The Business Value of Cloud Efficiency
            </h2>
            <p className="text-gray-800 mb-4">{businessValue.content}</p>

            {/* Business Value Metrics */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-600 mb-3">
                Potential Business Impact
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Cost Reduction</p>
                  <p className="text-xl font-bold text-green-600">20-40%</p>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Deployment Speed</p>
                  <p className="text-xl font-bold text-blue-600">+200%</p>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Resource Efficiency</p>
                  <p className="text-xl font-bold text-indigo-600">+30%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Introduction
