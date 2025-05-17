// Modified ReportGenerator.jsx to use the AI insights directly
import { useRef, useState } from "react"

// Import report page components
import ReportCoverPage from "./ReportCoverPage"
import ReportExecutiveSummary from "./ReportExecutiveSummary"
import ReportMaturityAssessment from "./ReportMaturityAssessment"
import ReportRecommendations from "./ReportRecommendations"
import ReportDetailedResults from "./ReportDetailedResults"
import ReportEndCoverPage from "./ReportEndPage"

const ReportGenerator = ({
  clientData,
  onGenerationStart,
  onGenerationComplete,
  isGenerating,
  isComplete,
}) => {
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState("")
  const reportRef = useRef(null)

  // Log client data to help with debugging
  console.log("Client data being used for report:", clientData)

  // Check if AI-enhanced data is available
  const hasAIInsights = !!(
    clientData.executiveSummary ||
    clientData.strengths?.length > 0 ||
    clientData.overallFindings
  )

  console.log("Report has AI insights:", hasAIInsights)

  const generatePDF = async () => {
    if (onGenerationStart) onGenerationStart()

    try {
      setGenerationProgress(0)
      setCurrentPage("Initializing...")

      // Import the jsPDF and html2canvas libraries
      const html2canvas = (await import("html2canvas-pro")).default
      const { jsPDF } = await import("jspdf")

      // Create PDF with landscape orientation
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      // Get all pages from the report container
      const pages = reportRef.current.querySelectorAll(".page")
      const totalPages = pages.length

      console.log(`Found ${totalPages} pages to include in the PDF`)

      // Capture each page separately
      for (let i = 0; i < totalPages; i++) {
        const page = pages[i]
        const pageName = page.getAttribute("data-page-name") || `Page ${i + 1}`

        console.log(`Processing page ${i + 1}: ${pageName}`)

        // Update progress
        setCurrentPage(pageName)
        setGenerationProgress(Math.round((i / totalPages) * 100))

        // Use html2canvas with better settings
        const canvas = await html2canvas(page, {
          scale: 2, // Higher resolution
          useCORS: true, // Allow images from other domains
          logging: false, // Disable logs
          backgroundColor: "#FFFFFF", // Ensure white background
          imageTimeout: 30000, // Longer timeout for images
          removeContainer: false, // Keep container for accurate rendering
        })

        const imgData = canvas.toDataURL("image/jpeg", 0.95)

        // Add new page for all pages except the first one
        if (i > 0) pdf.addPage()

        // Add the image to the PDF (A4 landscape dimensions: 297×210 mm)
        pdf.addImage(imgData, "JPEG", 0, 0, 297, 210)

        // Small delay to allow UI to update
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Update progress to 100%
      setGenerationProgress(100)
      setCurrentPage("Finalizing PDF...")

      // Save the PDF with client organization name
      const safeFileName = clientData.reportMetadata?.organizationName
        ? clientData.reportMetadata.organizationName.replace(
            /[^a-zA-Z0-9]/g,
            "_"
          )
        : "CloudAssessment"

      pdf.save(`${safeFileName}_CloudAssessment.pdf`)

      // Wait a bit before completing to ensure PDF is saved
      setTimeout(() => {
        if (onGenerationComplete) onGenerationComplete()
      }, 500)
    } catch (error) {
      console.error("PDF generation failed:", error)
      if (onGenerationComplete) onGenerationComplete()
    }
  }

  // Create enhanced client data for reports that includes AI insights
  const enhancedClientData = {
    ...clientData,

    // Add/enhance executive summary with AI data if available
    executiveSummary: {
      ...(clientData.executiveSummary || {}),
      content:
        clientData.executiveSummary || "Cloud maturity assessment results",
      aiFindings: clientData.overallFindings,
      aiStrengths: clientData.strengths || [],
      aiImprovementAreas: clientData.improvementAreas || [],
    },

    // Enhance recommendations with AI data if available
    recommendations: {
      ...clientData.recommendations,
      // Keep the existing recommendations if AI ones aren't available
      aiKeyRecommendations: clientData.recommendations.keyRecommendations,
      // Ensure implementationRoadmap is accessible
      implementationRoadmap: clientData.recommendations.implementationRoadmap,
    },
  }

  return (
    <>
      {/* Report generation button */}
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
            {generationProgress < 100
              ? `Generating PDF (${generationProgress}%) - ${currentPage}`
              : "Saving PDF..."}
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
            {hasAIInsights ? "AI-Enhanced PDF Ready!" : "PDF Report Ready!"}
          </span>
        ) : (
          <span className="flex items-center">
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
            {hasAIInsights
              ? "Generate AI-Enhanced Report"
              : "Generate PDF Report"}
          </span>
        )}
      </button>

      {/* Hidden container for the report pages */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: "297mm", // A4 landscape width
          height: "210mm", // A4 landscape height
          overflow: "hidden",
        }}
        ref={reportRef}
      >
        {/* Cover Page */}
        <div
          className="page"
          data-page-name="Cover Page"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <ReportCoverPage clientData={enhancedClientData} />
        </div>

        {/* Executive Summary - Page 1 */}
        <div
          className="page"
          data-page-name="Executive Summary"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <ReportExecutiveSummary clientData={enhancedClientData} />
        </div>

        {/* Cloud Maturity Assessment */}
        <div
          className="page"
          data-page-name="Maturity Assessment"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <ReportMaturityAssessment clientData={enhancedClientData} />
        </div>

        {/* Recommendations & Action Plan */}
        <div
          className="page"
          data-page-name="Recommendations"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <ReportRecommendations clientData={enhancedClientData} />
        </div>

        {/* Detailed Results */}
        <div
          className="page"
          data-page-name="Detailed Results"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <ReportDetailedResults clientData={enhancedClientData} />
        </div>

        {/* End Cover Page */}
        <div
          className="page"
          data-page-name="End Page"
          style={{ width: "297mm", height: "210mm", overflow: "hidden" }}
        >
          <ReportEndCoverPage clientData={enhancedClientData} />
        </div>
      </div>
    </>
  )
}

export default ReportGenerator
