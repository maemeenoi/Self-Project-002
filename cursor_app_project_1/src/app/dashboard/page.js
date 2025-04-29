"use client"

import { useState, useEffect } from "react"
import CustomRadarChart from "@/components/charts/RadarChart"
import CustomBarChart from "@/components/charts/BarChart"
import CustomGaugeChart from "@/components/charts/GaugeChart"
import ReportGenerator from "@/components/ReportGenerator"
import { processAssessmentData } from "@/lib/assessmentUtils"

export default function Dashboard() {
  const [assessmentData, setAssessmentData] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/responses/latest")
        if (!response.ok) {
          throw new Error("Failed to fetch assessment data")
        }
        const data = await response.json()
        setAssessmentData(processAssessmentData(data))
      } catch (err) {
        setError(err.message)
      }
    }

    fetchData()
  }, [])

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    )
  }

  if (!assessmentData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Dimensional Scores</h2>
          <CustomRadarChart data={assessmentData.dimensionalScores} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Category Scores</h2>
          <CustomBarChart data={assessmentData.categoryScores} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Overall Maturity Score</h2>
        <CustomGaugeChart value={assessmentData.overallScore} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Generate Report</h2>
        <ReportGenerator
          clientData={assessmentData}
          onGenerationStart={() => setIsGenerating(true)}
          onGenerationComplete={() => {
            setIsGenerating(false)
            setIsComplete(true)
          }}
          isGenerating={isGenerating}
          isComplete={isComplete}
        />
      </div>
    </div>
  )
}
