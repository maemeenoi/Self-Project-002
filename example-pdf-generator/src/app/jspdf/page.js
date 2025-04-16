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

  const handlePdfDownload = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Set the font and size for the entire document (Developing period only)
    function drawCoordinateGrid(doc) {
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Draw light grid lines every 10 points
      doc.setDrawColor(230, 230, 230) // Lighter gray for 10pt lines
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
      doc.setDrawColor(200, 200, 200) // Darker gray for 50pt lines
      doc.setLineWidth(0.2)

      // Vertical lines (every 50 points)
      for (let x = 0; x <= pageWidth; x += 50) {
        doc.line(x, 0, x, pageHeight)
        // Add labels for 50-point increments
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text(`${x}`, x, 10, { align: "center" })
      }

      // Horizontal lines (every 50 points)
      for (let y = 0; y <= pageHeight; y += 50) {
        doc.line(0, y, pageWidth, y)
        // Add labels for 50-point increments
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text(`${y}`, 5, y)
      }
    }
    drawCoordinateGrid(doc)

    // Logo image
    const logo = "https://picsum.photos/120/60"
    // Add logo to the PDF
    doc.addImage(logo, "PNG", 150, 10, 40, 40) // Adjust dimensions as needed

    // Use this during development
    drawCoordinateGrid(doc)

    // Add title
    doc.setFont("Helvetica")
    doc.setFontSize(18)
    doc.text("Cloud Cost Efficiency Report", 10, 20)

    // Add subtitle
    doc.setFontSize(14)
    doc.setTextColor(100)
    doc.text(`Generated on: ${sampleData.reportDate}`, 10, 30)

    // Add Executive Summary
    doc.setFontSize(16)
    doc.setTextColor(0)
    doc.text("Executive Summary", 10, 50)

    doc.setFontSize(12)
    doc.setTextColor(50)
    const summaryText = `Based on our comprehensive cloud maturity assessment, ${sampleData.organizationName} has achieved an Intermediate (${sampleData.cloudMaturityScore}/5) maturity level in cloud computing with strong fundamentals in place for further optimization.`
    doc.text(summaryText, 10, 60, { maxWidth: 190 })

    // Capture the chart as an image
    const chartElement = chartRef.current
    if (chartElement) {
      const canvas = await html2canvas(chartElement, { scale: 2 })
      const chartImage = canvas.toDataURL("image/png")

      // Add the chart image to the PDF
      doc.addImage(chartImage, "PNG", 10, 80, 190, 100) // Adjust dimensions as needed
    }

    // Add challenges dynamically
    let yPosition = 190
    doc.setFontSize(16)
    doc.setTextColor(0)
    doc.text("Challenges", 10, yPosition)
    doc.setFontSize(12)
    doc.setTextColor(50)
    sampleData.executiveSummary.challenges.forEach((challenge, index) => {
      yPosition += 10
      doc.text(`${index + 1}. ${challenge}`, 10, yPosition, { maxWidth: 190 })
    })

    // Add recommendations dynamically
    yPosition += 20
    doc.setFontSize(16)
    doc.setTextColor(0)
    doc.text("Recommendations", 10, yPosition)
    doc.setFontSize(12)
    doc.setTextColor(50)
    sampleData.executiveSummary.recommendations.forEach(
      (recommendation, index) => {
        yPosition += 10
        doc.text(`${index + 1}. ${recommendation}`, 10, yPosition, {
          maxWidth: 190,
        })
      }
    )

    // Add footer
    doc.setFontSize(10)
    doc.setTextColor(150)
    doc.text("Page 1 of 1", 105, 290, { align: "center" })

    // Save the PDF
    doc.save("Cloud_Cost_Efficiency_Report.pdf")
  }

  if (!isClient) {
    // Render nothing on the server to avoid hydration mismatch
    return null
  }
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NZD",
    }).format(value)
  }
  console.log(sampleData.executiveSummary.cloudSpend.byService)
  console.log(sampleData.executiveSummary.monthlyTrend)

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
