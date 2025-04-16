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
import data from "../sample-data-2.json" // Import the JSON data
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

/**
 * PDF Helper Class to handle common operations
 */
class PDFHelper {
  constructor(doc) {
    this.doc = doc
    this.pageWidth = doc.internal.pageSize.getWidth()
    this.pageHeight = doc.internal.pageSize.getHeight()
    this.columnCount = 2
    this.columnMargin = 15
    this.margin = 20
    this.currentY = this.margin
    this.currentPage = 1

    // Calculate column width
    this.availableWidth = this.pageWidth - this.margin * 2 - this.columnMargin
    this.columnWidth = this.availableWidth / this.columnCount

    // Track current position
    this.currentColumn = 0
    this.currentY = this.margin

    // Spacing constants
    this.titleSpacing = 2 // Space after title
    this.contentSpacing = 4 // Space after content
    this.sectionSpacing = 10 // Space between sections
    this.lineHeight = {
      title: 5,
      content: 5,
    }
  }

  /**
   * Add a page header with title
   * @param {string} title - The header title
   */
  addPageHeader(title) {
    // Add header background
    this.doc.setFillColor(240, 245, 250)
    this.doc.rect(0, 0, this.pageWidth, 40, "F")

    // Add header title
    this.doc.setFont("Helvetica", "bold")
    this.doc.setFontSize(32)
    this.doc.setTextColor(44, 62, 80)
    this.doc.text(title, this.margin, 30)

    // Reset current Y position after header
    this.currentY = 50
  }

  /**
   * Add a page footer
   * @param {string} orgName - Organization name for the footer
   */
  addPageFooter(orgName) {
    // Add separator line
    this.doc.setDrawColor(220, 220, 220)
    this.doc.line(
      this.margin,
      this.pageHeight - 30,
      this.pageWidth - this.margin,
      this.pageHeight - 30
    )

    // Add organization name and page number
    this.doc.setFont("Helvetica", "italic")
    this.doc.setFontSize(10)
    this.doc.setTextColor(120, 120, 120)
    this.doc.text(orgName, this.margin, this.pageHeight - 20)
    this.doc.text(
      `Page ${this.currentPage}`,
      this.pageWidth - this.margin,
      this.pageHeight - 20,
      {
        align: "right",
      }
    )
  }
  /**
   * Add a title that flows through columns
   */
  addTitle(title) {
    // Set title style
    this.doc.setFont("Helvetica", "bold")
    this.doc.setFontSize(16)
    this.doc.setTextColor(44, 62, 80)

    // Split text to fit within column width
    const titleLines = this.doc.splitTextToSize(title, this.columnWidth)

    // Calculate required height - just the text height plus minimal spacing
    const requiredHeight =
      titleLines.length * this.lineHeight.title + this.titleSpacing

    // Check if we need to move to next column or page, but add section spacing
    // only if we're not at the top of a column
    if (this.currentY > this.margin) {
      this.checkAndAdvancePosition(requiredHeight + this.sectionSpacing)
    } else {
      this.checkAndAdvancePosition(requiredHeight)
    }

    // Get updated X position after possible column/page change
    const currentX =
      this.margin + this.currentColumn * (this.columnWidth + this.columnMargin)

    // Add the title
    this.doc.text(titleLines, currentX, this.currentY)

    // Advance Y position - just enough for the text plus minimal spacing
    this.currentY += requiredHeight
  }

  /**
   * Add content with improved spacing
   */
  addContent(content) {
    // Set content style
    this.doc.setFont("Helvetica", "normal")
    this.doc.setFontSize(12)
    this.doc.setTextColor(80, 80, 80)

    // Split text to fit column width
    const textLines = this.doc.splitTextToSize(content, this.columnWidth)

    // Calculate required height - text height plus spacing after content
    const requiredHeight =
      textLines.length * this.lineHeight.content + this.contentSpacing

    // Check if content fits in current column
    this.checkAndAdvancePosition(requiredHeight)

    // Get updated X position
    const currentX =
      this.margin + this.currentColumn * (this.columnWidth + this.columnMargin)

    // Add the content
    this.doc.text(textLines, currentX, this.currentY)

    // Advance Y position
    this.currentY += requiredHeight
  }

