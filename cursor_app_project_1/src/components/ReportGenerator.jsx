import { useRef } from "react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

const ReportGenerator = ({
  clientData,
  onGenerationStart,
  onGenerationComplete,
  isGenerating,
  isComplete,
}) => {
  const dashboardRef = useRef(null)

  const generatePDF = async () => {
    if (!dashboardRef.current) return

    onGenerationStart?.()

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const pdf = new jsPDF("p", "mm", "a4")
      const imgData = canvas.toDataURL("image/png")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)

      // Send PDF to API
      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfData: pdf.output("datauristring"),
          clientData,
        }),
      })

      if (!response.ok) throw new Error("Failed to send report")

      onGenerationComplete?.()
    } catch (error) {
      console.error("Error generating PDF:", error)
      onGenerationComplete?.()
    }
  }

  return (
    <div>
      <div ref={dashboardRef}>
        {/* Dashboard content will be rendered here */}
      </div>
      <button
        onClick={generatePDF}
        disabled={isGenerating}
        className="btn btn-primary"
      >
        {isGenerating ? "Generating..." : "Generate & Send Report"}
      </button>
      {isComplete && (
        <div className="alert alert-success mt-3">
          Report generated and sent successfully!
        </div>
      )}
    </div>
  )
}

export default ReportGenerator
