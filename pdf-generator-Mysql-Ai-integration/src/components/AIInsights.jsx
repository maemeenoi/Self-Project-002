// src/components/AIInsights.jsx
import { useState, useEffect } from "react"

export default function AIInsights({ processedData }) {
  const [insights, setInsights] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (processedData) {
      generateInsights()
    }
  }, [processedData])

  const generateInsights = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Sending data to AI insights API:", processedData)

      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      })

      console.log("AI API Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("AI API Error:", errorData)
        throw new Error(
          errorData.error ||
            `HTTP ${response.status}: ${
              errorData.details || "Failed to generate insights"
            }`
        )
      }

      const data = await response.json()
      console.log("AI Insights received:", data)
      setInsights(data)
    } catch (error) {
      console.error("Error generating insights:", error)

      // Check if it's a network error
      if (error.message.includes("fetch")) {
        setError("Network error: Please check your connection and try again.")
      } else {
        setError(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-gray-600">
            AI is analyzing your assessment...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow border border-red-200">
        <div className="flex items-center space-x-2">
          <svg
            className="h-5 w-5 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.31-.876 2.31-1.993 0-.6-.238-1.169-.65-1.593M2.41 10.72a4.5 4.5 0 005.056 2.7 4.48 4.48 0 002.712-5.058 4.5 4.5 0 00-5.057-2.708A4.48 4.48 0 002.41 10.72z"
            />
          </svg>
          <span className="text-red-700">
            Error generating AI insights: {error}
          </span>
        </div>
        <button
          onClick={generateInsights}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!insights) {
    return null
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <svg
          className="h-6 w-6 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h2 className="text-lg font-bold text-gray-700">AI-Powered Insights</h2>
      </div>

      {/* Executive Summary */}
      {insights.insights?.executiveSummary && (
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-700 mb-2">
            Executive Summary
          </h3>
          <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">
            {insights.insights.executiveSummary}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        {insights.insights?.strengths && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-md font-semibold text-green-800 mb-2 flex items-center">
              <svg
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Key Strengths
            </h3>
            <p className="text-green-700 text-sm">
              {insights.insights.strengths}
            </p>
          </div>
        )}

        {/* Improvement Areas */}
        {insights.insights?.improvementAreas && (
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="text-md font-semibold text-orange-800 mb-2 flex items-center">
              <svg
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.31-.876 2.31-1.993 0-.6-.238-1.169-.65-1.593M2.41 10.72a4.5 4.5 0 005.056 2.7 4.48 4.48 0 002.712-5.058 4.5 4.5 0 00-5.057-2.708A4.48 4.48 0 002.41 10.72z"
                />
              </svg>
              Improvement Opportunities
            </h3>
            <p className="text-orange-700 text-sm">
              {insights.insights.improvementAreas}
            </p>
          </div>
        )}
      </div>

      {/* Next Steps */}
      {insights.insights?.nextSteps && (
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-md font-semibold text-blue-800 mb-2 flex items-center">
            <svg
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            Recommended Next Step (30 days)
          </h3>
          <p className="text-blue-700 text-sm font-medium">
            {insights.insights.nextSteps}
          </p>
        </div>
      )}

      {/* AI-Generated Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-700 mb-3">
            AI-Personalized Recommendations
          </h3>
          <div className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                <h4 className="font-semibold text-gray-800">{rec.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-gray-500">Impact:</span>
                    <p className="text-gray-600">{rec.impact}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Timeline:</span>
                    <p className="text-gray-600">{rec.timeline}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-4 text-xs text-gray-400 text-right">
        AI insights generated at {new Date(insights.timestamp).toLocaleString()}
      </div>
    </div>
  )
}