  /**
   * Check if we need to advance to next column or page with improved position handling
   */
  checkAndAdvancePosition(requiredHeight) {
    // If content doesn't fit in current column
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      // Move to next column
      this.currentColumn++

      // If we've used all columns on the page, create a new page
      if (this.currentColumn >= this.columnCount) {
        this.currentPage++
        this.addPageFooter(data.reportMetadata.organizationName)

        this.doc.addPage()
        this.currentColumn = 0
        this.currentY = this.margin
      } else {
        // Reset Y position for new column
        this.currentY = this.margin
      }
    }
  }

  /**
   * Add a small vertical space (use between related items)
   */
  addSmallSpace() {
    this.currentY += 3
    this.checkAndAdvancePosition(3)
  }

  /**
   * Add a medium vertical space (use between sections)
   */
  addMediumSpace() {
    this.currentY += 8
    this.checkAndAdvancePosition(8)
  }

  /**
   * Check if we need to advance to next column or page
   */
  checkAndAdvancePosition(requiredHeight) {
    // If content doesn't fit in current column
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      // Move to next column
      this.currentColumn++

      // If we've used all columns on the page, create a new page
      if (this.currentColumn >= this.columnCount) {
        this.addPageFooter(data.reportMetadata.organizationName)
        this.currentPage++
        this.doc.addPage()
        this.currentColumn = 0
        this.currentY = this.margin
      } else {
        // Reset Y position for new column
        this.currentY = this.margin
      }
    }
  }
  /**
   * Add image on the half left page
   * @param {string} imageData - The base64 image data
   */
  addImageLeft(imageData, imageWidth = 130) {
    const pageHeight = this.doc.internal.pageSize.getHeight()
    this.doc.addImage(imageData, "PNG", 0, 0, imageWidth, pageHeight)
  }
  /**
   * Add image on the half right page
   * @param {string} imageData - The base64 image data
   */
  addImageRight(imageData) {
    const pageWidth = this.doc.internal.pageSize.getWidth()
    const pageHeight = this.doc.internal.pageSize.getHeight()
    this.doc.addImage(imageData, "PNG", 130, 0, pageWidth - 100, pageHeight)
  }
  /**
   * Add a new page
   */
  addPage() {
    this.doc.addPage()
    this.currentY = this.margin
    this.currentPage++
  }
  /**
   * Add a page break
   */
  addPageBreak() {
    this.currentY += 10
    if (this.currentY > this.pageHeight - this.margin) {
      this.addPage()
    }
    this.doc.setDrawColor(220, 220, 220)
    this.doc.line(
      this.margin,
      this.currentY,
      this.pageWidth - this.margin,
      this.currentY
    )
    this.currentY += 10
  }

  /**
   * Format currency values
   * @param {number} value - Value to format
   * @returns {string} - Formatted currency string
   */
  formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NZD",
    }).format(value)
  }
  /**
   * Draw a maturity indicator based on Cloud Maturity Model
   * @param {number} score - Maturity score (1–5)
   */
  drawMaturityIndicator(score) {
    const stages = ["Initial", "Foundation", "Defined", "Measured", "Optimized"]

    const width = this.pageWidth - this.margin * 2
    const segmentWidth = width / stages.length
    const height = 10

    // Draw background segments with subtle gradient
    stages.forEach((stage, index) => {
      const fillR = 230 - index * 10
      const fillG = 240 - index * 10
      const fillB = 255 - index * 5

      this.doc.setFillColor(fillR, fillG, fillB)

      this.doc.roundedRect(
        this.margin + index * segmentWidth,
        this.currentY,
        segmentWidth,
        height,
        1,
        1,
        "F"
      )

      // Add stage label
      this.doc.setFont("Helvetica", "normal")
      this.doc.setFontSize(5)
      this.doc.setTextColor(80, 80, 80)
      this.doc.text(
        stage,
        this.margin + index * segmentWidth + segmentWidth / 2,
        this.currentY + height + 5,
        { align: "center" }
      )
    })

    // Highlight current score segment
    const scoreIndex = Math.floor(score) - 1
    const progressX = this.margin + scoreIndex * segmentWidth
    const progressWidth = segmentWidth

    this.doc.setFillColor(52, 152, 219) // Bright blue
    this.doc.roundedRect(
      progressX,
      this.currentY,
      progressWidth,
      height,
      1,
      1,
      "F"
    )

    // Add score label
    this.doc.setFont("Helvetica", "bold")
    this.doc.setFontSize(6)
    this.doc.setTextColor(255, 255, 255)
    this.doc.text(
      `${score.toFixed(1)}/5`,
      progressX + segmentWidth / 2,
      this.currentY + height / 2 + 2,
      { align: "center" }
    )

    // Move current Y position for next section
    this.currentY += height + 12
  }
}

