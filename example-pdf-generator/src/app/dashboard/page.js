"use client"
import { useState } from "react"
import dynamic from "next/dynamic"
import CloudCostDashboard from "@/components/report/CloudCostDashboard"

// Import your data directly
import clientData from "../mvp-sample-data.json"

// Dynamically import the ReportGenerator to avoid SSR issues
const ReportGenerator = dynamic(
  () => import("@/components/report/ReportGenerator"),
  {
    ssr: false,
  }
)

const CloudCostReportDemo = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          MakeStuffGo Cloud Cost Report
        </h1>
        <p className="text-gray-600">
          Generate detailed cloud cost efficiency reports for your clients
        </p>
      </header>

      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h2 className="text-xl font-semibold mb-3">Client Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Organization Name</p>
            <p className="font-medium">
              {clientData.reportMetadata.organizationName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Report Period</p>
            <p className="font-medium">
              {clientData.reportMetadata.reportPeriod}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cloud Maturity Score</p>
            <p className="font-medium">
              {clientData.cloudMaturityAssessment.overallScore}/5.0
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Report Date</p>
            <p className="font-medium">
              {clientData.reportMetadata.reportDate}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <p className="text-sm text-gray-500 mb-1">Total Cloud Spend</p>
          <p className="text-2xl font-bold">
            ${clientData.cloudSpend.total.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-sm text-gray-500 mb-1">Potential Annual Savings</p>
          <p className="text-2xl font-bold">
            ${clientData.cloudSpend.annualSavingsOpportunity.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Report Sections</h2>
        <div className="grid grid-cols-1 gap-2">
          {[
            "Cover Page",
            "Table of Contents",
            "Executive Summary",
            "Cloud Maturity Assessment",
            "Cloud Expenditure Analysis",
            "Cost Optimization Recommendations",
            "Infrastructure as Code Optimization",
            "Action Plan & Timeline",
          ].map((section, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded flex items-center"
            >
              <div className="w-5 h-5 mr-3 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                {index + 1}
              </div>
              <span>{section}</span>
            </div>
          ))}
        </div>
      </div>

      <>
        <CloudCostDashboard clientData={clientData} />
      </>

      <div className="flex justify-center">
        <ReportGenerator
          clientData={clientData}
          onGenerationStart={() => setIsGenerating(true)}
          onGenerationComplete={() => {
            setIsGenerating(false)
            setIsComplete(true)
            setTimeout(() => setIsComplete(false), 3000)
          }}
          isGenerating={isGenerating}
          isComplete={isComplete}
        />
      </div>
    </div>
  )
}

export default CloudCostReportDemo
