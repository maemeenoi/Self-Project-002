import React from "react"

const ReportEndPage = ({ clientData }) => {
  const { reportMetadata } = clientData

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
        justifyContent: "space-between",
      }}
    >
      {/* Top Border */}
      <div
        style={{ height: "6px", width: "100%", backgroundColor: "#2563eb" }}
      />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            color: "#1e40af",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Thank You
        </h1>

        <div
          style={{
            width: "120px",
            height: "4px",
            backgroundColor: "#38bdf8",
            marginBottom: "30px",
          }}
        />

        <p style={{ fontSize: "18px", color: "#374151" }}>
          This Cloud Maturity Assessment has been prepared for:
        </p>
        <h2
          style={{
            fontSize: "28px",
            color: "#1e3a8a",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          {reportMetadata?.organizationName || "Organization Name"}
        </h2>
        <p style={{ fontSize: "16px", color: "#4b5563", marginTop: "5px" }}>
          {reportMetadata?.reportDate || "Assessment Date"}
        </p>

        <div style={{ maxWidth: "500px", marginTop: "40px" }}>
          <p
            style={{ fontSize: "16px", color: "#374151", marginBottom: "30px" }}
          >
            For more information or to schedule your implementation
            consultation, please contact your MakeStuffGo representative.
          </p>

          <div
            style={{ display: "flex", justifyContent: "center", gap: "80px" }}
          >
            <div style={{ textAlign: "left" }}>
              <h3
                style={{
                  color: "#1e40af",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                Contact Us
              </h3>
              <p style={{ fontSize: "14px", color: "#374151" }}>
                support@makestuffgo.com
              </p>
              <p style={{ fontSize: "14px", color: "#374151" }}>
                +1 (555) 123-4567
              </p>
            </div>
            <div style={{ textAlign: "left" }}>
              <h3
                style={{
                  color: "#1e40af",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                Visit Us Online
              </h3>
              <p style={{ fontSize: "14px", color: "#374151" }}>
                www.makestuffgo.com
              </p>
              <p style={{ fontSize: "14px", color: "#374151" }}>@MakeStuffGo</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "50px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1e40af",
              marginBottom: "6px",
            }}
          >
            MakeStuffGo
          </h2>
          <p
            style={{ fontSize: "14px", fontStyle: "italic", color: "#6b7280" }}
          >
            Ensuring every dollar you spend on the cloud is working as hard as
            you.
          </p>
        </div>
      </div>

      {/* Bottom Border */}
      <div
        style={{ height: "6px", width: "100%", backgroundColor: "#2563eb" }}
      />
    </div>
  )
}

export default ReportEndPage
