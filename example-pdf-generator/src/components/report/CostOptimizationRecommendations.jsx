// components/report/CostOptimizationRecommendations.jsx
import React from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

const CostOptimizationRecommendations = ({ clientData }) => {
  const { costOptimizationRecommendations, cloudSpend } = clientData

  // Process data for savings by category chart
  const savingsData = [
    { name: "Compute Optimization", value: 95000 },
    { name: "Storage Management", value: 42000 },
    { name: "Reserved Instances", value: 78000 },
    { name: "License Optimization", value: 35000 },
    { name: "Idle Resources", value: 28000 },
  ]

  // Calculate total savings
  const totalSavings = savingsData.reduce((sum, item) => sum + item.value, 0)

  // Calculate percentages for each category
  const savingsWithPercentages = savingsData.map((item) => ({
    ...item,
    percentage: Math.round((item.value / totalSavings) * 100),
  }))

  // Colors for pie chart
  const COLORS = ["#4FC3F7", "#4DB6AC", "#FFD54F", "#FF8A65", "#BA68C8"]

  // Detailed recommendations from the AI analysis
  const recommendations = [
    {
      category: "Compute Optimization",
      details:
        "Our AI analysis identified 32 oversized compute instances that can be downsized without performance impact, based on actual utilization patterns over the past 90 days.",
      impact: "$95,000 annual savings",
      difficulty: "Low",
      timeToImplement: "2-3 weeks",
    },
    {
      category: "Reserved Instance Coverage",
      details:
        "Increase RI coverage from current 42% to 75% for consistently running workloads. AI analysis shows stable usage patterns for 65 instances that would benefit from 1-year commitments.",
      impact: "$78,000 annual savings",
      difficulty: "Medium",
      timeToImplement: "1 month",
    },
    {
      category: "Storage Lifecycle Management",
      details:
        "Implement automated lifecycle policies to move infrequently accessed data to lower-cost storage tiers. 43% of current storage hasn't been accessed in over 90 days.",
      impact: "$42,000 annual savings",
      difficulty: "Medium",
      timeToImplement: "1-2 months",
    },
    {
      category: "License Optimization",
      details:
        "Consolidate redundant software licenses and transition to cloud-native alternatives where possible. AI identified 28 instances with underutilized premium licenses.",
      impact: "$35,000 annual savings",
      difficulty: "Medium",
      timeToImplement: "2-3 months",
    },
    {
      category: "Idle Resource Cleanup",
      details:
        "Implement automated policies to identify and shut down idle resources. Our analysis found 45 non-production resources running 24/7 with minimal utilization.",
      impact: "$28,000 annual savings",
      difficulty: "Low",
      timeToImplement: "2 weeks",
    },
  ]

  return (
    <div className="w-full h-full bg-white p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        04. AI-Powered Cost Optimization Recommendations
      </h1>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              AI Analysis Approach
            </h2>
            <p className="text-gray-800 mb-4">
              Our AI engine analyzed your cloud usage patterns, resource
              configurations, and pricing options to identify optimization
              opportunities. The analysis incorporated:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li className="text-gray-800">
                Historical utilization data across all cloud resources
              </li>
              <li className="text-gray-800">
                Application workload patterns and seasonality
              </li>
              <li className="text-gray-800">
                Industry benchmarks and best practices
              </li>
              <li className="text-gray-800">
                Provider-specific pricing models and discount options
              </li>
            </ul>
          </div>

          {/* Savings Opportunities by Category */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500 mb-2">
              Savings Opportunities by Category
            </h2>
            <div
              className="bg-[#192048] p-4 rounded-lg"
              style={{ height: "300px" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={savingsWithPercentages}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {savingsData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: "#2E274C",
                      borderColor: "#4F4D6A",
                      color: "#ffffff",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#ffffff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Total Potential Savings */}
          <div className="mt-auto bg-gradient-to-r from-green-500 to-teal-600 p-5 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">
                  Total Identified Savings
                </h3>
                <p className="text-sm opacity-80">
                  Across all optimization categories
                </p>
              </div>
              <div className="text-4xl font-bold">
                ${totalSavings.toLocaleString()}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded">
                <p className="text-sm">% of Current Spend</p>
                <p className="text-2xl font-bold">
                  {Math.round((totalSavings / cloudSpend.total) * 100)}%
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded">
                <p className="text-sm">ROI Timeline</p>
                <p className="text-2xl font-bold">3 months</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-blue-500 mb-4">
            Detailed Recommendations
          </h2>

          {/* Recommendation Cards */}
          <div
            className="space-y-4 overflow-auto"
            style={{ maxHeight: "480px" }}
          >
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{rec.category}</h3>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {rec.impact}
                  </span>
                </div>
                <p className="text-gray-700 mb-3 text-sm">{rec.details}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Difficulty:{" "}
                    <span
                      className={`font-medium ${
                        rec.difficulty === "Low"
                          ? "text-green-600"
                          : rec.difficulty === "Medium"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {rec.difficulty}
                    </span>
                  </span>
                  <span>Implementation Time: {rec.timeToImplement}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Implementation Guidance */}
          <div className="mt-auto p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-600 mb-2">
              Implementation Guidance
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              We recommend implementing these optimizations in phases, starting
              with the quick wins that offer immediate savings with minimal
              effort. Our analysis includes a detailed implementation roadmap in
              Section 9.
            </p>
            <p className="text-sm text-gray-700">
              Each recommendation includes detailed technical steps and can be
              facilitated through our automated Infrastructure as Code templates
              to minimize implementation risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CostOptimizationRecommendations
