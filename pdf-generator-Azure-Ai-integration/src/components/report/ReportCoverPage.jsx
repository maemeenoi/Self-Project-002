import React from "react"

const ReportCoverPage = ({ clientData }) => {
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div
      style={{
        width: "297mm",
        height: "210mm",
        display: "flex",
        backgroundColor: "#ffffff",
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      {/* Left Accent Bar */}
      <div
        style={{
          backgroundColor: "#1e40af", // sky blue
          width: "80mm",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#ffffff",
          padding: "20px",
        }}
      >
        <h1
          style={{ fontSize: "48px", fontWeight: "bold", margin: "0 0 10px" }}
        >
          {clientData?.overallFinOpsMaturity?.percentage || 0}%
        </h1>
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
          FinOps Maturity
        </p>
        <div
          style={{
            backgroundColor: "#ffffff",
            width: "80%",
            height: "2px",
            margin: "20px 0",
          }}
        ></div>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>
          {clientData?.overallFinOpsMaturity?.level || "Not Available"}
        </h2>
      </div>

      {/* Right Section */}
      <div style={{ flex: 1, padding: "40px 40px 30px 40px" }}>
        {/* Logo and Date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                color: "#1e40af",
                margin: 0,
              }}
            >
              MakeStuffGo
            </h1>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
              Cloud Optimization Platform
            </p>
          </div>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
            {reportDate}
          </p>
        </div>

        {/* Title Block */}
        <div style={{ marginTop: "60px" }}>
          <h1
            style={{
              fontSize: "40px",
              fontWeight: "bold",
              color: "#111827",
              margin: 0,
              lineHeight: "1.1",
            }}
          >
            Cloud Maturity <br /> Assessment Report
          </h1>
        </div>

        {/* Org Info */}
        <div style={{ marginTop: "50px", fontSize: "14px", color: "#374151" }}>
          <p>
            <strong>Organization:</strong>{" "}
            {clientData?.reportMetadata?.organizationName || "N/A"}
          </p>
          <p>
            <strong>Industry:</strong>{" "}
            {clientData?.reportMetadata?.industryType || "N/A"}
          </p>
          <p>
            <strong>Company Size:</strong>{" "}
            {clientData?.reportMetadata?.clientSize || "N/A"}
          </p>
          <p>
            <strong>Assessment Date:</strong>{" "}
            {clientData?.reportMetadata?.reportDate || reportDate}
          </p>
        </div>

        {/* Footer Disclaimer */}
        <div
          style={{
            position: "absolute",
            bottom: "20mm",
            right: "40mm",
            fontSize: "10px",
            color: "#9ca3af",
          }}
        >
          This report is confidential and intended for internal use only.
        </div>
      </div>
    </div>
  )
}

export default ReportCoverPage
