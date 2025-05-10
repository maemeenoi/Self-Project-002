// src/components/CloudPillarCards.jsx
"use client"

export default function CloudPillarCards({ data, maxCards = 6 }) {
  // Helper function to get color based on score
  const getScoreColor = (score) => {
    if (score < 1.5) return "#ef4444" // Red
    if (score < 2.5) return "#f59e0b" // Orange
    if (score < 3.5) return "#3b82f6" // Blue
    if (score < 4.5) return "#10b981" // Green
    return "#059669" // Dark Green
  }

  // Handle missing data
  if (!data || !data.dimensions) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          Maturity Dimensions
        </h2>
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 text-center">
          No dimension data available
        </div>
      </div>
    )
  }

  // Filter valid dimensions and limit to maxCards if needed
  const dimensionsToShow = data.dimensions
    .filter((dim) => dim.score > 0)
    .slice(0, maxCards)

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-bold text-gray-700 mb-4">
        Maturity Dimensions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensionsToShow.map((dimension) => (
          <div
            key={dimension.id}
            className="bg-gray-50 p-4 rounded-lg border-t-4"
            style={{ borderTopColor: getScoreColor(dimension.score) }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-semibold text-gray-800">
                {dimension.name}
              </h3>
              <div
                className="px-2 py-1 rounded-full font-medium text-white text-xs"
                style={{ backgroundColor: getScoreColor(dimension.score) }}
              >
                {dimension.score.toFixed(1)}/5.0
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${dimension.percentage}%`,
                  backgroundColor: getScoreColor(dimension.score),
                }}
              ></div>
            </div>

            <div className="text-xs text-gray-600 mt-1">
              <span className="font-medium">Level:</span>{" "}
              {dimension.maturityName}
            </div>
            <div
              className="text-xs text-gray-600 mt-2 overflow-hidden text-ellipsis"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {dimension.description}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 grid grid-cols-5 gap-1 pt-2 border-t border-gray-200">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
          <span>Initial</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1"></span>
          <span>Developing</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
          <span>Defined</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
          <span>Managed</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-green-700 rounded-full mr-1"></span>
          <span>Optimizing</span>
        </div>
      </div>
    </div>
  )
}
