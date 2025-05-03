import { useRef } from "react"
import MVPCoverPage from "./MVPCover"
import MVPExecutiveSummary from "./MVPExecutiveSummary"
import MVPCloudMaturityAssessment from "./MVPCloudMaturityAssessment"
import MVPRecommendationsActionPlan from "./MVPRecommendationsActionPlan"
import MVPMaturityTable from "./MVPMaturityTable"
import MVPEndCoverPage from "./MVPEndCoverPage"
import MVPResponsesSummary from "./MVPResponsesSummary"

const ReportGenerator = ({
  clientData,
  onGenerationStart,
  onGenerationComplete,
  isGenerating,
  isComplete,
}) => {
  const reportRef = useRef(null)

  console.log("clientData", clientData)

  const generatePDF = async () => {
    if (onGenerationStart) onGenerationStart()

    try {
      // Import the enhanced html2canvas-pro
      const html2canvasPro = (await import("html2canvas-pro")).default

      // Import jsPDF
      const { jsPDF } = await import("jspdf")

      const pages = reportRef.current.querySelectorAll(".page")
      // Create PDF with landscape orientation
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      // Capture each page separately using html2canvas-pro
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]

        // Use html2canvas-pro with better color support
        const canvas = await html2canvasPro(page, {
          scale: 2,
          useCORS: true,
          logging: false,
        })

        const imgData = canvas.toDataURL("image/jpeg", 1.0)

        // Add new page for all pages except the first one
        if (i > 0) pdf.addPage()

        // Add the image to the PDF (A4 landscape dimensions: 297×210 mm)
        pdf.addImage(imgData, "JPEG", 0, 0, 297, 210)
      }

      // Save the PDF
      pdf.save(
        `${clientData.reportMetadata.organizationName}_CloudCostReport.pdf`
      )

      if (onGenerationComplete) onGenerationComplete()
    } catch (error) {
      console.error("PDF generation failed:", error)
      if (onGenerationComplete) onGenerationComplete()
    }
  }

  return (
    <>
      <button
        onClick={generatePDF}
        disabled={isGenerating}
        className={`px-6 py-3 rounded-lg font-medium ${
          isGenerating
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Generating PDF...
          </span>
        ) : isComplete ? (
          <span className="flex items-center">
            <svg
              className="h-5 w-5 mr-2 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            PDF Generated!
          </span>
        ) : (
          "Generate PDF Report"
        )}
      </button>

      {/* Hidden container for the report */}
      <div
        style={{ position: "absolute", left: "-9999px", top: 0 }}
        ref={reportRef}
      >
        {/* Cover Page */}
        <div
          className="page"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <MVPCoverPage clientData={clientData} />
        </div>

        {/* Executive Summary - Page 1 */}
        <div
          className="page"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <MVPExecutiveSummary clientData={clientData} page={1} />
        </div>

        {/* Executive Summary - Page 2 */}
        <div
          className="page"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <MVPExecutiveSummary clientData={clientData} page={2} />
        </div>

        {/* Cloud Maturity Assessment */}
        <div
          className="page"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <MVPCloudMaturityAssessment clientData={clientData} page={1} />
        </div>

        {/* Maturity Table */}
        <div
          className="page"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <div className="p-6">
            <MVPMaturityTable
              maturityData={clientData.cloudMaturityAssessment}
            />
          </div>
        </div>

        {/* Recommendations & Action Plan */}
        <div
          className="page"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <MVPRecommendationsActionPlan clientData={clientData} />
        </div>
        {/* Responses Summary */}
        <div
          className="page"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <MVPResponsesSummary
            responses={clientData.recommendations.responses}
            page={1}
          />
        </div>
        <div
          className="page"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <MVPResponsesSummary
            responses={clientData.recommendations.responses}
            page={2}
          />
        </div>
        {/* End Cover Page */}
        <div
          className="page"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <MVPEndCoverPage clientData={clientData} />
        </div>
      </div>
    </>
  )
}

export default ReportGenerator
