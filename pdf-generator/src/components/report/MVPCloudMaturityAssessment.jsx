import React from "react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

const MVPCloudMaturityAssessment = ({ clientData }) => {
  const { cloudMaturityAssessment } = clientData

  // Process dimensional scores for radar chart
  const radarData =
    cloudMaturityAssessment.subtopics
      .find((topic) => topic.title === "Dimensional Analysis")
      ?.dimensionalScores.map((item) => ({
        dimension: item.dimension,
        score: item.score,
        fullMark: 5,
      })) || []

  // Find specific sections
  const findSection = (title) => {
    return (
      cloudMaturityAssessment.subtopics.find(
        (topic) => topic.title === title
      ) || { content: "Not available" }
    )
  }

  const understandingCloudMaturity = findSection("Understanding Cloud Maturity")
  const currentCloudMaturityLevel = findSection("Current Cloud Maturity Level")
  const dimensionalAnalysis = findSection("Dimensional Analysis")
  const growthTrajectory = findSection("Growth Trajectory & Recommendations")

  // Get maturity levels for the visualization
  const maturityLevels = cloudMaturityAssessment.maturityLevels || []

  // Current maturity level
  const currentLevel = cloudMaturityAssessment.currentLevel
  const overallScore = cloudMaturityAssessment.overallScore

  return (
    <div className="w-full h-full bg-white p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        {cloudMaturityAssessment.sectionTitle}
      </h1>

      <div className="grid grid-cols-2 gap-8 h-full">
        {/* Left Column */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Understanding Cloud Maturity
            </h2>
            <p className="text-gray-800">
              {understandingCloudMaturity.content}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Current Cloud Maturity Level
            </h2>
            <p className="text-gray-800">{currentCloudMaturityLevel.content}</p>
          </div>

          {/* Maturity Model Visualization */}
          <div className="mt-4">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Cloud Maturity Model
            </h2>
            <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              {maturityLevels.map((level, index) => {
                // Determine if this is the current level
                const isCurrentLevel = level.level === currentLevel

                return (
                  <div
                    key={index}
                    className={`text-center px-2 py-3 rounded ${
                      isCurrentLevel
                        ? "bg-blue-100 border-2 border-blue-500"
                        : ""
                    }`}
                    style={{ width: "18%" }}
                  >
                    <h3
                      className={`font-bold ${
                        isCurrentLevel ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {level.level}
                    </h3>
                    <p className="text-xs mt-1 text-gray-600">
                      {level.description.length > 60
                        ? `${level.description.substring(0, 60)}...`
                        : level.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Dimensional Analysis Content */}
          <div className="mt-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Dimensional Analysis
            </h2>
            <p className="text-gray-800">{dimensionalAnalysis.content}</p>
          </div>

          {/* Overall Score Card */}
          <div className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 p-5 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">
                  Overall Cloud Maturity Score
                </h3>
                <p className="text-sm opacity-80">
                  Based on comprehensive assessment across 6 dimensions
                </p>
              </div>
              <div className="text-4xl font-bold">{overallScore}/5.0</div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col">
          {/* Radar Chart for Dimensional Analysis */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Maturity Dimensions
            </h2>
            <div
              className="bg-blue-900 p-4 rounded-lg"
              style={{ height: "300px" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={radarData}
                >
                  <PolarGrid stroke="#525073" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    stroke="#ffffff"
                    tick={{ fill: "#ffffff", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 5]}
                    stroke="#ffffff"
                    tick={{ fill: "#ffffff" }}
                  />
                  <Radar
                    name="Maturity Score"
                    dataKey="score"
                    stroke="#4FC3F7"
                    fill="#4FC3F7"
                    fillOpacity={0.6}
                  />
                  <Legend wrapperStyle={{ color: "#ffffff" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2E274C",
                      borderColor: "#4F4D6A",
                      color: "#ffffff",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Growth Trajectory & Recommendations */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Growth Trajectory & Recommendations
            </h2>
            <p className="text-gray-800 mb-3">{growthTrajectory.content}</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Short-Term Focus */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-600 mb-2">
                  Short-Term Focus Areas
                </h3>
                <ul className="list-disc pl-5">
                  {growthTrajectory.shortTermFocus?.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700 mb-1">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Long-Term Objectives */}
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="font-bold text-indigo-600 mb-2">
                  Long-Term Strategic Objectives
                </h3>
                <ul className="list-disc pl-5">
                  {growthTrajectory.longTermObjectives?.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700 mb-1">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MVPCloudMaturityAssessment
