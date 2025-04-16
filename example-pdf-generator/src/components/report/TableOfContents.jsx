// components/report/TableOfContents.jsx
import React from "react"

const TableOfContents = () => {
  const leftSections = [
    { id: "1", title: "Executive Summary", page: 3, isMainSection: true },
    { id: "2", title: "Introduction", page: 5, isMainSection: true },
    {
      id: "2.1",
      title: "Cloud Cost Optimization",
      page: 6,
      isMainSection: false,
    },
    {
      id: "2.2",
      title: "Infrastructure as Code",
      page: 7,
      isMainSection: false,
    },
    {
      id: "2.3",
      title: "FinOps Core Principles",
      page: 8,
      isMainSection: false,
    },
    { id: "2.4", title: "Business Value", page: 9, isMainSection: false },
    { id: "3", title: "Investigation Goals", page: 10, isMainSection: true },
    {
      id: "3.1",
      title: "Assessment Objectives",
      page: 11,
      isMainSection: false,
    },
    {
      id: "3.2",
      title: "Data Collection Methods",
      page: 12,
      isMainSection: false,
    },
    { id: "3.3", title: "Analysis Approach", page: 13, isMainSection: false },
    {
      id: "3.4",
      title: "Assessment Framework",
      page: 14,
      isMainSection: false,
    },
  ]

  const rightSections = [
    { id: "4", title: "Evaluation Framework", page: 15, isMainSection: true },
    {
      id: "4.1",
      title: "Cloud Maturity Model",
      page: 16,
      isMainSection: false,
    },
    { id: "4.2", title: "Maturity Levels", page: 17, isMainSection: false },
    { id: "4.3", title: "Scoring Principles", page: 18, isMainSection: false },
    { id: "4.4", title: "Industry Benchmarks", page: 19, isMainSection: false },
    { id: "5", title: "Findings", page: 20, isMainSection: true },
    {
      id: "5.1",
      title: "Cloud Spend Analysis",
      page: 21,
      isMainSection: false,
    },
    {
      id: "5.2",
      title: "Technical Implementation",
      page: 25,
      isMainSection: false,
    },
    {
      id: "5.3",
      title: "Process & Governance",
      page: 29,
      isMainSection: false,
    },
    { id: "6", title: "Recommendations", page: 33, isMainSection: true },
    { id: "7", title: "Appendices", page: 45, isMainSection: true },
  ]

  const renderSection = (section) => {
    return (
      <div
        key={section.id}
        className={`flex ${section.isMainSection ? "mt-4" : "mt-1"}`}
      >
        <div
          className={`${
            section.isMainSection ? "w-36" : "w-36 pl-6"
          } text-gray-700 font-medium ${
            section.isMainSection ? "text-xl" : "text-lg"
          }`}
        >
          {section.id} {section.isMainSection ? section.title : section.title}
        </div>
        <div className="flex-grow mx-4 self-end pb-2">
          <div className="border-b border-dotted border-gray-300"></div>
        </div>
        <div className="text-gray-700 font-medium text-lg">{section.page}</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white">
      {/* Header with light blue background */}
      <div className="w-full bg-gray-100 py-8 px-12 mb-8">
        <h1 className="text-4xl font-bold text-gray-800">TABLE OF CONTENTS</h1>
      </div>

      <div className="px-12 pb-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="border border-gray-200 rounded-md p-8">
            {leftSections.map(renderSection)}
          </div>

          {/* Right Column */}
          <div className="border border-gray-200 rounded-md p-8">
            {rightSections.map(renderSection)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 px-12 pb-4 border-t border-gray-200 pt-4">
        <div className="flex justify-between">
          <div className="text-gray-600">Cloud Cost Efficiency Report</div>
          <div className="text-gray-600">2</div>
        </div>
      </div>
    </div>
  )
}

export default TableOfContents
