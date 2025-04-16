"use client"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import React, { useRef, useState, useEffect } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  ResponsiveContainer,
} from "recharts"
import sampleData from "../sample-json-data.json" // Import the JSON data

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

const ReportPage = () => {
  const chartRef = useRef(null)
  const [isClient, setIsClient] = useState(false)

  // Ensure the component renders only on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  /**
   * Creates a detailed coordinate grid for development
   */
  const drawCoordinateGrid = (doc) => {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Draw light grid lines every 10 points
    doc.setDrawColor(240, 240, 240) // Very light gray for 10pt lines
    doc.setLineWidth(0.1)

    // Vertical lines (every 10 points)
    for (let x = 0; x <= pageWidth; x += 10) {
      doc.line(x, 0, x, pageHeight)
    }

    // Horizontal lines (every 10 points)
    for (let y = 0; y <= pageHeight; y += 10) {
      doc.line(0, y, pageWidth, y)
    }

    // Draw slightly darker lines for 50-point increments
    doc.setDrawColor(220, 220, 220) // Light gray for 50pt lines
    doc.setLineWidth(0.2)

    // Vertical lines (every 50 points)
    for (let x = 0; x <= pageWidth; x += 50) {
      doc.line(x, 0, x, pageHeight)
      // Add labels for 50-point increments
      doc.setFontSize(6)
      doc.setTextColor(180, 180, 180)
      doc.text(`${x}`, x, 10, { align: "center" })
    }

    // Horizontal lines (every 50 points)
    for (let y = 0; y <= pageHeight; y += 50) {
      doc.line(0, y, pageWidth, y)
      // Add labels for 50-point increments
      doc.setFontSize(6)
      doc.setTextColor(180, 180, 180)
      doc.text(`${y}`, 5, y)
    }
  }

  /**
   * Creates a maturity indicator visual
   */
  const drawMaturityIndicator = (doc, score, x, y, width) => {
    const stages = [
      "Beginner",
      "Foundational",
      "Intermediate",
      "Advanced",
      "Optimized",
    ]
    const segmentWidth = width / stages.length
    const height = 10

    // Draw background rectangles
    stages.forEach((stage, index) => {
      // Calculate colors - gradient from light blue to dark blue
      const blue = 180 - index * 30
      doc.setFillColor(230 - index * 15, 240 - index * 15, 255 - index * 5)

      // Draw segment
      doc.roundedRect(
        x + index * segmentWidth,
        y,
        segmentWidth,
        height,
        0,
        0,
        "F"
      )

      // Add stage name
      doc.setFont("Helvetica", "normal")
      doc.setFontSize(5)
      doc.setTextColor(80, 80, 80)
      doc.text(
        stage,
        x + index * segmentWidth + segmentWidth / 2,
        y + height + 5,
        { align: "center" }
      )
    })

    // Highlight current score
    const scoreIndex = score - 1
    doc.setFillColor(52, 152, 219) // Bright blue for highlight
    doc.roundedRect(
      x + scoreIndex * segmentWidth,
      y,
      segmentWidth,
      height,
      0,
      0,
      "F"
    )

    // Add score text
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(6)
    doc.setTextColor(255, 255, 255)
    doc.text(
      `${score}/5`,
      x + scoreIndex * segmentWidth + segmentWidth / 2,
      y + height / 2 + 2,
      { align: "center" }
    )
  }

  const handlePdfDownload = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Page dimensions for reference
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10

    // Create reusable style functions
    const styles = {
      title: () => {
        doc.setFont("Helvetica", "bold")
        doc.setFontSize(18)
        doc.setTextColor(44, 62, 80) // Dark blue
      },
      heading: () => {
        doc.setFont("Helvetica", "bold")
        doc.setFontSize(16)
        doc.setTextColor(44, 62, 80) // Dark blue
      },
      subheading: () => {
        doc.setFont("Helvetica", "bold")
        doc.setFontSize(14)
        doc.setTextColor(52, 73, 94) // Slate gray
      },
      body: () => {
        doc.setFont("Helvetica", "normal")
        doc.setFontSize(12)
        doc.setTextColor(60, 60, 60) // Dark gray
      },
      caption: () => {
        doc.setFont("Helvetica", "italic")
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100) // Medium gray
      },
      footer: () => {
        doc.setFont("Helvetica", "normal")
        doc.setFontSize(10)
        doc.setTextColor(150, 150, 150) // Light gray
      },
    }

    // Development grid (toggle for development/production)
    const showGrid = true
    if (showGrid) {
      drawCoordinateGrid(doc)
    }

    // Add header section with colored background
    doc.setFillColor(240, 245, 250) // Light blue background
    doc.rect(0, 0, pageWidth, 30, "F")

    // Add logo
    const logo = "https://picsum.photos/120/60"
    doc.addImage(logo, "PNG", pageWidth - margin - 30, margin, 20, 10)

    // Add title
    styles.title()
    doc.text("Cloud Cost Efficiency Report", margin, margin + 10)

    // Add subtitle with date
    styles.caption()
    doc.text(`Generated on: ${sampleData.reportDate}`, margin, margin + 15)

    // Add organization name
    styles.subheading()
    doc.text(sampleData.reportMetadata.organizationName, margin, margin + 20)

    // Move position down past header section
    let yPos = 40

    // Add Executive Summary section
    styles.heading()
    doc.text("Executive Summary", margin, yPos)
    yPos += 10

    // Add summary text
    styles.body()
    const summaryText = `Based on our comprehensive cloud maturity assessment, ${sampleData.reportMetadata.organizationName} has achieved an Intermediate (${sampleData.cloudMaturityScore}/5) maturity level in cloud computing with strong fundamentals in place for further optimization.`

    // Add text with word wrapping
    const textLines = doc.splitTextToSize(summaryText, pageWidth - margin * 2)
    doc.text(textLines, margin, yPos)
    yPos += textLines.length * 5 + 5

    // Add maturity indicator
    drawMaturityIndicator(
      doc,
      sampleData.executiveSummary.cloudMaturityScore,
      margin,
      yPos,
      pageWidth - margin * 2
    )
    yPos += 20

    // Add chart from React component
    const chartElement = chartRef.current
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, { scale: 2 })
        const chartImage = canvas.toDataURL("image/png")
        const chartWidth = pageWidth - margin * 2
        const chartHeight = 80

        // Add the chart with a border
        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.5)
        doc.rect(margin, yPos, chartWidth, chartHeight)
        doc.addImage(chartImage, "PNG", margin, yPos, chartWidth, chartHeight)
        yPos += chartHeight + 10

        // Add chart caption
        styles.caption()
        doc.text(
          "Fig 1: Breakdown of cloud costs across service categories",
          margin,
          yPos
        )
        yPos += 10
      } catch (error) {
        console.error("Error generating chart:", error)
      }
    }

    // Add challenges section with background
    yPos += 5
    doc.setFillColor(248, 249, 250)
    doc.rect(margin, yPos, pageWidth - margin * 2, 40, "F")

    styles.heading()
    doc.text("Challenges", margin + 2, yPos + 8)
    yPos += 15

    // Add challenges with bullet points
    styles.body()
    sampleData.executiveSummary.challenges.forEach((challenge, index) => {
      doc.setDrawColor(80, 120, 180)
      doc.circle(margin + 5, yPos - 1, 1, "FD")
      doc.text(`${index + 1}. ${challenge}`, margin + 10, yPos, {
        maxWidth: pageWidth - margin * 2 - 10,
      })
      yPos += 8
    })

    // Add recommendations section
    yPos += 10
    styles.heading()
    doc.text("Recommendations", margin, yPos)
    yPos += 10

    // Add recommendations with styled boxes
    sampleData.executiveSummary.recommendations.forEach(
      (recommendation, index) => {
        // Draw recommendation box with gradient-like effect
        doc.setFillColor(240, 245, 250)
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 15, 2, 2, "F")
        doc.setFillColor(220, 235, 250)
        doc.roundedRect(margin, yPos, 3, 15, 2, 2, "F")

        // Add recommendation text
        styles.body()
        const recLines = doc.splitTextToSize(
          `${index + 1}. ${recommendation}`,
          pageWidth - margin * 2 - 5
        )
        doc.text(recLines, margin + 5, yPos + 5)

        yPos += 20 // Add space after each recommendation

        // Check if we need a new page
        if (yPos > pageHeight - 30) {
          doc.addPage()
          yPos = margin

          // Add header for new page
          doc.setFillColor(240, 245, 250)
          doc.rect(0, 0, pageWidth, 15, "F")
          styles.heading()
          doc.text("Cloud Cost Efficiency Report - Continued", margin, 10)
          yPos += 20
        }
      }
    )

    // Add footer with page numbers
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      styles.footer()

      // Add footer with page numbers and company name
      doc.text(
        `${sampleData.reportMetadata.organizationName} - Confidential`,
        margin,
        pageHeight - 5
      )
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 5,
        { align: "right" }
      )

      // Add footer line
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10)
    }

    // Save the PDF
    doc.save("Cloud_Cost_Efficiency_Report.pdf")
  }

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NZD",
    }).format(value)
  }

  if (!isClient) {
    // Render nothing on the server to avoid hydration mismatch
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-8 mb-8">
      {/* Charts grid - using a 2-column layout on medium screens and up */}
      <div
        ref={chartRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
        style={{ width: "800px", height: "400px" }}
      >
        {/* Pie chart section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Cloud Spend Distribution</h3>
          {/* ResponsiveContainer makes the chart responsive to its parent's size */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              {/* The Pie component represents our pie chart */}
              <Pie
                data={sampleData.executiveSummary.cloudSpend.byService}
                cx="50%" // Center X position
                cy="50%" // Center Y position
                labelLine={true} // Show lines connecting labels to segments
                // Custom label format showing name and percentage
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80} // Size of the pie chart
                fill="#8884d8" // Default fill color (overridden by Cell components)
                dataKey="value" // Which data property to use for segment size
              >
                {/* Map through data to create a Cell for each pie segment with its own color */}
                {sampleData.executiveSummary.cloudSpend.byService.map(
                  (entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  )
                )}
              </Pie>
              {/* Tooltip shows additional information on hover */}
              <Tooltip formatter={(value) => formatCurrency(value)} />
              {/* Legend shows which color represents which data category */}
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center font-medium">
            Total Cloud Spend:{" "}
            {formatCurrency(sampleData.executiveSummary.cloudSpend.total)}
          </div>
        </div>

        {/* Line chart section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">
            Monthly Cloud Spend Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={sampleData.executiveSummary.monthlyTrend}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              {/* Grid lines to make the chart easier to read */}
              <CartesianGrid strokeDasharray="3 3" />
              {/* X-axis showing months */}
              <XAxis dataKey="month" />
              {/* Y-axis for spend values */}
              <YAxis />
              {/* Tooltip for hovering over data points */}
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              {/* The actual line in the chart */}
              <Line
                type="monotone" // Smooth line style
                dataKey="spend" // Which data property to use for Y values
                stroke="#8884d8" // Line color
                activeDot={{ r: 8 }} // Size of active dot when hovering
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Button to generate the PDF */}
      <button
        onClick={handlePdfDownload}
        className="px-4 py-2 bg-blue-600 text-white rounded mt-4"
      >
        Generate Report with Chart
      </button>
    </div>
  )
}

export default ReportPage
