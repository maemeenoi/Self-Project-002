// ReportExecutiveSummary.jsx - Optimized sizing with better layout positioning
import React from "react"

const ReportExecutiveSummary = ({ clientData }) => {
  const hasAIInsights = !!(
    clientData.executiveSummary ||
    clientData.strengths?.length > 0 ||
    clientData.overallFindings
  )

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
          marginBottom: "24px",
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
          Executive Summary
        </h1>
        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            margin: "4px 0 0 0",
          }}
        >
          FinOps Cloud Maturity Assessment Overview
        </p>
      </div>

      {/* Main Executive Summary Content - Full Width */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            backgroundColor: "#dbeafe",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #3b82f6",
          }}
        >
          <h3
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#1e40af",
              margin: "0 0 8px 0",
            }}
          >
            Assessment Overview
          </h3>
          <p
            style={{
              fontSize: "11px",
              color: "#1f2937",
              margin: "0",
              lineHeight: "1.5",
            }}
          >
            {hasAIInsights && clientData.executiveSummary
              ? clientData.executiveSummary
              : `This FinOps maturity assessment evaluated ${
                  clientData?.reportMetadata?.organizationName ||
                  "your organization"
                } across six key pillars of cloud financial management. The assessment reveals an overall maturity score of ${
                  clientData?.overallFinOpsMaturity?.percentage || 0
                }%, indicating ${
                  clientData?.overallFinOpsMaturity?.level ||
                  "developing capabilities"
                } in FinOps practices. The organization shows promise in cloud adoption but requires strategic improvements in cost visibility, security governance, and operational excellence to achieve optimal cloud financial management.`}
          </p>
        </div>
      </div>

      {/* Overall Findings - Full Width */}
      {hasAIInsights && clientData.overallFindings && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              backgroundColor: "#f3f4f6",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
            }}
          >
            <h3
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                margin: "0 0 8px 0",
              }}
            >
              Overall Findings
            </h3>
            <p
              style={{
                fontSize: "11px",
                color: "#1f2937",
                margin: "0",
                lineHeight: "1.5",
              }}
            >
              {clientData.overallFindings}
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout - Strengths and Improvement Areas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          flex: "1",
        }}
      >
        {/* Key Strengths */}
        <div>
          <div
            style={{
              backgroundColor: "#f0fdf4",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #22c55e",
              height: "100%",
            }}
          >
            <h3
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#15803d",
                margin: "0 0 12px 0",
              }}
            >
              Key Strengths
            </h3>
            <ul
              style={{
                margin: "0",
                paddingLeft: "16px",
                fontSize: "10px",
                color: "#15803d",
                lineHeight: "1.4",
              }}
            >
              {hasAIInsights && clientData.strengths?.length > 0 ? (
                clientData.strengths.map((strength, index) => (
                  <li key={index} style={{ marginBottom: "6px" }}>
                    <span className="text-amber-500 mr-2">•</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))
              ) : (
                <>
                  <p>There is no information here.</p>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Improvement Areas */}
        <div>
          <div
            style={{
              backgroundColor: "#fef2f2",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #ef4444",
              height: "100%",
            }}
          >
            <h3
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#dc2626",
                margin: "0 0 12px 0",
              }}
            >
              Improvement Areas
            </h3>
            <ul
              style={{
                margin: "0",
                paddingLeft: "16px",
                fontSize: "10px",
                color: "#dc2626",
                lineHeight: "1.4",
              }}
            >
              {hasAIInsights && clientData.improvementAreas?.length > 0 ? (
                clientData.improvementAreas.map((area, index) => (
                  <li key={index} style={{ marginBottom: "6px" }}>
                    <span className="text-amber-500 mr-2">•</span>
                    <span className="text-gray-700">{area}</span>
                  </li>
                ))
              ) : (
                <>
                  <p>There is no information here.</p>
                </>
              )}
            </ul>
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
          Page 2 of 6 • Executive Summary •{" "}
          {clientData?.reportMetadata?.organizationName || "Organization"}{" "}
          FinOps Assessment
        </p>
      </div>
    </div>
  )
}

export default ReportExecutiveSummary
