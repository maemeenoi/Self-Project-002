// ReportMaturityAssessment.jsx - Optimized for PDF
import React from "react"
import GaugeMeter from "@/components/dashboard/finops/GaugeMeter"

const ReportMaturityAssessment = ({ clientData }) => {
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
          FinOps Maturity Assessment
        </h1>
        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            margin: "4px 0 0 0",
          }}
        >
          Detailed Pillar Analysis and Scoring
        </p>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "20px",
          flex: "1",
        }}
      >
        {/* Left: Radar Chart */}
        <div>
          <h2
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              margin: "0 0 12px 0",
              textAlign: "center",
            }}
          >
            FinOps Maturity Overview
          </h2>
          <GaugeMeter
            value={clientData?.overallFinOpsMaturity?.percentage / 10 || 0}
            maxValue={10}
            maturityLevel={
              clientData?.overallFinOpsMaturity?.level || "Not Available"
            }
            percentage={clientData?.overallFinOpsMaturity?.percentage || 0}
            totalScore={clientData?.overallFinOpsMaturity?.totalScore || 0}
            maxScore={clientData?.overallFinOpsMaturity?.maxScore || 0}
          />
        </div>

        {/* Right: Pillar Details */}
        <div>
          <h2
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              margin: "0 0 12px 0",
            }}
          >
            Pillar Breakdown
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {pillars.slice(0, 6).map((pillar, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderLeft: `4px solid ${getMaturityColor(
                    pillar.maturityLevel
                  )}`,
                  borderRadius: "6px",
                  padding: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#374151",
                      margin: "0",
                      lineHeight: "1.2",
                    }}
                  >
                    {pillar.name}
                  </h3>
                  <div
                    style={{
                      backgroundColor: getMaturityColor(pillar.maturityLevel),
                      color: "#ffffff",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      fontSize: "8px",
                      fontWeight: "600",
                    }}
                  >
                    {pillar.percentage}%
                  </div>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "3px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: `${pillar.percentage}%`,
                      height: "100%",
                      backgroundColor: getMaturityColor(pillar.maturityLevel),
                      borderRadius: "3px",
                    }}
                  ></div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "8px",
                      color: "#6b7280",
                    }}
                  >
                    Score: {pillar.score}/{pillar.maxScore}
                  </span>
                  <span
                    style={{
                      fontSize: "8px",
                      color: "#6b7280",
                    }}
                  >
                    {pillar.maturityLevel} Maturity
                  </span>
                </div>

                <p
                  style={{
                    fontSize: "8px",
                    color: "#4b5563",
                    margin: "0",
                    lineHeight: "1.3",
                  }}
                >
                  {pillar.maturityDescription?.substring(0, 120) + "..." ||
                    pillar.description}
                </p>
              </div>
            ))}
          </div>

          {/* Maturity Scale Legend */}
          <div style={{ marginTop: "16px" }}>
            <h3
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
                margin: "0 0 8px 0",
              }}
            >
              Maturity Scale
            </h3>
            <div
              style={{
                display: "flex",
                gap: "12px",
                fontSize: "9px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#ef4444",
                    borderRadius: "2px",
                    marginRight: "4px",
                  }}
                ></div>
                <span style={{ color: "#374151" }}>Low (&lt;30%)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#f59e0b",
                    borderRadius: "2px",
                    marginRight: "4px",
                  }}
                ></div>
                <span style={{ color: "#374151" }}>Medium (30-70%)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#22c55e",
                    borderRadius: "2px",
                    marginRight: "4px",
                  }}
                ></div>
                <span style={{ color: "#374151" }}>High (70%+)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          paddingTop: "12px",
          marginTop: "16px",
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
          Page 3 of 6 • FinOps Maturity Assessment •{" "}
          {clientData?.reportMetadata?.organizationName || "Organization"}{" "}
          FinOps Assessment
        </p>
      </div>
    </div>
  )
}

export default ReportMaturityAssessment
