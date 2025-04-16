"use client"

import React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import sampleData from "../sample-json-data.json"

const CloudCostReportSimple = () => {
  // Extract data from the imported JSON
  const {
    reportMetadata,
    executiveSummary,
    cloudMaturityAssessment,
    cloudExpenditureAnalysis,
    costOptimizationRecommendations,
    iacOptimization,
  } = sampleData

  // Format data for charts
  const lineChartData = executiveSummary.monthlyTrend
  const pieChartData = executiveSummary.cloudSpend.byService

  // Format currency values for display
  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`
  }

  // Format percentage values for display
  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // Function to print the current page
  const handlePrint = () => {
    // Add a class to the body for print-specific styles
    document.body.classList.add("print-mode")

    // Print the page
    window.print()

    // Remove the class after printing
    setTimeout(() => {
      document.body.classList.remove("print-mode")
    }, 500)
  }

  return (
    <>
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          /* Hide UI elements when printing */
          button,
          nav,
          footer {
            display: none !important;
          }

          /* Ensure good page breaks */
          .page-break {
            page-break-before: always;
          }

          /* Reset background colors for printing */
          body {
            background: white !important;
          }

          /* Ensure content fits on page */
          .content-wrapper {
            width: 100% !important;
            margin: 0 !important;
            padding: 1cm !important;
          }

          /* Fix charts and images */
          .chart-container {
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="content-wrapper max-w-5xl mx-auto p-6 bg-white shadow-lg">
        {/* Report Header */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">
              CLOUD COST EFFICIENCY REPORT
            </h1>
            <h2 className="text-xl text-gray-600">
              {reportMetadata.organizationName}
            </h2>
            <p className="text-gray-500">{reportMetadata.reportDate}</p>
            <p className="text-gray-500 text-sm">
              Report Period: {reportMetadata.reportPeriod}
            </p>
          </div>
          <div className="text-right flex flex-col">
            <img
              src="https://picsum.photos/120/60"
              alt="Company logo"
              className="mb-2"
            />

            {/* Print Button */}
            <div className="mt-2">
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm flex items-center justify-center"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="mb-10">
          <div className="bg-blue-800 text-white p-3 mb-6">
            <h2 className="text-2xl font-bold">01 Executive Summary</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">OVERVIEW:</h3>
              <p className="mb-4">
                Based on our comprehensive cloud maturity assessment,{" "}
                {reportMetadata.organizationName} has established a solid
                foundation in cloud computing with a maturity score of{" "}
                {executiveSummary.cloudMaturityScore}/5.
              </p>
              <p className="mb-4">
                Our analysis identified a potential{" "}
                {formatPercentage(
                  executiveSummary.cloudSpend.reductionPotential
                )}{" "}
                cost reduction, resulting in{" "}
                {formatCurrency(
                  executiveSummary.cloudSpend.annualSavingsOpportunity
                )}{" "}
                in annual savings.
              </p>
              <div className="mb-4">
                <h4 className="font-semibold">Key Metrics:</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="border p-3 rounded-lg text-center">
                    <div className="text-gray-600 text-sm">
                      Total Cloud Spend
                    </div>
                    <div className="text-xl font-bold">
                      {formatCurrency(executiveSummary.cloudSpend.total)}
                    </div>
                  </div>
                  <div className="border p-3 rounded-lg text-center">
                    <div className="text-gray-600 text-sm">Maturity Score</div>
                    <div className="text-xl font-bold">
                      {executiveSummary.cloudMaturityScore}/5
                    </div>
                  </div>
                </div>
              </div>
              <p>
                The organization has reached the "
                {cloudMaturityAssessment.currentLevel}" level in our cloud
                maturity model, outperforming the industry average of{" "}
                {cloudMaturityAssessment.industryComparison.industryAverage}/5.
              </p>
            </div>

            <div className="flex flex-col space-y-6">
              <div className="chart-container">
                <h3 className="text-xl font-semibold mb-3">
                  Cloud Expenditure
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-container">
                <h3 className="text-xl font-semibold mb-3">Cost Trends</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={lineChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="spend"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="border-2 border-gray-200 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-red-600">
                CHALLENGES:
              </h3>
              <ul className="list-disc pl-6">
                {executiveSummary.challenges.map((challenge, index) => (
                  <li key={`challenge-${index}`}>{challenge}</li>
                ))}
              </ul>
            </div>

            <div className="border-2 border-gray-200 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-green-600">
                RECOMMENDATIONS:
              </h3>
              <ul className="list-disc pl-6">
                {executiveSummary.recommendations.map(
                  (recommendation, index) => (
                    <li key={`recommendation-${index}`}>{recommendation}</li>
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">
              KEY CLOUD MATURITY INSIGHTS:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-800">
                  Dimensional Analysis
                </h4>
                <p>
                  Current Maturity Level: {cloudMaturityAssessment.currentLevel}
                </p>
                <p className="font-medium mt-2">Top Scores:</p>
                <ul className="list-disc pl-6">
                  {cloudMaturityAssessment.dimensionalScores
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3)
                    .map((dimension, index) => (
                      <li key={`dimension-${index}`}>
                        {dimension.dimension}: {dimension.score.toFixed(1)}/5
                      </li>
                    ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800">Focus Areas</h4>
                <p>Short-term improvement opportunities:</p>
                <ul className="list-disc pl-6">
                  {cloudMaturityAssessment.shortTermFocus.map((item, index) => (
                    <li key={`focus-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Infrastructure as Code Section - Page Break for Print */}
        <div className="page-break mb-10">
          <div className="bg-blue-800 text-white p-3 mb-6">
            <h2 className="text-2xl font-bold">
              05 Infrastructure as Code (IaC) Optimization
            </h2>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">
              CURRENT IaC IMPLEMENTATION STATUS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(iacOptimization.currentImplementation).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="bg-gray-100 p-4 rounded-lg text-center"
                  >
                    <p className="font-medium">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </p>
                    <div className="mt-2 h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${value.coverage * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1 text-gray-600">{value.status}</p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">
              IaC OPTIMISATION RECOMMENDATIONS
            </h3>
            <div className="space-y-4">
              {iacOptimization.recommendations.map((recommendation, index) => (
                <p key={`iac-rec-${index}`}>
                  <span className="font-medium">
                    Recommendation {index + 1}:
                  </span>{" "}
                  {recommendation}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">EXPECTED BENEFITS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium text-lg mb-2">COST REDUCTION</h4>
                <p className="text-4xl font-bold text-green-600">
                  {(
                    iacOptimization.expectedBenefits.costReduction * 100
                  ).toFixed(0)}
                  %
                </p>
                <p className="mt-2 text-gray-600">
                  Through resource optimization
                </p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium text-lg mb-2">DEPLOYMENT SPEED</h4>
                <p className="text-4xl font-bold text-blue-600">
                  +
                  {(
                    iacOptimization.expectedBenefits.deploymentSpeed * 100
                  ).toFixed(0)}
                  %
                </p>
                <p className="mt-2 text-gray-600">Faster time to market</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-medium text-lg mb-2">
                  RESOURCE EFFICIENCY
                </h4>
                <p className="text-4xl font-bold text-purple-600">
                  +
                  {(
                    iacOptimization.expectedBenefits.resourceEfficiency * 100
                  ).toFixed(0)}
                  %
                </p>
                <p className="mt-2 text-gray-600">
                  Better resource utilization
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CloudCostReportSimple
