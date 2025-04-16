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
  const pieChartRef = useRef(null)
  const lineChartRef = useRef(null)
  const [isClient, setIsClient] = useState(false)

  // Ensure the component renders only on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NZD",
    }).format(value)
  }

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
      doc.setFillColor(230 - index * 15, 240 - index * 15, 255 - index * 5)

      // Draw segment
      doc.roundedRect(
        x + index * segmentWidth,
        y,
        segmentWidth,
        height,
        1,
        1,
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
      1,
      1,
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

  /**
   * Add a stylized box with a title and content
   */
  const addInfoBox = (doc, title, content, x, y, width, height) => {
    // Draw box background
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, y, width, height, 2, 2, "F")

    // Draw accent on left side
    doc.setFillColor(52, 152, 219)
    doc.rect(x, y, 3, height, "F")

    // Add title
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(44, 62, 80)
    doc.text(title, x + 8, y + 8)

    // Add content
    doc.setFont("Helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(60, 60, 60)

    // Handle content as array (for multiple lines) or string
    if (Array.isArray(content)) {
      let contentY = y + 16
      content.forEach((line) => {
        doc.text(line, x + 8, contentY)
        contentY += 8
      })
    } else {
      const textLines = doc.splitTextToSize(content, width - 16)
      doc.text(textLines, x + 8, y + 16)
    }
  }

  /**
   * Creates the cover page for the report
   */
  const createCoverPage = (doc) => {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Add colored background on top portion
    doc.setFillColor(52, 152, 219) // Blue brand color
    doc.rect(0, 0, pageWidth, 80, "F")

    // Draw white accent strips
    doc.setFillColor(255, 255, 255)
    doc.setGState(new doc.GState({ opacity: 0.1 }))
    doc.rect(0, 15, pageWidth, 5, "F")
    doc.rect(0, 30, pageWidth, 2, "F")
    doc.rect(0, 60, pageWidth, 3, "F")
    doc.setGState(new doc.GState({ opacity: 1 })) // Reset opacity

    // Add company logo
    const logo = "https://picsum.photos/120/60"
    doc.addImage(logo, "PNG", 20, 20, 50, 25)

    // Add report title
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(28)
    doc.setTextColor(80, 80, 80)
    doc.text("CLOUD COST", 20, 100)
    doc.text("EFFICIENCY", 20, 115)
    doc.text("REPORT", 20, 130)

    // Add date and company
    doc.setFont("Helvetica", "normal")
    doc.setFontSize(14)
    doc.setTextColor(80, 80, 80)
    doc.text(`${sampleData.reportMetadata.reportDate}`, 20, 150)

    doc.setFont("Helvetica", "bold")
    doc.setFontSize(16)
    doc.text(sampleData.reportMetadata.organizationName.toUpperCase(), 20, 170)

    // Add decorative element
    doc.setFillColor(52, 152, 219, 0.8)
    doc.roundedRect(20, 152, 50, 6, 3, 3, "F")
    doc.roundedRect(20, 172, 30, 6, 3, 3, "F")

    // Add report generation info at bottom
    doc.setFont("Helvetica", "italic")
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text("Generated by MakeStuffGo", 20, pageHeight - 20)
    doc.text("www.makestuffgo.com", pageWidth - 20, pageHeight - 20, {
      align: "right",
    })

    return doc
  }

  /**
   * Creates the table of contents page
   */
  const createTableOfContents = (doc) => {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const columnWidth = (pageWidth - margin * 3) / 2 // Divide the page into two columns
    const columnGap = margin // Gap between columns
    const leftColumnX = margin // X position for the left column
    const rightColumnX = margin + columnWidth + columnGap // X position for the right column
    let leftColumnY = 60 // Start Y position for the left column
    let rightColumnY = 60 // Start Y position for the right column

    // Page header
    doc.setFillColor(240, 245, 250)
    doc.rect(0, 0, pageWidth, 40, "F")

    doc.setFont("Helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(44, 62, 80)
    doc.text("Table of Contents", margin, 30)

    // Generate TOC items
    const tocItems = [
      { title: "Executive Summary", page: 3 },
      { title: "Organisational Cloud Maturity Assessment", page: 4 },
      { title: "Comprehensive Cloud Expenditure Analysis", page: 6 },
      { title: "AI-Powered Cost Optimization Recommendations", page: 9 },
      { title: "Infrastructure as Code (IaC) Optimization", page: 12 },
      { title: "Predictive Cost Forecasting", page: 14 },
      { title: "Detailed Service Performance Analysis", page: 16 },
      { title: "Future Technology Integration Strategies", page: 18 },
      { title: "Recommendations & Action Plan", page: 20 },
      { title: "Appendices", page: 22 },
    ]

    // Add items to the left and right columns
    tocItems.forEach((item, index) => {
      const isLeftColumn = index < 5 // First 5 items go to the left column
      const xPos = isLeftColumn ? leftColumnX : rightColumnX
      const yPos = isLeftColumn ? leftColumnY : rightColumnY

      // Section number
      doc.setFont("Helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(52, 152, 219)
      doc.text(`${(index + 1).toString().padStart(2, "0")}.`, xPos, yPos)

      // Section title
      doc.setFont("Helvetica", "normal")
      doc.setTextColor(60, 60, 60)
      doc.text(item.title, xPos + 15, yPos)

      // Calculate the starting position for the dots
      const dotsStartX = xPos + 15 + doc.getTextWidth(item.title) + 5

      // Calculate the width available for the dots
      const dotsEndX = xPos + columnWidth - 10 // Leave some padding on the right
      const dotsWidth = dotsEndX - dotsStartX

      // Generate the dots
      let dots = ""
      const dotWidth = doc.getTextWidth(".")
      const dotsCount = Math.floor(dotsWidth / dotWidth)
      for (let i = 0; i < dotsCount; i++) {
        dots += "."
      }

      // Draw the dots
      doc.setTextColor(180, 180, 180)
      doc.text(dots, dotsStartX, yPos)

      // Page number
      doc.setTextColor(60, 60, 60)
      doc.text(item.page.toString(), xPos + columnWidth, yPos, {
        align: "right",
      })

      // Update Y position for the next item
      if (isLeftColumn) {
        leftColumnY += 18
      } else {
        rightColumnY += 18
      }
    })

    // Add footer
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30)

    doc.setFont("Helvetica", "italic")
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text(
      sampleData.reportMetadata.organizationName,
      margin,
      pageHeight - 20
    )
    doc.text("Page 2", pageWidth - margin, pageHeight - 20, { align: "right" })

    return doc
  }

  /**
   * Creates the executive summary page
   */
  const createExecutiveSummary = async (doc, pieChartRef, lineChartRef) => {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const columnWidth = (pageWidth - margin * 3) / 2 // Divide the page into two columns
    const columnGap = margin // Gap between columns
    const leftColumnX = margin // X position for the left column
    const rightColumnX = margin + columnWidth + columnGap // X position for the right column
    let leftColumnY = 60 // Start Y position for the left column
    let rightColumnY = 60 // Start Y position for the right column

    // Page header
    doc.setFillColor(240, 245, 250)
    doc.rect(0, 0, pageWidth, 40, "F")

    doc.setFont("Helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(44, 62, 80)
    doc.text("01 Executive Summary", margin, 30)

    // Introduction text
    doc.setFont("Helvetica", "normal")
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)

    const introText = `Based on our comprehensive cloud maturity assessment, ${sampleData.reportMetadata.organizationName} has achieved an Intermediate (${sampleData.executiveSummary.cloudMaturityScore}/5) maturity level in cloud computing with strong fundamentals in place for further optimization. The organization demonstrates a strong understanding of core cloud principles and a profound commitment to leveraging the transformative benefits of cloud adoption.`
    console.log(
      "Maturity Score:",
      sampleData.executiveSummary.cloudMaturityScore
    )
    const textLines = doc.splitTextToSize(introText, columnWidth)
    textLines.forEach((line) => {
      doc.text(line, leftColumnX, leftColumnY)
      leftColumnY += 7

      // Check if the left column is full
      if (leftColumnY > pageHeight - margin) {
        leftColumnY = 60 // Reset Y position for the left column
        doc.addPage() // Add a new page
      }
    })

    // Add maturity indicator
    drawMaturityIndicator(
      doc,
      sampleData.executiveSummary.cloudMaturityScore,
      leftColumnX,
      leftColumnY,
      columnWidth
    )

    leftColumnY += 20

    // Add charts section - costs by service and trend
    const chartElement = pieChartRef.current
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, { scale: 2 })
        const chartImage = canvas.toDataURL("image/png")
        const chartWidth = columnWidth
        const chartHeight = 100

        // Add the chart to the right column
        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.5)
        doc.rect(rightColumnX, rightColumnY, chartWidth, chartHeight)
        doc.addImage(
          chartImage,
          "PNG",
          rightColumnX,
          rightColumnY,
          chartWidth,
          chartHeight
        )

        rightColumnY += chartHeight + 10
      } catch (error) {
        console.error("Error generating chart:", error)
        rightColumnY += 20 // Still increment position if chart fails
      }
    }

    // Add challenges and recommendations in two columns
    const colWidth = columnWidth

    // // CHALLENGES BOX
    // doc.setFont("Helvetica", "bold")
    // doc.setFontSize(12)
    // doc.setTextColor(44, 62, 80)
    // doc.text("CHALLENGES", leftColumnX, leftColumnY)
    // doc.setFont("Helvetica", "normal")
    // doc.setFontSize(8)
    // doc.setTextColor(60, 60, 60)
    // doc.setFillColor(248, 250, 252)
    // doc.text(
    //   sampleData.executiveSummary.challenges,
    //   leftColumnX + 8,
    //   leftColumnY + 10
    // )
    addInfoBox(
      doc,
      "CHALLENGES",
      sampleData.executiveSummary.challenges,
      leftColumnX,
      leftColumnY,
      colWidth,
      80
    )

    //RECOMMENDATIONS BOX
    addInfoBox(
      doc,
      "RECOMMENDATIONS",
      sampleData.executiveSummary.recommendations,
      rightColumnX,
      rightColumnY,
      colWidth,
      80
    )

    // doc.setFont("Helvetica", "bold")
    // doc.setFontSize(12)
    // doc.setTextColor(44, 62, 80)
    // doc.text("CHALLENGES", leftColumnX, leftColumnY)
    // doc.setFont("Helvetica", "normal")
    // doc.setFontSize(8)
    // doc.setTextColor(60, 60, 60)
    // doc.setFillColor(248, 250, 252)
    // doc.text(
    //   sampleData.executiveSummary.recommendations,
    //   leftColumnX + 8,
    //   leftColumnY + 10
    // )

    leftColumnY += 90
    rightColumnY += 90

    // Add key metrics in a row
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(44, 62, 80)
    doc.text(
      "KEY CLOUD MATURITY INSIGHTS",
      margin,
      Math.max(leftColumnY, rightColumnY)
    )

    const metrics = [
      {
        label: "Total Cloud Spend",
        value: formatCurrency(sampleData.executiveSummary.cloudSpend.total),
      },
      { label: "YoY Growth", value: "+24%" },
      {
        label: "Optimization Potential",
        value: formatCurrency(
          sampleData.executiveSummary.optimizationPotential || 45000
        ),
      },
    ]

    const metricWidth = (pageWidth - margin * 2) / metrics.length
    const metricsY = Math.max(leftColumnY, rightColumnY) + 10

    metrics.forEach((metric, index) => {
      const metricX = margin + index * metricWidth

      // Add colored box
      doc.setFillColor(52, 152, 219, 0.1)
      doc.roundedRect(metricX, metricsY, metricWidth - 10, 40, 3, 3, "F")

      // Add label
      doc.setFont("Helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      doc.text(metric.label, metricX + 5, metricsY + 12)

      // Add value
      doc.setFont("Helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(52, 152, 219)
      doc.text(metric.value, metricX + 5, metricsY + 28)
    })

    // Add footer
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30)

    doc.setFont("Helvetica", "italic")
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text(
      sampleData.reportMetadata.organizationName,
      margin,
      pageHeight - 20
    )
    doc.text("Page 3", pageWidth - margin, pageHeight - 20, { align: "right" })

    return doc
  }

  /**
   * Main function to generate the complete report PDF
   */
  const handlePdfDownload = async () => {
    // Initialize PDF document
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })

    // Optional: Show grid during development
    const showGrid = true
    if (showGrid) {
      drawCoordinateGrid(doc)
    }

    // 1. Create Cover Page
    createCoverPage(doc)

    // 2. Add Table of Contents
    doc.addPage()
    if (showGrid) drawCoordinateGrid(doc)
    createTableOfContents(doc)

    // 3. Add Executive Summary
    doc.addPage()
    if (showGrid) drawCoordinateGrid(doc)
    await createExecutiveSummary(doc, pieChartRef)

    // Save the PDF
    doc.save(`${sampleData.reportMetadata.organizationName}_Cloud_Report.pdf`)
  }

  if (!isClient) {
    // Render nothing on the server to avoid hydration mismatch
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-8 mb-8">
      {/* Charts grid - using a 2-column layout on medium screens and up */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
        style={{ width: "1200px", height: "400px" }}
      >
        {/* Pie chart section */}
        <div ref={pieChartRef} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Cloud Spend Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sampleData.executiveSummary.cloudSpend.byService}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sampleData.executiveSummary.cloudSpend.byService.map(
                  (entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  )
                )}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="spend"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
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
        Generate Complete Report
      </button>
    </div>
  )
}

export default ReportPage
