// ReportDetailedResults.jsx - Optimized for PDF
import React from "react"
import FinOpsPillarRadarChart from "@/components/dashboard/finops/FinOpsPillarRadarChart"

const ReportDetailedResults = ({ clientData }) => {
  const pillars = clientData?.finOpsPillars || []

  // Helper function to get color based on maturity level
  const getMaturityColor = (level) => {
    switch (level) {
      case "High":
        return "#22c55e"
      case "Medium":
        return "#f59e0b"
      case "Low":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  // Prepare radar chart data from FinOps pillars
  const getRadarData = () => {
    if (!clientData?.finOpsPillars) return []

    return clientData.finOpsPillars.map((pillar) => ({
      pillar: pillar.name,
      score: pillar.percentage,
      benchmark: 50, // 50% as baseline
      maxScore: 100,
    }))
  }

  return (
    <div
      style={{
        width: "297mm",
        height: "210mm",
        padding: "20mm",
        backgroundColor: "#ffffff",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "2px solid #1e40af",
          paddingBottom: "12px",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1e40af",
            margin: "0",
          }}
        >
          Detailed Assessment Results
        </h1>
        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            margin: "4px 0 0 0",
          }}
        >
          Complete FinOps Pillar Analysis and Scoring Details
        </p>
      </div>

      {/* Assessment Summary Table */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            margin: "0 0 10px 0",
          }}
        >
          FinOps Pillar Summary
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th
                style={{
                  border: "1px solid #d1d5db",
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                FinOps Pillar
              </th>
              <th
                style={{
                  border: "1px solid #d1d5db",
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Score
              </th>
              <th
                style={{
                  border: "1px solid #d1d5db",
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Max
              </th>
              <th
                style={{
                  border: "1px solid #d1d5db",
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Percentage
              </th>
              <th
                style={{
                  border: "1px solid #d1d5db",
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Maturity Level
              </th>
              <th
                style={{
                  border: "1px solid #d1d5db",
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Key Focus Area
              </th>
            </tr>
          </thead>
          <tbody>
            {pillars.map((pillar, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                }}
              >
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px",
                    fontWeight: "500",
                  }}
                >
                  {pillar.name}
                </td>
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {pillar.score}
                </td>
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {pillar.maxScore}
                </td>
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ marginRight: "6px", fontWeight: "600" }}>
                      {pillar.percentage}%
                    </span>
                    <div
                      style={{
                        width: "30px",
                        height: "6px",
                        backgroundColor: "#e5e7eb",
                        borderRadius: "3px",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(pillar.percentage, 100)}%`,
                          height: "100%",
                          backgroundColor: getMaturityColor(
                            pillar.maturityLevel
                          ),
                          borderRadius: "3px",
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: getMaturityColor(pillar.maturityLevel),
                      color: "#ffffff",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      fontSize: "8px",
                      fontWeight: "600",
                    }}
                  >
                    {pillar.maturityLevel}
                  </span>
                </td>
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "8px",
                    fontSize: "9px",
                    color: "#4b5563",
                  }}
                >
                  {pillar.description?.substring(0, 60) + "..." ||
                    "Financial management focus"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed Pillar Analysis */}
      <div style={{ flex: "1" }}>
        <FinOpsPillarRadarChart
          data={getRadarData()}
          width={170}
          height={170}
        />{" "}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          paddingTop: "12px",
          marginTop: "12px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "9px",
            color: "#9ca3af",
            margin: "0",
          }}
        >
          Page 5 of 6 • Detailed Assessment Results •{" "}
          {clientData?.reportMetadata?.organizationName || "Organization"}{" "}
          FinOps Assessment
        </p>
      </div>
    </div>
  )
}

export default ReportDetailedResults
