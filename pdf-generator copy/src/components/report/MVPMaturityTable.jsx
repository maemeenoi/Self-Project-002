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

  // Function to determine cell styling and content
  const getCellContent = (level, columnId) => {
    // Get current and target levels for this practice
    const currentLevel = practiceMap[columnId]?.current
    const targetLevel = practiceMap[columnId]?.target

    // Cell content based on level and column - using same text as the PDF
    let cellContent = {
      text: "",
      isCurrentState: level.level === currentLevel,
      isTargetState:
        level.level === targetLevel && level.level !== currentLevel,
    }

    if (columnId === "buildManagement") {
      if (level.level === 3)
        cellContent.text =
          "Teams regularly meet to discuss integration problems and resolve them with automation"
      if (level.level === 2)
        cellContent.text = "Build metrics gathered, made visible, and acted on"
      if (level.level === 1)
        cellContent.text =
          "Automated build and test cycle every time a change is committed"
      if (level.level === 0)
        cellContent.text = "Regular automated builds and testing"
      if (level.level === -1)
        cellContent.text = "Manual processes for building software"
    }

    if (columnId === "environment") {
      if (level.level === 3)
        cellContent.text =
          "All environments managed effectively. Provisioning fully automated"
      if (level.level === 2)
        cellContent.text =
          "Orchestrated deployment managed. Release and rollback processes tested"
      if (level.level === 1)
        cellContent.text =
          "Fully automated, self service process for deploying software"
      if (level.level === 0)
        cellContent.text = "Automated deployment to some environments"
      if (level.level === -1)
        cellContent.text = "Manual process for deploying software"
    }

    if (columnId === "release") {
      if (level.level === 3)
        cellContent.text =
          "Operations and delivery team regularly collaborate to manage risk"
      if (level.level === 2)
        cellContent.text =
          "Environment and application health monitored proactively"
      if (level.level === 1)
        cellContent.text =
          "Change management and approval processes defined and enforced"
      if (level.level === 0)
        cellContent.text = "Painful and infrequent but reliable releases"
      if (level.level === -1)
        cellContent.text = "Infrequent and unreliable releases"
    }

    if (columnId === "testing") {
      if (level.level === 3)
        cellContent.text =
          "Production rollbacks rare. Defects found and fixed immediately"
      if (level.level === 2)
        cellContent.text = "Quality metrics and trends tracked"
      if (level.level === 1)
        cellContent.text = "Automated unit and acceptance testing"
      if (level.level === 0)
        cellContent.text = "Automated tests written as part of development"
      if (level.level === -1)
        cellContent.text = "Manual testing after development"
    }

    if (columnId === "dataManagement") {
      if (level.level === 3)
        cellContent.text =
          "Release to release feedback loop of database performance"
      if (level.level === 2)
        cellContent.text =
          "Database upgrades and rollback tested with every deployment"
      if (level.level === 1)
        cellContent.text =
          "Database changes performed automatically as part of deployment"
      if (level.level === 0)
        cellContent.text = "Changes to database done with automated scripts"
      if (level.level === -1)
        cellContent.text = "Data migrations unversioned and performed manually"
    }

    return cellContent
  }

  return (
    <div className="w-full h-full pb-4">
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

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-sm bg-green-500 text-white font-semibold border border-green-600 w-1/6">
              Practice
            </th>
            <th className="p-2 text-sm bg-green-500 text-white font-semibold border border-green-600">
              Build management and CI
            </th>
            <th className="p-2 text-sm bg-green-500 text-white font-semibold border border-green-600">
              Environment and deployments
            </th>
            <th className="p-2 text-sm bg-green-500 text-white font-semibold border border-green-600">
              Release management and compliance
            </th>
            <th className="p-2 text-sm bg-green-500 text-white font-semibold border border-green-600">
              Testing
            </th>
            <th className="p-2 text-sm bg-green-500 text-white font-semibold border border-green-600">
              Data Management
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Level -1: Regressive */}
          <tr>
            <td className="p-2 text-sm align-top border border-gray-300 bg-gray-100">
              <div className="font-bold">Level -1: Regressive</div>
              <div className="text-xs text-gray-600">
                Process unrepeatable, poorly controlled and reactive
              </div>
            </td>
            {[
              "buildManagement",
              "environment",
              "release",
              "testing",
              "dataManagement",
            ].map((column) => {
              const cellData = getCellContent({ level: -1 }, column)
              return (
                <td
                  key={`-1-${column}`}
                  className={`p-2 border text-sm ${
                    cellData.isCurrentState
                      ? "bg-green-50 text-green-800"
                      : cellData.isTargetState
                      ? "bg-blue-50 text-blue-800"
                      : ""
                  }`}
                >
                  {cellData.text}
                  {cellData.isCurrentState && (
                    <div className="text-xs font-semibold text-green-600 mt-1">
                      Current State
                    </div>
                  )}
                  {cellData.isTargetState && (
                    <div className="text-xs font-semibold text-blue-600 mt-1">
                      Target State
                    </div>
                  )}
                </td>
              )
            })}
          </tr>

          {/* Level 0: Repeatable */}
          <tr>
            <td className="p-2 text-sm align-top border border-gray-300 bg-gray-100">
              <div className="font-bold">Level 0: Repeatable</div>
              <div className="text-xs text-gray-600">
                Process documented and partly automated
              </div>
            </td>
            {[
              "buildManagement",
              "environment",
              "release",
              "testing",
              "dataManagement",
            ].map((column) => {
              const cellData = getCellContent({ level: 0 }, column)
              return (
                <td
                  key={`0-${column}`}
                  className={`p-2 border text-sm ${
                    cellData.isCurrentState
                      ? "bg-green-50 text-green-800"
                      : cellData.isTargetState
                      ? "bg-blue-50 text-blue-800"
                      : ""
                  }`}
                >
                  {cellData.text}
                  {cellData.isCurrentState && (
                    <div className="text-xs font-semibold text-green-600 mt-1">
                      Current State
                    </div>
                  )}
                  {cellData.isTargetState && (
                    <div className="text-xs font-semibold text-blue-600 mt-1">
                      Target State
                    </div>
                  )}
                </td>
              )
            })}
          </tr>

          {/* Level 1: Consistent */}
          <tr>
            <td className="p-2 text-sm align-top border border-gray-300 bg-gray-100">
              <div className="font-bold">Level 1: Consistent</div>
              <div className="text-xs text-gray-600">
                Automated processes applied across whole application lifecycle
              </div>
            </td>
            {[
              "buildManagement",
              "environment",
              "release",
              "testing",
              "dataManagement",
            ].map((column) => {
              const cellData = getCellContent({ level: 1 }, column)
              return (
                <td
                  key={`1-${column}`}
                  className={`p-2 border text-sm ${
                    cellData.isCurrentState
                      ? "bg-green-50 text-green-800"
                      : cellData.isTargetState
                      ? "bg-blue-50 text-blue-800"
                      : ""
                  }`}
                >
                  {cellData.text}
                  {cellData.isCurrentState && (
                    <div className="text-xs font-semibold text-green-600 mt-1">
                      Current State
                    </div>
                  )}
                  {cellData.isTargetState && (
                    <div className="text-xs font-semibold text-blue-600 mt-1">
                      Target State
                    </div>
                  )}
                </td>
              )
            })}
          </tr>

          {/* Level 2: Quantitatively managed */}
          <tr>
            <td className="p-2 text-sm align-top border border-gray-300 bg-gray-100">
              <div className="font-bold">Level 2: Quantitatively managed</div>
              <div className="text-xs text-gray-600">
                Process measured and controlled
              </div>
            </td>
            {[
              "buildManagement",
              "environment",
              "release",
              "testing",
              "dataManagement",
            ].map((column) => {
              const cellData = getCellContent({ level: 2 }, column)
              return (
                <td
                  key={`2-${column}`}
                  className={`p-2 border text-sm ${
                    cellData.isCurrentState
                      ? "bg-green-50 text-green-800"
                      : cellData.isTargetState
                      ? "bg-blue-50 text-blue-800"
                      : ""
                  }`}
                >
                  {cellData.text}
                  {cellData.isCurrentState && (
                    <div className="text-xs font-semibold text-green-600 mt-1">
                      Current State
                    </div>
                  )}
                  {cellData.isTargetState && (
                    <div className="text-xs font-semibold text-blue-600 mt-1">
                      Target State
                    </div>
                  )}
                </td>
              )
            })}
          </tr>

          {/* Level 3: Optimizing */}
          <tr>
            <td className="p-2 text-sm align-top border border-gray-300 bg-gray-100">
              <div className="font-bold">Level 3: Optimizing</div>
              <div className="text-xs text-gray-600">
                Focus on process improvements
              </div>
            </td>
            {[
              "buildManagement",
              "environment",
              "release",
              "testing",
              "dataManagement",
            ].map((column) => {
              const cellData = getCellContent({ level: 3 }, column)
              return (
                <td
                  key={`3-${column}`}
                  className={`p-2 border text-sm ${
                    cellData.isCurrentState
                      ? "bg-green-50 text-green-800"
                      : cellData.isTargetState
                      ? "bg-blue-50 text-blue-800"
                      : ""
                  }`}
                >
                  {cellData.text}
                  {cellData.isCurrentState && (
                    <div className="text-xs font-semibold text-green-600 mt-1">
                      Current State
                    </div>
                  )}
                  {cellData.isTargetState && (
                    <div className="text-xs font-semibold text-blue-600 mt-1">
                      Target State
                    </div>
                  )}
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>

      <div className="mt-2 text-xs text-gray-600 italic text-left">
        Table based on "Maturity Model for Configuration & Release Management",
        Continuous Delivery, Jez Humble & David Farley
      </div>
    </div>
  )
}

export default MVPMaturityTable
