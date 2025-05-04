import { useRef, useState } from "react"

// Note: The actual jsPDF and html2canvas libraries would be imported in a real implementation.
// For this example, we're simulating their behavior.

// Import report page components
// In a real implementation, these would be imported from their respective files
// For example: import ReportCoverPage from "./report/ReportCoverPage";

// Import our created components
import ReportCoverPage from "./ReportCoverPage"
import ReportExecutiveSummary from "./ReportExecutiveSummary"
import ReportMaturityAssessment from "./ReportMaturityAssessment"
import ReportCategoryBreakdown from "./ReportCategoryBreakdown"
import ReportRecommendations from "./ReportRecommendations"
import ReportDetailedResults from "./ReportDetailedResults"
import ReportEndPage from "./ReportEndPage"

const ImprovedReportGenerator = ({
  clientData,
  onGenerationStart,
  onGenerationComplete,
  isGenerating,
  isComplete,
}) => {
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState("")
  const reportRef = useRef(null)

  const generatePDF = async () => {
    if (onGenerationStart) onGenerationStart()

    try {
      setGenerationProgress(0)
      setCurrentPage("Initializing...")

      // Import the enhanced html2canvas-pro
      const html2canvasPro = (await import("html2canvas-pro")).default

      // Import jsPDF
      const { jsPDF } = await import("jspdf")

      // Create PDF with landscape orientation (A4)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      // Get all pages that need to be captured
      const pages = reportRef.current.querySelectorAll(".report-page")
      const totalPages = pages.length

      // Capture each page separately
      for (let i = 0; i < totalPages; i++) {
        const page = pages[i]
        const pageName = page.getAttribute("data-page-name") || `Page ${i + 1}`

        // Update progress
        setCurrentPage(pageName)
        setGenerationProgress(Math.round((i / totalPages) * 100))

        // Use html2canvas with better settings
        const canvas = await html2canvasPro(page, {
          scale: 2, // Higher resolution
          useCORS: true, // Allow images from other domains
          logging: false, // Disable logs
          allowTaint: true, // Allow tainted canvas for better performance
        })

        const imgData = canvas.toDataURL("image/jpeg", 0.95)

        // Add new page for all pages except the first one
        if (i > 0) pdf.addPage()

        // Add the image to the PDF (A4 landscape dimensions: 297×210 mm)
        pdf.addImage(imgData, "JPEG", 0, 0, 297, 210)

        // Small delay to allow UI to update
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      // Update progress to 100%
      setGenerationProgress(100)
      setCurrentPage("Finalizing...")

      // Save the PDF with client organization name
      const fileName = `${clientData.reportMetadata.organizationName.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_CloudAssessment.pdf`
      pdf.save(fileName)

      // Notify completion
      if (onGenerationComplete) onGenerationComplete()
    } catch (error) {
      console.error("PDF generation failed:", error)
      if (onGenerationComplete) onGenerationComplete()
    }
  }

  return (
    <div>
      {/* Report generation button */}
      <button
        onClick={generatePDF}
        disabled={isGenerating}
        className={`inline-flex items-center px-6 py-3 rounded-lg font-medium ${
          isGenerating
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isGenerating ? (
          <>
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
            {generationProgress < 100 ? (
              <span>
                Generating PDF ({generationProgress}%) - {currentPage}
              </span>
            ) : (
              <span>Saving PDF...</span>
            )}
          </>
        ) : isComplete ? (
          <>
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
            PDF Report Ready!
          </>
        ) : (
          <>
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Generate PDF Report
          </>
        )}
      </button>

      {/* Hidden container for the report pages */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          opacity: 0, // Make invisible but render
          width: "297mm", // A4 landscape width
          height: "210mm", // A4 landscape height
          overflow: "hidden",
        }}
        ref={reportRef}
      >
        {/* Cover Page */}
        <div className="report-page" data-page-name="Cover Page">
          <ReportCoverPage clientData={clientData} />
        </div>

        {/* Executive Summary */}
        <div className="report-page" data-page-name="Executive Summary">
          <ReportExecutiveSummary clientData={clientData} />
        </div>

        {/* Cloud Maturity Assessment */}
        <div className="report-page" data-page-name="Maturity Assessment">
          <ReportMaturityAssessment clientData={clientData} />
        </div>

        {/* Category Breakdown */}
        <div className="report-page" data-page-name="Category Details">
          <ReportCategoryBreakdown clientData={clientData} />
        </div>

        {/* Recommendations */}
        <div className="report-page" data-page-name="Recommendations">
          <ReportRecommendations clientData={clientData} />
        </div>

        {/* Detailed Results */}
        <div className="report-page" data-page-name="Detailed Results">
          <ReportDetailedResults clientData={clientData} />
        </div>

        {/* End Page */}
        <div className="report-page" data-page-name="Contact Information">
          <ReportEndPage clientData={clientData} />
        </div>
      </div>
    </div>
  )
}

export default ImprovedReportGenerator
