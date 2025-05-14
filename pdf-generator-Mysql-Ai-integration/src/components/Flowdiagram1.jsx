import React, { useState, useEffect } from "react"

const FlowDiagram = () => {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 8)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const steps = [
    {
      id: 1,
      title: "User Opens App",
      description: "User navigates to /dashboard",
      icon: "👤",
      section: "frontend",
    },
    {
      id: 2,
      title: "Fill Assessment Form",
      description: "Cloud maturity questions answered",
      icon: "📝",
      section: "frontend",
    },
    {
      id: 3,
      title: "Submit Form",
      description: "POST to /api/submit",
      icon: "📤",
      section: "frontend",
    },
    {
      id: 4,
      title: "Process Submission",
      description: "Save to MySQL, prepare for AI",
      icon: "⚙️",
      section: "backend",
    },
    {
      id: 5,
      title: "Fetch Context (RAG)",
      description: "Query Postgres for standards",
      icon: "🗃️",
      section: "backend",
    },
    {
      id: 6,
      title: "AI Analysis",
      description: "Send to OpenAI with context",
      icon: "🤖",
      section: "ai",
    },
    {
      id: 7,
      title: "Store Results",
      description: "Save AI response to database",
      icon: "💾",
      section: "backend",
    },
    {
      id: 8,
      title: "Display & Download",
      description: "Show dashboard, generate PDF",
      icon: "📊",
      section: "frontend",
    },
  ]

  const connections = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 5, to: 6 },
    { from: 6, to: 7 },
    { from: 7, to: 8 },
  ]

  const getSectionColor = (section) => {
    switch (section) {
      case "frontend":
        return {
          bg: "bg-blue-100",
          border: "border-blue-300",
          text: "text-blue-700",
        }
      case "backend":
        return {
          bg: "bg-green-100",
          border: "border-green-300",
          text: "text-green-700",
        }
      case "ai":
        return {
          bg: "bg-purple-100",
          border: "border-purple-300",
          text: "text-purple-700",
        }
      default:
        return {
          bg: "bg-gray-100",
          border: "border-gray-300",
          text: "text-gray-700",
        }
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Report Generation Process Flow
      </h2>

      {/* Legend */}
      <div className="flex justify-center mb-8 space-x-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
          <span className="text-sm">Frontend</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
          <span className="text-sm">Backend</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded mr-2"></div>
          <span className="text-sm">AI Processing</span>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="relative">
        <svg width="100%" height="600" className="absolute inset-0">
          {/* Connection Lines */}
          {connections.map((conn, index) => {
            const fromStep = steps.find((s) => s.id === conn.from)
            const toStep = steps.find((s) => s.id === conn.to)
            const fromIndex = steps.indexOf(fromStep)
            const toIndex = steps.indexOf(toStep)

            // Calculate positions
            const fromX = (fromIndex % 4) * 250 + 125
            const fromY = Math.floor(fromIndex / 4) * 200 + 100
            const toX = (toIndex % 4) * 250 + 125
            const toY = Math.floor(toIndex / 4) * 200 + 100

            // Adjust for box dimensions
            const adjustedFromY = fromY + 40
            const adjustedToY = toY - 40

            const isActive = activeStep >= fromIndex && activeStep > toIndex

            return (
              <g key={index}>
                <line
                  x1={fromX}
                  y1={adjustedFromY}
                  x2={toX}
                  y2={adjustedToY}
                  stroke={isActive ? "#3b82f6" : "#d1d5db"}
                  strokeWidth="3"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            )
          })}

          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>
        </svg>

        {/* Steps */}
        <div className="relative z-10 grid grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const colors = getSectionColor(step.section)
            const isActive = activeStep === index
            const isCompleted = activeStep > index

            return (
              <div
                key={step.id}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-500
                  ${colors.bg} ${colors.border}
                  ${isActive ? "scale-105 shadow-lg ring-4 ring-blue-200" : ""}
                  ${isCompleted ? "opacity-75" : ""}
                `}
                style={{
                  minHeight: "120px",
                  marginBottom: index >= 4 ? "80px" : "0",
                }}
              >
                {/* Step Number */}
                <div
                  className={`
                  absolute -top-3 -left-3 w-8 h-8 rounded-full border-2
                  ${
                    isCompleted
                      ? "bg-green-500 border-green-600"
                      : isActive
                      ? "bg-blue-500 border-blue-600"
                      : "bg-white border-gray-300"
                  }
                  flex items-center justify-center
                `}
                >
                  {isCompleted ? (
                    <span className="text-white text-sm">✓</span>
                  ) : (
                    <span
                      className={`text-sm font-bold ${
                        isActive ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {step.id}
                    </span>
                  )}
                </div>

                {/* Icon */}
                <div className="text-3xl mb-2 text-center">{step.icon}</div>

                {/* Content */}
                <div className="text-center">
                  <h3 className={`font-bold text-sm mb-1 ${colors.text}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Technology Stack */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-blue-700 mb-2">Frontend</h3>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• Next.js / React</li>
            <li>• TailwindCSS</li>
            <li>• PDF Generation</li>
            <li>• Interactive Charts</li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold text-green-700 mb-2">Backend</h3>
          <ul className="text-sm text-green-600 space-y-1">
            <li>• Node.js API Routes</li>
            <li>• MySQL (User Data)</li>
            <li>• Postgres (RAG Context)</li>
            <li>• Data Processing</li>
          </ul>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-bold text-purple-700 mb-2">AI Processing</h3>
          <ul className="text-sm text-purple-600 space-y-1">
            <li>• OpenAI GPT-3.5/4</li>
            <li>• Context Retrieval</li>
            <li>• Smart Analysis</li>
            <li>• Recommendations</li>
          </ul>
        </div>
      </div>

      {/* Flow Description */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold text-gray-700 mb-2">Process Overview:</h3>
        <p className="text-sm text-gray-600">
          The user completes an assessment form, which triggers a series of
          backend processes including data storage, context retrieval from a
          knowledge base, AI-powered analysis using OpenAI's API, and finally
          the generation of personalized recommendations and downloadable
          reports.
        </p>
      </div>
    </div>
  )
}

export default FlowDiagram
