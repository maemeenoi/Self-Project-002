// ReportRecommendations.jsx - Optimized for PDF
import React from "react"

const ReportRecommendations = ({ clientData }) => {
  const hasAIInsights = !!(
    clientData.recommendations?.keyRecommendations?.length > 0 ||
    clientData.timelineSteps
  )

  const recommendations = clientData.recommendations?.keyRecommendations || []
  const roadmap = clientData.recommendations?.implementationRoadmap || []

  // Helper to get priority styling
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "Critical":
        return { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" }
      case "High":
        return { bg: "#fff7ed", border: "#f97316", text: "#ea580c" }
      case "Medium":
        return { bg: "#fefce8", border: "#eab308", text: "#ca8a04" }
      default:
        return { bg: "#f0f9ff", border: "#3b82f6", text: "#2563eb" }
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
          Recommendations & Action Plan
        </h1>
        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            margin: "4px 0 0 0",
          }}
        >
          {hasAIInsights
            ? "AI-Generated Strategic Recommendations"
            : "Strategic Recommendations and Implementation Roadmap"}
        </p>
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          flex: "1",
        }}
      >
        {/* Left Column - Key Recommendations */}
        <div>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              margin: "0 0 12px 0",
            }}
          >
            Strategic Recommendations
          </h2>

          <div
            style={{
              maxHeight: "400px",
              overflowY: "hidden",
            }}
          >
            {recommendations.slice(0, 6).map((rec, index) => {
              const style = getPriorityStyle(rec.priority)
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: style.bg,
                    border: `1px solid ${style.border}`,
                    borderLeft: `4px solid ${style.border}`,
                    borderRadius: "6px",
                    padding: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "6px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#374151",
                        margin: "0",
                        lineHeight: "1.3",
                        flex: "1",
                        paddingRight: "8px",
                      }}
                    >
                      {rec.title}
                    </h3>
                    <span
                      style={{
                        backgroundColor: style.border,
                        color: "#ffffff",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        fontSize: "8px",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rec.priority || "Medium"}
                    </span>
                  </div>

                  {rec.description && (
                    <p
                      style={{
                        fontSize: "9px",
                        color: style.text,
                        margin: "0 0 6px 0",
                        lineHeight: "1.3",
                      }}
                    >
                      {rec.description.length > 150
                        ? rec.description.substring(0, 150) + "..."
                        : rec.description}
                    </p>
                  )}

                  {rec.rationale && (
                    <p
                      style={{
                        fontSize: "8px",
                        color: "#6b7280",
                        margin: "0",
                        lineHeight: "1.3",
                        fontStyle: "italic",
                      }}
                    >
                      {rec.rationale.length > 120
                        ? rec.rationale.substring(0, 120) + "..."
                        : rec.rationale}
                    </p>
                  )}

                  {rec.pillar && (
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "8px",
                        color: "#6b7280",
                      }}
                    >
                      Pillar: {rec.pillar}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {recommendations.length > 6 && (
            <p
              style={{
                fontSize: "9px",
                color: "#6b7280",
                fontStyle: "italic",
                margin: "8px 0 0 0",
              }}
            >
              + {recommendations.length - 6} additional recommendations in
              detailed appendix
            </p>
          )}
        </div>

        {/* Right Column - Implementation Roadmap */}
        <div>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              margin: "0 0 12px 0",
            }}
          >
            Implementation Roadmap
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateRows: "repeat(4, 1fr)",
              gap: "10px",
              maxHeight: "450px",
            }}
          >
            {roadmap.slice(0, 4).map((phase, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      fontSize: "11px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "8px",
                    }}
                  >
                    {index + 1}
                  </div>
                  <h3
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                      margin: "0",
                    }}
                  >
                    {phase.phase}
                  </h3>
                </div>

                <ul
                  style={{
                    margin: "0",
                    paddingLeft: "12px",
                    fontSize: "9px",
                    color: "#4b5563",
                    lineHeight: "1.4",
                  }}
                >
                  {phase.actions?.slice(0, 4).map((action, actionIndex) => (
                    <li key={actionIndex} style={{ marginBottom: "3px" }}>
                      {action.length > 80
                        ? action.substring(0, 80) + "..."
                        : action}
                    </li>
                  ))}
                  {phase.actions?.length > 4 && (
                    <li
                      style={{
                        fontStyle: "italic",
                        color: "#6b7280",
                      }}
                    >
                      + {phase.actions.length - 4} more actions
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
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
          Page 4 of 6 • Recommendations & Action Plan •{" "}
          {clientData?.reportMetadata?.organizationName || "Organization"}{" "}
          FinOps Assessment
        </p>
      </div>
    </div>
  )
}

export default ReportRecommendations