/**
 * Report Generator Class for creating PDF reports
 */
class ReportGenerator {
  constructor(data) {
    this.data = data
    this.doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })
    this.helper = new PDFHelper(this.doc)
    this.showGrid = true
  }

  /**
   * Create Cover Page
   */
  coverPage() {
    const { pageWidth, pageHeight } = this.helper

    const image = "https://picsum.photos/id/48/200/300"
    this.doc.addImage(image, "PNG", 130, 0, pageWidth - 100, pageHeight)

    // Add white band
    const bandWidth = 140
    this.doc.setFillColor(255, 255, 255)
    this.doc.rect(0, 0, bandWidth, pageHeight, "F")

    // Title
    this.doc.setFont("Inter", "bold")
    this.doc.setFontSize(30)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text("CLOUD COST", 20, 50)
    this.doc.text("EFFICIENCY REPORT", 20, 70)

    // Subtitle
    this.doc.setFontSize(16)
    this.doc.setFont("Inter", "normal")
    this.doc.text(this.data.reportMetadata.organizationName, 20, 90)

    // Date
    this.doc.setFontSize(12)
    this.doc.text(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      20,
      100
    )

    // Footer
    this.doc.setFontSize(10)
    this.doc.setTextColor(120, 120, 120)
    this.doc.text(this.data.reportMetadata.generatedBy, 20, pageHeight - 20)
    this.doc.setFont("SpecialGothicExpandedOne-Regular-bold", "Bold")
    this.doc.setFontSize(28)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text("MakeStuffGo", pageWidth - 20, pageHeight - 20, {
      align: "right",
    })
  }

  /**
   * Creates the table of contents page
   */
  tableOfContents(doc) {
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

    this.helper.addPageHeader("Table of Contents")

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
    this.helper.addPageFooter(this.data.reportMetadata.organizationName)

    return doc
  }

  /**
   * Create Executive Summary
   */
  executiveSummary() {
    const { pageHeight, pageWidth } = this.helper

    // Add image to the left
    this.helper.addPageHeader(this.data.executiveSummary.sectionTitle)
    this.helper.addTitle(this.data.executiveSummary.subtopics[0].title)
    this.helper.addContent(this.data.executiveSummary.subtopics[0].content)
    this.helper.addTitle(this.data.executiveSummary.subtopics[1].title)
    this.helper.addContent(this.data.executiveSummary.subtopics[1].content)
    this.helper.addTitle(this.data.executiveSummary.subtopics[2].title)
    this.helper.addContent(this.data.executiveSummary.subtopics[2].content)
    this.helper.addTitle(this.data.executiveSummary.subtopics[3].title)
    this.helper.addContent(this.data.executiveSummary.subtopics[3].content)
    this.helper.addTitle(this.data.executiveSummary.subtopics[4].title)
    this.helper.addContent(this.data.executiveSummary.subtopics[4].content)
    this.helper.addMediumSpace()
    this.helper.addTitle(this.data.executiveSummary.subtopics[5].title)
    this.helper.addContent(this.data.executiveSummary.subtopics[5].content)

    // Add footer
    this.helper.addPageFooter(this.data.reportMetadata.organizationName)
  }

  /**
   * Generate the complete report
   * @param {HTMLElement} pieChartRef - Reference to pie chart element
   * @param {HTMLElement} lineChartRef - Reference to line chart element
   */
  async generateReport() {
    // 1. Create the Cover Page
    this.coverPage()
    this.helper.addPage()

    // 2. Create the Table of Contents
    this.tableOfContents(this.doc)
    this.helper.addPage()

    // 3. Create the Executive Summary
    this.executiveSummary()
    this.helper.addPage()

    return this.doc
  }
}

const ReportPage = () => {
  const pieChartRef = useRef(null)
  const lineChartRef = useRef(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handlePdfDownload = async () => {
    try {
      const pdf = new ReportGenerator(data)
      // Generate the report
      const doc = await pdf.generateReport(
        pieChartRef.current,
        lineChartRef.current
      )
      // Save the PDF
      doc.save("report.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        PDF Report Generator
      </h1>
      <button
        onClick={handlePdfDownload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Generate PDF
      </button>
      <div className="hidden">
        <PieChart ref={pieChartRef} />
        <LineChart ref={lineChartRef} />
      </div>
    </div>
  )
}
export default ReportPage
