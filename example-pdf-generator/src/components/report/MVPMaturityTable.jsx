import React from "react"

const MVPMaturityTable = ({ maturityData }) => {
  // Define the table structure
  const columns = [
    { id: "practice", title: "Practice" },
    { id: "buildManagement", title: "Build management and CI" },
    { id: "environment", title: "Environment and deployments" },
    { id: "release", title: "Release management and compliance" },
    { id: "testing", title: "Testing" },
    { id: "dataManagement", title: "Data Management" },
  ]

  // Maturity levels from highest to lowest
  const levels = [
    {
      id: "optimizing",
      level: 3,
      title: "Level 3: Optimizing",
      subtitle: "Focus on process improvements",
      cells: {
        buildManagement:
          "Teams regularly meet to discuss integration problems and resolve them with automation, faster feedback and better visibility",
        environment:
          "All environments managed effectively. Provisioning fully automated. Virtualization used if applicable",
        release:
          "Operations and delivery team regularly collaborate to manage risk and reduce cycle time",
        testing:
          "Production rollbacks rare. Defects found and fixed immediately",
        dataManagement:
          "Release to release feedback loop of database performance and deployment process",
      },
    },
    {
      id: "quantitativelyManaged",
      level: 2,
      title: "Level 2: Quantitatively managed",
      subtitle: "Process measured and controlled",
      cells: {
        buildManagement:
          "Build metrics gathered, made visible, and acted on. Builds are not left broken",
        environment:
          "Orchestrated deployment managed. Release and rollback processes tested",
        release:
          "Environment and application health monitored and proactively managed. Cycle time monitored",
        testing:
          "Quality metrics and trends tracked. Non functional requirements defined and measured",
        dataManagement:
          "Database upgrades and rollback tested with every deployment. Database performance monitored and optimized",
      },
    },
    {
      id: "consistent",
      level: 1,
      title: "Level 1: Consistent",
      subtitle:
        "Automated processes applied across whole application lifecycle",
      cells: {
        buildManagement:
          "Automated build and test cycle every time a change is committed. Dependencies managed Reuse of scripts and tools",
        environment:
          "Fully automated, self service push-button process for deploying software. Same process to deploy to every environments",
        release:
          "Change management and approval processes defined and enforced. Regulatory and compliance conditions met",
        testing:
          "Automated unit and acceptance testing. The latter written with testers. Testing part of the development process",
        dataManagement:
          "Database changes performed automatically as part of the deployment process",
      },
    },
    {
      id: "repeatable",
      level: 0,
      title: "Level 0: Repeatable",
      subtitle: "Process documented and partly automated",
      cells: {
        buildManagement:
          "Regular automated builds and testing. Any build can be re-created from source control using automated process",
        environment:
          "Automated deployment to some environments. Creation of new environments is cheap. All configurations externalized and versioned",
        release:
          "Painful and infrequent but reliable releases. limited traceability from requirements to release",
        testing: "Automated tests written as part of the story development",
        dataManagement:
          "Changes to database done with automated scripts versioned with application",
      },
    },
    {
      id: "regressive",
      level: -1,
      title: "Level -1: Regressive",
      subtitle: "process unrepeatable, poorly controlled and reactive",
      cells: {
        buildManagement:
          "Manual processes for building software. No management of artifacts and reports",
        environment:
          "Manual process for deploying software. Environment specific binaries. Environments provision manually",
        release: "Infrequent and unreliable releases",
        testing: "Manual testing after development",
        dataManagement: "Data migrations unversioned and performed manually",
      },
    },
  ]

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
    const cellContent = level.cells[columnId]

    if (!cellContent || columnId === "practice") return null

    const currentLevel = practiceMap[columnId]?.current
    const targetLevel = practiceMap[columnId]?.target

    // Determine if this cell should be highlighted
    const isCurrentState = level.level === currentLevel
    const isTargetState =
      level.level === targetLevel && level.level !== currentLevel

    // Apply styling based on state
    const borderStyle = isCurrentState
      ? "border-2 border-green-500"
      : isTargetState
      ? "border-2 border-blue-500"
      : "border border-gray-300"

    return (
      <td
        className={`p-3 text-sm ${borderStyle} text-gray-700`}
        key={`${level.id}-${columnId}`}
      >
        {cellContent}
      </td>
    )
  }

  return (
    <div className="w-full h-full bg-white p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        {maturityData.sectionTitle}
      </h1>

      <p className="text-gray-800 mb-6">
        {maturityData.description} The current state is highlighted in
        <span className="text-green-600 font-bold mx-1">green</span>
        and the target state is highlighted in
        <span className="text-blue-600 font-bold mx-1">blue</span>.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-green-500">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="text-left p-3 text-white font-semibold border border-green-600"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr
                key={level.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="p-3 text-sm font-medium border border-gray-300 bg-gray-100">
                  <div className="font-bold">{level.title}</div>
                  <div className="text-gray-600 text-xs">{level.subtitle}</div>
                </td>
                {columns.slice(1).map((column) => renderCell(level, column.id))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600 italic">
        Table based on "Maturity Model for Configuration & Release Management",
        Continuous Delivery, Jez Humble & David Farley
      </div>
    </div>
  )
}

export default MVPMaturityTable
