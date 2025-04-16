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

/**
 * PDF Helper Class to handle common operations
 */
class PDFHelper {
  constructor(doc) {
    this.doc = doc
    this.pageWidth = doc.internal.pageSize.getWidth()
    this.pageHeight = doc.internal.pageSize.getHeight()
    this.margin = 20
    this.currentY = this.margin
    this.currentPage = 1
  }

  /**
   * Check if we need a new page and add one if necessary
   * @param {number} requiredHeight - The height of content to be added
   * @param {boolean} forceNewPage - Force creation of a new page
   * @returns {boolean} - Whether a new page was created
   */
  ensureSpace(requiredHeight, forceNewPage = false) {
    // Account for footer space (30mm)
    const footerSpace = 30
    const availableSpace = this.pageHeight - this.currentY - footerSpace

    if (forceNewPage || availableSpace < requiredHeight) {
      this.doc.addPage()
      this.currentPage++
      this.currentY = this.margin
      return true
    }
    return false
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
    this.doc.setFontSize(18)
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
   * Draw a maturity indicator
   * @param {number} score - Maturity score (1-5)
   */
  drawMaturityIndicator(score) {
    const stages = [
      "Beginner",
      "Foundational",
      "Intermediate",
      "Advanced",
      "Optimized",
    ]
    const width = this.pageWidth - this.margin * 2
    const segmentWidth = width / stages.length
    const height = 10

    // Draw background rectangles
    stages.forEach((stage, index) => {
      // Calculate colors - gradient from light blue to dark blue
      this.doc.setFillColor(230 - index * 15, 240 - index * 15, 255 - index * 5)

      // Draw segment
      this.doc.roundedRect(
        this.margin + index * segmentWidth,
        this.currentY,
        segmentWidth,
        height,
        1,
        1,
        "F"
      )

      // Add stage name
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

    // Highlight current score
    const scoreIndex = Math.floor(score) - 1
    this.doc.setFillColor(52, 152, 219) // Bright blue for highlight
    this.doc.roundedRect(
      this.margin + scoreIndex * segmentWidth,
      this.currentY,
      segmentWidth,
      height,
      1,
      1,
      "F"
    )

    // Add score text
    this.doc.setFont("Helvetica", "bold")
    this.doc.setFontSize(6)
    this.doc.setTextColor(255, 255, 255)
    this.doc.text(
      `${score}/5`,
      this.margin + scoreIndex * segmentWidth + segmentWidth / 2,
      this.currentY + height / 2 + 2,
      { align: "center" }
    )

    // Update the current Y position
    this.currentY += height + 10
  }

  /**
   * Add a info box with a title and content
   * @param {string} title - Box title
   * @param {string|string[]} content - Content (text or bullet points)
   * @param {number} x - X position
   * @param {number} width - Box width
   * @param {number} height - Box height
   */
  addInfoBox(title, content, x, width, height) {
    // Draw box background
    this.doc.setFillColor(248, 250, 252)
    this.doc.roundedRect(x, this.currentY, width, height, 2, 2, "F")

    // Draw accent on left side
    this.doc.setFillColor(52, 152, 219)
    this.doc.rect(x, this.currentY, 3, height, "F")

    // Add title
    this.doc.setFont("Helvetica", "bold")
    this.doc.setFontSize(10)
    this.doc.setTextColor(44, 62, 80)
    this.doc.text(title, x + 8, this.currentY + 8)

    // Add content
    this.doc.setFont("Helvetica", "normal")
    this.doc.setFontSize(8)
    this.doc.setTextColor(60, 60, 60)

    // Handle content as array (for multiple lines) or string
    if (Array.isArray(content)) {
      let contentY = this.currentY + 18
      content.forEach((line) => {
        // Add bullet point
        this.doc.circle(x + 8, contentY - 1.5, 1, "F")
        // Add text with indentation
        this.doc.text(line, x + 12, contentY)
        contentY += 10
      })
    } else {
      const textLines = this.doc.splitTextToSize(content, width - 16)
      this.doc.text(textLines, x + 8, this.currentY + 16)
    }
  }

  /**
   * Add a section title
   * @param {string} title - The section title
   */
  addSectionTitle(title) {
    this.doc.setFont("Helvetica", "bold")
    this.doc.setFontSize(12)
    this.doc.setTextColor(44, 62, 80)
    this.doc.text(title, this.margin, this.currentY)
    this.currentY += 10
  }

  /**
   * Add a metric box for key insights
   * @param {Object} metric - Metric object with label and value
   * @param {number} x - X position
   * @param {number} width - Box width
   */
  addMetricBox(metric, x, width) {
    const height = 40

    // Add colored box
    this.doc.setFillColor(52, 152, 219, 0.1)
    this.doc.roundedRect(x, this.currentY, width - 10, height, 3, 3, "F")

    // Add label
    this.doc.setFont("Helvetica", "normal")
    this.doc.setFontSize(9)
    this.doc.setTextColor(80, 80, 80)
    this.doc.text(metric.label, x + 5, this.currentY + 12)

    // Add value
    this.doc.setFont("Helvetica", "bold")
    this.doc.setFontSize(14)
    this.doc.setTextColor(52, 152, 219)
    this.doc.text(metric.value, x + 5, this.currentY + 28)
  }

  /**
   * Get a descriptive label for a maturity score
   * @param {number} score - The maturity score
   * @returns {string} - The strength label
   */
  getStrengthLabel(score) {
    if (score >= 4.5) return "Exceptional"
    if (score >= 4.0) return "Very Strong"
    if (score >= 3.5) return "Strong"
    if (score >= 3.0) return "Solid"
    if (score >= 2.5) return "Developing"
    if (score >= 2.0) return "Basic"
    return "Emerging"
  }

  /**
   * Get the top N dimensions by score
   * @param {Array} dimensions - The dimensional scores
   * @param {number} count - The number of dimensions to return
   * @returns {string} - A comma-separated list of top dimensions
   */
  getTopDimensions(dimensions, count) {
    const sortedDimensions = [...dimensions].sort((a, b) => b.score - a.score)
    return sortedDimensions
      .slice(0, count)
      .map((d) => d.dimension)
      .join(" and ")
  }

  /**
   * Get the bottom N dimensions by score
   * @param {Array} dimensions - The dimensional scores
   * @param {number} count - The number of dimensions to return
   * @returns {string} - A comma-separated list of bottom dimensions
   */
  getBottomDimensions(dimensions, count) {
    const sortedDimensions = [...dimensions].sort((a, b) => a.score - b.score)
    return sortedDimensions
      .slice(0, count)
      .map((d) => d.dimension)
      .join(" and ")
  }
}

/**
 * Report Generator Class for creating PDF reports
 */
class ReportGenerator {
  constructor(data) {
    this.data = data
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })
    this.helper = new PDFHelper(this.doc)
    this.showGrid = true
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
   * Draw development grid (for debugging)
   */
  drawCoordinateGrid() {
    if (!this.showGrid) return

    const { pageWidth, pageHeight } = this.helper

    // Draw light grid lines every 10 points
    this.doc.setDrawColor(240, 240, 240)
    this.doc.setLineWidth(0.1)

    // Vertical lines (every 10 points)
    for (let x = 0; x <= pageWidth; x += 10) {
      this.doc.line(x, 0, x, pageHeight)
    }

    // Horizontal lines (every 10 points)
    for (let y = 0; y <= pageHeight; y += 10) {
      this.doc.line(0, y, pageWidth, y)
    }

    // Draw slightly darker lines for 50-point increments
    this.doc.setDrawColor(220, 220, 220)
    this.doc.setLineWidth(0.2)

    // Vertical lines (every 50 points)
    for (let x = 0; x <= pageWidth; x += 50) {
      this.doc.line(x, 0, x, pageHeight)
      this.doc.setFontSize(6)
      this.doc.setTextColor(180, 180, 180)
      this.doc.text(`${x}`, x, 10, { align: "center" })
    }

    // Horizontal lines (every 50 points)
    for (let y = 0; y <= pageHeight; y += 50) {
      this.doc.line(0, y, pageWidth, y)
      this.doc.setFontSize(6)
      this.doc.setTextColor(180, 180, 180)
      this.doc.text(`${y}`, 5, y)
    }
  }

  /**
   * Create the cover page
   */
  createCoverPage() {
    const { pageWidth, pageHeight } = this.helper

    // Add colored background on top portion
    this.doc.setFillColor(52, 152, 219) // Blue brand color
    this.doc.rect(0, 0, pageWidth, 80, "F")

    // Draw white accent strips
    this.doc.setFillColor(255, 255, 255)
    this.doc.setGState(new this.doc.GState({ opacity: 0.1 }))
    this.doc.rect(0, 15, pageWidth, 5, "F")
    this.doc.rect(0, 30, pageWidth, 2, "F")
    this.doc.rect(0, 60, pageWidth, 3, "F")
    this.doc.setGState(new this.doc.GState({ opacity: 1 })) // Reset opacity

    // Add company logo placeholder (would be replaced with actual logo)
    const logo = "https://picsum.photos/120/60"
    this.doc.addImage(logo, "PNG", 20, 20, 50, 25)

    // Add report title
    this.doc.setFont("Helvetica", "bold")
    this.doc.setFontSize(28)
    this.doc.setTextColor(255, 255, 255)
    this.doc.text("CLOUD COST", 20, 100)
    this.doc.text("EFFICIENCY", 20, 115)
    this.doc.text("REPORT", 20, 130)

    // Add date and company
    this.doc.setFont("Helvetica", "normal")
    this.doc.setFontSize(14)
    this.doc.setTextColor(80, 80, 80)
    this.doc.text(this.data.reportMetadata.reportDate, 20, 150)

    this.doc.setFont("Helvetica", "bold")
    this.doc.setFontSize(16)
    this.doc.text(
      this.data.reportMetadata.organizationName.toUpperCase(),
      20,
      165
    )

    // Add decorative element
    this.doc.setFillColor(52, 152, 219, 0.8)
    this.doc.roundedRect(20, 180, 50, 6, 3, 3, "F")
    this.doc.roundedRect(20, 190, 30, 6, 3, 3, "F")

    // Add report generation info at bottom
    this.doc.setFont("Helvetica", "italic")
    this.doc.setFontSize(10)
    this.doc.setTextColor(120, 120, 120)
    this.doc.text(this.data.reportMetadata.generatedBy, 20, pageHeight - 20)
    this.doc.text("www.makestuffgo.com", pageWidth - 20, pageHeight - 20, {
      align: "right",
    })
  }

  /**
   * Create the table of contents page
   */
  createTableOfContents() {
    const { margin, pageWidth } = this.helper

    // Add page header
    this.helper.addPageHeader("Table of Contents")

    // Generate TOC items
    const tocItems = [
      { title: "Executive Summary", page: 2 },
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

    // Add items with improved dot leaders
    tocItems.forEach((item, index) => {
      // Section number
      this.doc.setFont("Helvetica", "bold")
      this.doc.setFontSize(12)
      this.doc.setTextColor(52, 152, 219)
      this.doc.text(
        `${(index + 1).toString().padStart(2, "0")}.`,
        margin,
        this.helper.currentY
      )

      // Section title
      this.doc.setFont("Helvetica", "normal")
      this.doc.setTextColor(60, 60, 60)
      this.doc.text(item.title, margin + 15, this.helper.currentY)

      // Calculate the width available for dots
      const titleWidth = this.doc.getTextWidth(item.title)
      const pageNumWidth = this.doc.getTextWidth(item.page.toString())
      const titleEndX = margin + 15 + titleWidth
      const pageNumX = pageWidth - margin - pageNumWidth
      const dotsWidth = pageNumX - titleEndX - 5

      // Create dot leaders with proper spacing
      const singleDot = "."
      const dotWidth = this.doc.getTextWidth(singleDot)
      const numberOfDots = Math.floor(dotsWidth / (dotWidth * 1.5))
      let dots = ""

      for (let i = 0; i < numberOfDots; i++) {
        dots += ". "
      }

      // Position dots after title with proper spacing
      this.doc.setTextColor(180, 180, 180)
      this.doc.text(dots, titleEndX + 3, this.helper.currentY)

      // Page number (positioned absolutely to align right)
      this.doc.setTextColor(60, 60, 60)
      this.doc.text(
        item.page.toString(),
        pageWidth - margin,
        this.helper.currentY,
        { align: "right" }
      )

      this.helper.currentY += 18
    })

    // Add footer
    this.helper.addPageFooter(this.data.reportMetadata.organizationName)
  }

  /**
   * Create the executive summary page
   * @param {HTMLElement} pieChartRef - Reference to pie chart element
   * @param {HTMLElement} lineChartRef - Reference to line chart element
   */
  async createExecutiveSummary(pieChartRef, lineChartRef) {
    const { margin, pageWidth } = this.helper

    // Add page header
    this.helper.addPageHeader("01 Executive Summary")

    // Introduction text
    this.doc.setFont("Helvetica", "normal")
    this.doc.setFontSize(11)
    this.doc.setTextColor(60, 60, 60)

    const introText = `Based on our comprehensive cloud maturity assessment, ${this.data.reportMetadata.organizationName} has achieved an Intermediate (${this.data.executiveSummary.cloudMaturityScore}/5) maturity level in cloud computing with strong fundamentals in place for further optimization. The organization demonstrates a strong understanding of core cloud principles and a profound commitment to leveraging the transformative benefits of cloud adoption.`

    const textLines = this.doc.splitTextToSize(
      introText,
      pageWidth - margin * 2
    )
    this.doc.text(textLines, margin, this.helper.currentY)

    this.helper.currentY += textLines.length * 7 + 10

    // Add charts section - costs by service and trend
    if (pieChartRef && lineChartRef) {
      // Add section title
      this.helper.addSectionTitle("CLOUD EXPENDITURE OVERVIEW")

      // Check if we have enough space for charts (at least 100mm)
      const chartHeight = 100
      if (this.helper.currentY + chartHeight > this.helper.pageHeight - 40) {
        this.doc.addPage()
        this.helper.currentPage++
        this.helper.currentY = margin
        this.helper.addPageHeader("01 Executive Summary (continued)")
      }

      try {
        // Create a combined chart by capturing both charts
        const pieCanvas = await html2canvas(pieChartRef, { scale: 2 })
        const lineCanvas = await html2canvas(lineChartRef, { scale: 2 })

        // Get chart images
        const pieImage = pieCanvas.toDataURL("image/png")
        const lineImage = lineCanvas.toDataURL("image/png")

        // Calculate dimensions - maintain aspect ratio better
        const chartWidth = (pageWidth - margin * 3) / 2
        const pieHeight = chartHeight // Slightly shorter for pie chart
        const lineHeight = chartHeight

        // Add pie chart on left with padding
        this.doc.setDrawColor(220, 220, 220)
        this.doc.setLineWidth(0.5)
        this.doc.rect(margin, this.helper.currentY, chartWidth, pieHeight)
        this.doc.addImage(
          pieImage,
          "PNG",
          margin, // Add 5mm padding on left
          this.helper.currentY, // Add 5mm padding on top
          chartWidth, // Subtract 10mm for left and right padding
          pieHeight // Subtract 10mm for top and bottom padding
        )

        // Add line chart on right
        this.doc.rect(
          margin * 2 + chartWidth,
          this.helper.currentY,
          chartWidth,
          lineHeight
        )
        this.doc.addImage(
          lineImage,
          "PNG",
          margin * 2 + chartWidth, // Add 5mm padding on left
          this.helper.currentY, // Add 5mm padding on top
          chartWidth, // Subtract 10mm for left and right padding
          lineHeight // Subtract 10mm for top and bottom padding
        )

        this.helper.currentY += chartHeight + 5

        // Add caption
        this.doc.setFont("Helvetica", "italic")
        this.doc.setFontSize(8)
        this.doc.setTextColor(100, 100, 100)
        this.doc.text(
          "Fig 1: Cloud service distribution and monthly trend",
          margin,
          this.helper.currentY
        )

        this.helper.currentY += 15
      } catch (error) {
        console.error("Error generating charts:", error)
        this.helper.currentY += 10
      }
    }

    // Two-column layout for challenges and recommendations
    const colWidth = (pageWidth - margin * 3) / 2
    const boxHeight = 70
    this.helper.currentPage++
    console.log(this.helper.currentPage)
    this.helper.addPageFooter(this.data.reportMetadata.organizationName)

    // Check if we need a new page for challenges and recommendations
    if (this.helper.currentY + boxHeight > this.helper.pageHeight - 40) {
      this.doc.addPage()
      this.helper.currentPage++
      this.helper.currentY = margin
      this.helper.addPageHeader("01 Executive Summary (continued)")
      console.log(this.helper.currentPage)
    }

    // CHALLENGES BOX - Left column
    this.helper.addInfoBox(
      "CHALLENGES",
      this.data.executiveSummary.challenges,
      margin,
      colWidth + 15,
      boxHeight
    )

    // RECOMMENDATIONS BOX - Right column
    this.helper.addInfoBox(
      "RECOMMENDATIONS",
      this.data.executiveSummary.recommendations,
      margin * 2 + colWidth,
      colWidth + 15,
      boxHeight
    )

    this.helper.currentY += boxHeight + 10

    // Check if we need to add key metrics on a new page
    if (this.helper.currentY + 60 > this.helper.pageHeight - 40) {
      this.doc.addPage()
      this.helper.currentPage++
      this.helper.currentY = margin
      this.helper.addPageHeader("01 Executive Summary (continued)")
    }

    // Add key metrics
    this.drawCoordinateGrid()
    this.helper.addSectionTitle("KEY CLOUD MATURITY INSIGHTS")

    const metrics = [
      {
        label: "Total Cloud Spend",
        value: this.formatCurrency(this.data.executiveSummary.cloudSpend.total),
      },
      {
        label: "YoY Growth",
        value: "+16%",
      },
      {
        label: "Optimization Potential",
        value: this.formatCurrency(
          this.data.executiveSummary.cloudSpend.total *
            this.data.executiveSummary.cloudSpend.reductionPotential
        ),
      },
    ]

    const metricWidth = (pageWidth - margin * 2) / metrics.length

    metrics.forEach((metric, index) => {
      const metricX = margin + index * metricWidth
      this.helper.addMetricBox(metric, metricX, metricWidth)
    })

    this.helper.currentY += 50

    // Add footer
    this.helper.addPageFooter(this.data.reportMetadata.organizationName)
  }

  /**
   * Create Organisational Cloud Maturity Assessment
   */
  async createOrgCloudMaturityAss() {
    const { margin, pageWidth, pageHeight } = this.helper

    // Add page header
    this.helper.addPageHeader("02 Organisational Cloud Maturity Assessment")

    // Add overview
    this.doc.setFont("Helvetica", "normal")
    this.doc.setFontSize(11)
    this.doc.setTextColor(60, 60, 60)

    const textLines = this.doc.splitTextToSize(
      this.data.cloudMaturityAssessment.overview,
      pageWidth - margin * 2
    )
    this.doc.text(textLines, margin, this.helper.currentY)

    this.helper.currentY += textLines.length * 7 + 10

    // Add maturity indicator
    this.helper.drawMaturityIndicator(
      this.data.cloudMaturityAssessment.overallScore
    )

    const colWidth = (pageWidth - margin * 3) / 2
    const boxHeight = 70

    // Table Title
    this.helper.addSectionTitle("Cloud Maturity Levels")

    // Table Setup
    this.doc.setFont("Helvetica", "bold")
    this.doc.setFontSize(9)
    this.doc.setTextColor(52, 73, 94)

    const startX = margin
    const tableY = this.helper.currentY
    const col1Width = 40
    const col2Width = pageWidth - margin * 2 - col1Width
    const rowHeight = 10

    // Table Headers
    this.doc.text("Level", startX, tableY)
    this.doc.text("Description", startX + col1Width, tableY)

    this.doc.setDrawColor(220, 220, 220)
    this.doc.line(startX, tableY + 2, pageWidth - margin, tableY + 2)

    this.doc.setFont("Helvetica", "normal")
    this.doc.setFontSize(8)
    this.doc.setTextColor(60, 60, 60)

    let y = tableY + 8

    this.data.cloudMaturityAssessment.maturityLevels.forEach((item) => {
      // Wrap description if needed
      const descLines = this.doc.splitTextToSize(item.description, col2Width)
      const lineCount = descLines.length
      const cellHeight = lineCount * 5

      // Draw level
      this.doc.text(item.level, startX, y)
      this.doc.text(descLines, startX + col1Width, y)

      y += cellHeight + 4
    })

    // Update current Y after table
    this.helper.currentY = y + 5

    this.helper.currentPage++
    this.helper.addPageFooter(this.data.reportMetadata.organizationName)

    // Check if we have enough space for dimensional analysis
    // Approximately 150mm needed for 6 dimensions
    if (this.helper.currentY + 150 > this.helper.pageHeight - 40) {
      this.doc.addPage()
      this.helper.currentPage++
      this.helper.currentY = margin
      this.helper.addPageHeader(
        "02 Organisational Cloud Maturity Assessment (continued)"
      )
    }

    // Add dimensional analysis section
    this.helper.addSectionTitle("DIMENSIONAL ANALYSIS")
    this.helper.currentY += 5

    // Add description text
    const descriptionText =
      "Our assessment evaluates your organization across six critical dimensions of cloud maturity. The scores below indicate your current position and highlight areas of strength and opportunity."
    this.doc.setFont("Helvetica", "normal")
    this.doc.setFontSize(9)
    this.doc.setTextColor(60, 60, 60)
    const descLines = this.doc.splitTextToSize(
      descriptionText,
      pageWidth - margin * 2
    )
    this.doc.text(descLines, margin, this.helper.currentY)
    this.helper.currentY += descLines.length * 5 + 10

    // Prepare dimensional scores data
    const dimensions = this.data.cloudMaturityAssessment.dimensionalScores
    const barWidth = pageWidth - margin * 2
    const barHeight = 18
    const barSpacing = 25
    const labelWidth = 120

    // Draw each dimension as a horizontal bar
    dimensions.forEach((dimension, index) => {
      // Calculate value as percentage of maximum (5.0)
      const maxScore = 5.0
      const percentage = dimension.score / maxScore

      // Calculate y position for this bar
      const y = this.helper.currentY

      // Draw dimension label
      this.doc.setFont("Helvetica", "bold")
      this.doc.setFontSize(9)
      this.doc.setTextColor(50, 50, 50)
      this.doc.text(dimension.dimension, margin, y + barHeight / 2 + 3)

      // Draw background bar (gray)
      this.doc.setFillColor(230, 230, 230)
      this.doc.roundedRect(
        margin + labelWidth,
        y,
        barWidth - labelWidth,
        barHeight,
        2,
        2,
        "F"
      )

      // Draw score bar (blue with gradient based on score)
      const r = Math.max(20, 52 - Math.round(percentage * 30)) // Darker blue for higher scores
      const g = Math.max(100, 152 - Math.round(percentage * 50))
      const b = 219
      this.doc.setFillColor(r, g, b)
      this.doc.roundedRect(
        margin + labelWidth,
        y,
        (barWidth - labelWidth) * percentage,
        barHeight,
        2,
        2,
        "F"
      )

      // Add score text
      this.doc.setFont("Helvetica", "bold")
      this.doc.setFontSize(10)
      this.doc.setTextColor(255, 255, 255)

      // Only put text inside bar if bar is wide enough
      if (percentage > 0.15) {
        this.doc.text(
          dimension.score.toFixed(1),
          margin + labelWidth + 10,
          y + barHeight / 2 + 3
        )
      } else {
        // Put text after the bar if bar is too narrow
        this.doc.setTextColor(50, 50, 50)
        this.doc.text(
          dimension.score.toFixed(1),
          margin + labelWidth + (barWidth - labelWidth) * percentage + 5,
          y + barHeight / 2 + 3
        )
      }

      // Add strength indicator
      const strengthLabel = this.helper.getStrengthLabel(dimension.score)
      this.doc.setFont("Helvetica", "normal")
      this.doc.setFontSize(8)
      this.doc.setTextColor(100, 100, 100)
      this.doc.text(
        strengthLabel,
        pageWidth - margin - 5,
        y + barHeight / 2 + 3,
        { align: "right" }
      )

      // Move to next bar position
      this.helper.currentY += barSpacing
    })

    // Add summary text
    this.helper.currentY += 5
    const summaryText = `Your organization's strengths lie in ${this.helper.getTopDimensions(
      dimensions,
      2
    )} (${dimensions
      .sort((a, b) => b.score - a.score)[0]
      .score.toFixed(1)}, ${dimensions
      .sort((a, b) => b.score - a.score)[1]
      .score.toFixed(
        1
      )}), while opportunities for growth exist in ${this.helper.getBottomDimensions(
      dimensions,
      2
    )} (${dimensions
      .sort((a, b) => a.score - b.score)[0]
      .score.toFixed(1)}, ${dimensions
      .sort((a, b) => a.score - b.score)[1]
      .score.toFixed(1)}).`

    this.doc.setFont("Helvetica", "italic")
    this.doc.setFontSize(9)
    this.doc.setTextColor(80, 80, 80)
    const summaryLines = this.doc.splitTextToSize(
      summaryText,
      pageWidth - margin * 2
    )
    this.doc.text(summaryLines, margin, this.helper.currentY)
    this.helper.currentY += summaryLines.length * 5 + 15

    this.helper.addPageFooter(this.data.reportMetadata.organizationName)

    // Add industry comparison if available
    if (this.data.cloudMaturityAssessment.industryComparison) {
      // Check if we need a new page
      if (this.helper.currentY + 70 > this.helper.pageHeight - 40) {
        this.doc.addPage()
        this.helper.currentPage++
        this.helper.currentY = margin
        this.helper.addPageHeader(
          "02 Organisational Cloud Maturity Assessment (continued)"
        )
      }

      const comparison = this.data.cloudMaturityAssessment.industryComparison

      this.helper.addSectionTitle("INDUSTRY COMPARISON")
      this.helper.currentY += 10

      // Calculate metrics for comparison
      const metricWidth = (pageWidth - margin * 2) / 3

      // Your Score
      this.doc.setFillColor(52, 152, 219, 0.1)
      this.doc.roundedRect(
        margin,
        this.helper.currentY,
        metricWidth - 10,
        50,
        3,
        3,
        "F"
      )
      this.doc.setFont("Helvetica", "normal")
      this.doc.setFontSize(9)
      this.doc.setTextColor(80, 80, 80)
      this.doc.text("Your Score", margin + 10, this.helper.currentY + 15)
      this.doc.setFont("Helvetica", "bold")
      this.doc.setFontSize(18)
      this.doc.setTextColor(52, 152, 219)
      this.doc.text(
        comparison.organizationScore.toFixed(1),
        margin + 10,
        this.helper.currentY + 35
      )

      // Industry Average
      this.doc.setFillColor(52, 152, 219, 0.1)
      this.doc.roundedRect(
        margin + metricWidth,
        this.helper.currentY,
        metricWidth - 10,
        50,
        3,
        3,
        "F"
      )
      this.doc.setFont("Helvetica", "normal")
      this.doc.setFontSize(9)
      this.doc.setTextColor(80, 80, 80)
      this.doc.text(
        "Industry Average",
        margin + metricWidth + 10,
        this.helper.currentY + 15
      )
      this.doc.setFont("Helvetica", "bold")
      this.doc.setFontSize(18)
      this.doc.setTextColor(52, 152, 219)
      this.doc.text(
        comparison.industryAverage.toFixed(1),
        margin + metricWidth + 10,
        this.helper.currentY + 35
      )

      // Industry Leaders
      this.doc.setFillColor(52, 152, 219, 0.1)
      this.doc.roundedRect(
        margin + metricWidth * 2,
        this.helper.currentY,
        metricWidth - 10,
        50,
        3,
        3,
        "F"
      )
      this.doc.setFont("Helvetica", "normal")
      this.doc.setFontSize(9)
      this.doc.setTextColor(80, 80, 80)
      this.doc.text(
        "Industry Leaders",
        margin + metricWidth * 2 + 10,
        this.helper.currentY + 15
      )
      this.doc.setFont("Helvetica", "bold")
      this.doc.setFontSize(18)
      this.doc.setTextColor(52, 152, 219)
      this.doc.text(
        comparison.industryLeaders.toFixed(1),
        margin + metricWidth * 2 + 10,
        this.helper.currentY + 35
      )

      this.helper.currentY += 60
    }

    // SHORT-TERM FOCUS BOX - Left column
    this.helper.addInfoBox(
      "Short-Term Focus",
      this.data.cloudMaturityAssessment.shortTermFocus,
      this.helper.margin,
      colWidth + 15,
      boxHeight
    )

    // LONG-TERM OBJECTIVES BOX - Right column
    this.helper.addInfoBox(
      "Long-Term Objectives",
      this.data.cloudMaturityAssessment.longTermObjectives,
      this.helper.margin * 2 + colWidth,
      colWidth + 15,
      boxHeight
    )

    // Add footer
    this.helper.addPageFooter(this.data.reportMetadata.organizationName)
  }

  /**
   * Generate the complete report
   * @param {HTMLElement} pieChartRef - Reference to pie chart element
   * @param {HTMLElement} lineChartRef - Reference to line chart element
   */
  async generateReport(pieChartRef, lineChartRef) {
    // 1. Create Cover Page
    // this.drawCoordinateGrid()
    this.createCoverPage()

    // 2. Add Table of Contents
    this.doc.addPage()
    this.drawCoordinateGrid()
    this.createTableOfContents()

    // 3. Add Executive Summary
    this.doc.addPage()
    this.drawCoordinateGrid()
    await this.createExecutiveSummary(pieChartRef, lineChartRef)

    // 4. Add Organisational Cloud Maturity Assessment
    this.doc.addPage()
    this.drawCoordinateGrid()
    await this.createOrgCloudMaturityAss()

    // Return the completed document
    return this.doc
  }
}

const ReportPage = () => {
  // Separate refs for each chart
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
   * Handle PDF generation and download
   */
  const handlePdfDownload = async () => {
    try {
      // Create report generator with sample data
      const generator = new ReportGenerator(sampleData)

      // Generate the report
      const doc = await generator.generateReport(
        pieChartRef.current,
        lineChartRef.current
      )

      // Save the PDF
      doc.save(`${sampleData.reportMetadata.organizationName}_Cloud_Report.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("An error occurred while generating the PDF. Please try again.")
    }
  }

  if (!isClient) {
    // Render nothing on the server to avoid hydration mismatch
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-8 mb-8">
      <h1 className="text-2xl font-bold">
        Cloud Cost Efficiency Report Generator
      </h1>
      <p className="text-gray-600">
        Generate a professional PDF report analyzing cloud costs and
        optimization opportunities.
      </p>

      {/* Charts grid - using a 2-column layout on medium screens and up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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
                label={({ name, percent }) => {
                  // Format the percentage to be more compact
                  const pct = (percent * 100).toFixed(0)
                  return `${name}: ${pct}%`
                }}
                outerRadius={80}
                labelOffset={10}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                isAnimationActive={false} // Better for PDF capture
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
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center font-medium">
            Total Cloud Spend:{" "}
            {formatCurrency(sampleData.executiveSummary.cloudSpend.total)}
          </div>
        </div>

        {/* Line chart section */}
        <div ref={lineChartRef} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">
            Monthly Cloud Spend Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={sampleData.executiveSummary.monthlyTrend}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 40, // More space for x-axis labels
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                angle={-45} // Angle labels for better readability
                textAnchor="end"
                height={70} // More space for angled labels
                tick={{ fontSize: 10 }}
                interval={1} // Show every label
              />
              <YAxis
                width={70} // More space for currency labels
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "NZD",
                    maximumFractionDigits: 0,
                    notation: "compact",
                  }).format(value)
                }
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Line
                name="Monthly Spend"
                type="monotone"
                dataKey="spend"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false} // Better for PDF capture
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex gap-4">
        <button
          onClick={handlePdfDownload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate PDF
        </button>
      </div>
    </div>
  )
}

export default ReportPage
