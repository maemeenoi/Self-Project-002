import React from "react"

const MVPMaturityTable = ({ maturityData }) => {
  // Create a map of practice areas with their current and target levels
  const practiceMap = {}
  maturityData.practiceAreas.forEach((practice) => {
    practiceMap[practice.id] = {
      current: practice.currentLevel,
      target: practice.targetLevel,
    }
  })

  // Function to render a table cell with appropriate highlighting
  const renderCell = (level, columnId) => {
    // Get current and target levels for this practice
    const currentLevel = practiceMap[columnId]?.current
    const targetLevel = practiceMap[columnId]?.target

    // Determine if this cell should be highlighted
    const isCurrentState = level.level === currentLevel
    const isTargetState =
      level.level === targetLevel && level.level !== currentLevel

    // Cell content based on level and column - shortened for better fit
    let cellContent = ""

    if (columnId === "buildManagement") {
      if (level.level === 3)
        cellContent =
          "Teams regularly meet to discuss integration problems and resolve them with automation"
      if (level.level === 2)
        cellContent = "Build metrics gathered, made visible, and acted on"
      if (level.level === 1)
        cellContent =
          "Automated build and test cycle every time a change is committed"
      if (level.level === 0)
        cellContent = "Regular automated builds and testing"
      if (level.level === -1)
        cellContent = "Manual processes for building software"
    }

    if (columnId === "environment") {
      if (level.level === 3)
        cellContent =
          "All environments managed effectively. Provisioning fully automated"
      if (level.level === 2)
        cellContent =
          "Orchestrated deployment managed. Release and rollback processes tested"
      if (level.level === 1)
        cellContent =
          "Fully automated, self service process for deploying software"
      if (level.level === 0)
        cellContent = "Automated deployment to some environments"
      if (level.level === -1)
        cellContent = "Manual process for deploying software"
    }

    if (columnId === "release") {
      if (level.level === 3)
        cellContent =
          "Operations and delivery team regularly collaborate to manage risk"
      if (level.level === 2)
        cellContent = "Environment and application health monitored proactively"
      if (level.level === 1)
        cellContent =
          "Change management and approval processes defined and enforced"
      if (level.level === 0)
        cellContent = "Painful and infrequent but reliable releases"
      if (level.level === -1) cellContent = "Infrequent and unreliable releases"
    }

    if (columnId === "testing") {
      if (level.level === 3)
        cellContent =
          "Production rollbacks rare. Defects found and fixed immediately"
      if (level.level === 2) cellContent = "Quality metrics and trends tracked"
      if (level.level === 1)
        cellContent = "Automated unit and acceptance testing"
      if (level.level === 0)
        cellContent = "Automated tests written as part of development"
      if (level.level === -1) cellContent = "Manual testing after development"
    }

    if (columnId === "dataManagement") {
      if (level.level === 3)
        cellContent = "Release to release feedback loop of database performance"
      if (level.level === 2)
        cellContent =
          "Database upgrades and rollback tested with every deployment"
      if (level.level === 1)
        cellContent =
          "Database changes performed automatically as part of deployment"
      if (level.level === 0)
        cellContent = "Changes to database done with automated scripts"
      if (level.level === -1)
        cellContent = "Data migrations unversioned and performed manually"
    }

    // Apply styling based on state
    let borderStyle = "border border-gray-200"
    let labelText = null

    if (isCurrentState) {
      borderStyle = "border-0"
      labelText = (
        <div className="mt-1 text-xs text-green-600 font-semibold">
          Current State
        </div>
      )
    } else if (isTargetState) {
      borderStyle = "border-0"
      labelText = (
        <div className="mt-1 text-xs text-blue-600 font-semibold">
          Target State
        </div>
      )
    }

    // Add background color based on state
    const bgColor = isCurrentState
      ? "bg-green-50 border-green-200"
      : isTargetState
      ? "bg-blue-50 border-blue-200"
      : ""

    return (
      <td className={`p-1 text-xs ${borderStyle} ${bgColor} text-gray-700`}>
        {cellContent}
        {labelText}
      </td>
    )
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-blue-600 mb-3">
        Continuous Delivery Maturity Assessment Table
      </h1>
      <p className="text-sm mb-2">
        This assessment evaluates your organization's continuous delivery
        capabilities across key practice areas.
        <br />
        <span className="text-sm">
          Note: Your current state is highlighted in{" "}
          <span className="text-green-600 font-bold">green</span> and target
          state is highlighted in{" "}
          <span className="text-blue-600 font-bold">blue</span>.
        </span>
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-green-500">
              <th className="text-left p-2 text-white font-semibold border border-green-600 text-xs w-1/6">
                Practice
              </th>
              <th className="text-left p-2 text-white font-semibold border border-green-600 text-xs">
                Build management and CI
              </th>
              <th className="text-left p-2 text-white font-semibold border border-green-600 text-xs">
                Environment and deployments
              </th>
              <th className="text-left p-2 text-white font-semibold border border-green-600 text-xs">
                Release management and compliance
              </th>
              <th className="text-left p-2 text-white font-semibold border border-green-600 text-xs">
                Testing
              </th>
              <th className="text-left p-2 text-white font-semibold border border-green-600 text-xs">
                Data Management
              </th>
            </tr>
          </thead>
          <tbody>
            {maturityData.maturityLevels.map((level) => (
              <tr key={level.level} className="hover:bg-gray-50">
                <td className="p-2 text-xs font-medium border border-gray-200 bg-gray-100">
                  <div className="font-bold">{level.name}</div>
                  <div className="text-gray-600 text-xs">
                    {level.subtitle || level.description}
                  </div>
                </td>
                {renderCell(level, "buildManagement")}
                {renderCell(level, "environment")}
                {renderCell(level, "release")}
                {renderCell(level, "testing")}
                {renderCell(level, "dataManagement")}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-sm text-gray-600 italic">
          Table based on "Maturity Model for Configuration & Release
          Management", Continuous Delivery, Jez Humble & David Farley
        </div>
      </div>
    </div>
  )
}

export default MVPMaturityTable
