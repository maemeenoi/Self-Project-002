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
import MVPMaturityTable from "./MVPMaturityTable"

const MVPCloudMaturityAssessment = ({ clientData, page = 1 }) => {
  const { cloudMaturityAssessment } = clientData

  // Process dimensional scores for radar chart
  const radarData =
    cloudMaturityAssessment.subtopics.find(
      (topic) => topic.title === "Dimensional Analysis"
    )?.dimensionalScores || []

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

  if (page === 1) {
    return (
      <div className="w-full h-full bg-white p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          {cloudMaturityAssessment.sectionTitle}
        </h1>

        <div className="grid grid-cols-2 gap-6 h-full">
          {/* Left Column */}
          <div className="flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-blue-500 mb-1">
                Understanding Cloud Maturity
              </h2>
              <p className="text-sm text-gray-800">
                {understandingCloudMaturity.content}
              </p>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-blue-500 mb-1">
                Current Cloud Maturity Level
              </h2>
              <p className="text-sm text-gray-800">
                {currentCloudMaturityLevel.content}
              </p>
            </div>

            {/* Overall Score Card */}
            <div className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold mb-1">
                    Overall Cloud Maturity Score
                  </h3>
                  <p className="text-xs opacity-80">
                    Based on comprehensive assessment across 6 dimensions
                  </p>
                </div>
                <div className="text-3xl font-bold">
                  {cloudMaturityAssessment.overallScore}/5.0
                </div>
              </div>
            </div>

            {/* Dimensional Analysis Content */}
            <div className="mt-4">
              <h2 className="text-lg font-bold text-blue-500 mb-1">
                Dimensional Analysis
              </h2>
              <p className="text-sm text-gray-800">
                {dimensionalAnalysis.content}
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            {/* Radar Chart for Dimensional Analysis */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-blue-500 mb-1">
                Maturity Dimensions
              </h2>
              <div
                className="bg-blue-900 p-3 rounded-lg"
                style={{ height: "240px" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    data={radarData}
                  >
                    <PolarGrid stroke="#525073" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      stroke="#ffffff"
                      tick={{ fill: "#ffffff", fontSize: 9 }}
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
                    <Legend
                      wrapperStyle={{ color: "#ffffff", fontSize: "10px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2E274C",
                        borderColor: "#4F4D6A",
                        color: "#ffffff",
                        fontSize: "10px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Growth Trajectory & Recommendations */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-blue-500 mb-1">
                Growth Trajectory & Recommendations
              </h2>
              <p className="text-sm text-gray-800 mb-2">
                {growthTrajectory.content}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Short-Term Focus */}
                <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-600 mb-1 text-sm">
                    Short-Term Focus Areas
                  </h3>
                  <ul className="list-disc pl-4">
                    {growthTrajectory.shortTermFocus?.map((item, index) => (
                      <li key={index} className="text-xs text-gray-700 mb-1">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Long-Term Objectives */}
                <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                  <h3 className="font-bold text-indigo-600 mb-1 text-sm">
                    Long-Term Strategic Objectives
                  </h3>
                  <ul className="list-disc pl-4">
                    {growthTrajectory.longTermObjectives?.map((item, index) => (
                      <li key={index} className="text-xs text-gray-700 mb-1">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto col-span-2">
                  <p className="text-xs text-gray-600 mt-1">
                    See detailed maturity table on the next page. Your current
                    state is highlighted in
                    <span className="text-green-600 font-bold ml-1 mr-1">
                      green
                    </span>
                    and target state is highlighted in
                    <span className="text-blue-600 font-bold ml-1">blue</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (page === 2) {
    return (
      <div className="w-full h-full bg-white p-4">
        <MVPMaturityTable maturityData={clientData.cloudMaturityAssessment} />
      </div>
    )
  }
  // Default case
  return (
    <div className="w-full h-full bg-white p-6">
      <h1 className="text-2xl font-bold text-blue-600">Page not available</h1>
    </div>
  )
}

export default MVPCloudMaturityAssessment
