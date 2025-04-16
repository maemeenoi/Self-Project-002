"use client"
// Import React library - the foundation for building the component
import React, { useState, useEffect, useRef } from "react"
import sampleData from "../sample-json-data.json"
import { jsPDF } from "jspdf"

// Import visualization components from the recharts library
// These components will be used to create our charts
import {
  PieChart, // Container for pie charts
  Pie, // The actual pie chart component
  Cell, // Individual segments of the pie chart
  LineChart, // Container for line charts
  Line, // The actual line in a line chart
  XAxis, // X-axis of charts
  YAxis, // Y-axis of charts
  CartesianGrid, // Grid lines in charts
  Tooltip, // Hover tooltip for data points
  Legend, // Chart legend
  ResponsiveContainer, // Makes charts responsive to parent container size
} from "recharts"
import html2canvas from "html2canvas"

// Sample JSON data that would normally come from an API or file
// This mimics what you might get from an Azure database
// const sampleData = {
//   organizationName: "Cloudy Ltd.",
//   reportPeriod: "Q1 2025",
//   reportDate: "March 31, 2025",
//   cloudMaturityScore: 3.8,
//   cloudSpend: {
//     total: 547890,
//     reductionPotential: 0.235,
//     annualSavingsOpportunity: 309450,
//     byService: [
//       { name: "Compute", value: 230114 },
//       { name: "Storage", value: 126015 },
//       { name: "Databases", value: 98620 },
//       { name: "Networking", value: 65747 },
//       { name: "AI/ML Services", value: 27395 },
//     ],
//   },
//   monthlyTrend: [
//     { month: "Oct 2024", spend: 172450 },
//     { month: "Nov 2024", spend: 180870 },
//     { month: "Dec 2024", spend: 194570 },
//     { month: "Jan 2025", spend: 177390 },
//     { month: "Feb 2025", spend: 182450 },
//     { month: "Mar 2025", spend: 187980 },
//   ],
//   challenges: [
//     "Increasing cloud infrastructure costs (16% YoY)",
//     "Low resource utilization (avg. 37% VM utilization)",
//     "Insufficient cost allocation tracking",
//     "Manual deployment processes causing delays",
//   ],
//   recommendations: [
//     "Implement rightsizing for 28 identified VMs",
//     "Convert eligible workloads to reserved instances",
//     "Deploy automated scheduling for non-production resources",
//     "Enhance Infrastructure as Code implementation",
//   ],
// }

// Main component function
const ExecutiveSummaryExample = () => {
  // State to hold our data - in a real application, this would be loaded from an API
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef(null)

  // Array of colors to use for the pie chart segments
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // useEffect hook to simulate loading data from an API
  useEffect(() => {
    // In a real application, this would be a fetch call to your API
    // For example: fetch('/api/cloud-cost-data')
    //              .then(response => response.json())
    //              .then(data => { setData(data); setLoading(false); });

    // Simulate API loading with a timeout
    setTimeout(() => {
      setData(sampleData)
      setLoading(false)
    }, 500)
  }, []) // Empty dependency array means this effect runs once on component mount

  // Show loading state while data is being fetched
  if (loading) {
    return <div className="p-6">Loading data...</div>
  }

  // Format currency values for display
  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`
  }

  // Calculate the percentage for display
  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`
  }

  //Function to Download PDF
  const handlePdfDownload = async () => {
    const element = printRef.current
    if (!element) {
      return "Element not found"
    }

    console.log("Inspecting element:", element) // Log the element

    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Increase resolution
      useCORS: true, // Allow cross-origin images
    })

    // Convert the canvas to a data URL
    const data = canvas.toDataURL("image/png")

    // Create a new jsPDF instance for A4 size
    const pdf = new jsPDF({
      orientation: "portrait", // Portrait orientation
      unit: "mm", // Use points as the unit
      format: "a4", // A4 paper size
    })

    // Get the dimensions of the A4 page
    const pageWidth = pdf.internal.pageSize.getWidth() // 595.28 points
    const pageHeight = pdf.internal.pageSize.getHeight() // 841.89 points
    console.log("Page dimensions:", pageWidth, pageHeight) // Log the dimensions

    // Friom Adrian
    const margin = 15 // in mm
    pdf.setFontSize(18)
    pdf.text("Executive Summary", pageWidth / 2, margin, { align: "center" })
    pdf.setFontSize(12)
    pdf.text(element)

    // Get the dimensions of the canvas
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    // Calculate the aspect ratio of the canvas
    const aspectRatio = canvasWidth / canvasHeight

    // Calculate the dimensions to fit the canvas into the A4 page
    let imgWidth = pageWidth // Default to full page width
    let imgHeight = pageWidth / aspectRatio // Adjust height to maintain aspect ratio

    // If the calculated height exceeds the page height, adjust the width instead
    if (imgHeight > pageHeight) {
      imgHeight = pageHeight
      imgWidth = pageHeight * aspectRatio
    }

    // Add the image to the PDF, centered on the page
    const xOffset = (pageWidth - imgWidth) / 2 // Center horizontally
    const yOffset = (pageHeight - imgHeight) / 2 // Center vertically
    pdf.addImage(data, "PNG", xOffset, yOffset, imgWidth, imgHeight)

    // Save the PDF
    pdf.save("examplepdf.pdf")
  }

  return (
    // Main container for the executive summary
    <div ref={printRef} className="max-w-5xl mx-auto p-6 bg-white shadow-lg">
      <div className="w-full p-6 bg-gray-50 border-b border-gray-200">
        {/* Header section with report title and company info */}
        <div className="mb-8">
          <div className="bg-blue-800 text-white p-3 mb-6 rounded-lg">
            <h2 className="text-2xl font-bold">01 Executive Summary</h2>
            <button
              onClick={handlePdfDownload}
              className="flex place-items-end bg-blue-600 text-white px-4 py-2 rounded-2xl"
            >
              Download as PDF!
            </button>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <p>Organization: {data.reportMetadata.organizationName}</p>
            <p>Report Period: {data.reportMetadata.reportPeriod}</p>
            <p>Generated on: {data.reportMetadata.reportDate}</p>
          </div>
        </div>
      </div>

      {/* Section Overview */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h1 className="text-lg text-gray-600 font-bold mb-4">Overview</h1>
        <p className="text-gray-600">
          Based on our comprehensive cloud maturity assessment, Cloudy Ltd has
          achieved an Intermediate (3.8/5) maturity level in cloud computing
          with strong fundamentals in place for further optimization.
        </p>
      </div>

      {/* Key metrics section */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h3 className="text-lg font-bold mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border p-3 rounded-lg text-center">
            <div className="text-gray-600 text-sm">Total Cloud Spend</div>
            <div className="text-xl font-bold">
              {formatCurrency(data.executiveSummary.cloudSpend.total)}
            </div>
          </div>
          <div className="border p-3 rounded-lg text-center">
            <div className="text-gray-600 text-sm">Reduction Potential</div>
            <div className="text-xl font-bold">
              {formatPercentage(
                data.executiveSummary.cloudSpend.reductionPotential
              )}
            </div>
          </div>
          <div className="border p-3 rounded-lg text-center">
            <div className="text-gray-600 text-sm">Annual Savings</div>
            <div className="text-xl font-bold">
              {formatCurrency(
                data.executiveSummary.cloudSpend.annualSavingsOpportunity
              )}
            </div>
          </div>
          <div className="border p-3 rounded-lg text-center">
            <div className="text-gray-600 text-sm">Maturity Score</div>
            <div className="text-xl font-bold">{data.cloudMaturityScore}/5</div>
          </div>
        </div>
      </div>

      {/* Charts grid - using a 2-column layout on medium screens and up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Pie chart section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Cloud Spend Distribution</h3>
          {/* ResponsiveContainer makes the chart responsive to its parent's size */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              {/* The Pie component represents our pie chart */}
              <Pie
                data={data.executiveSummary.cloudSpend.byService}
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
                {data.executiveSummary.cloudSpend.byService.map(
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
            {formatCurrency(data.executiveSummary.cloudSpend.total)}
          </div>
        </div>

        {/* Line chart section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">
            Monthly Cloud Spend Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data.executiveSummary.monthlyTrend}
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

      {/* Challenges and Recommendations grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
        {/* Challenges section */}
        <div className="bg-white p-4 rounded-lg border-4 border-gray-300 shadow">
          <h3 className="text-lg font-bold mb-4">Challenges</h3>
          <ul className="list-disc pl-5 space-y-2">
            {/* Map through the challenges array to create list items */}
            {data.executiveSummary.challenges.map((challenge, index) => (
              <li key={`challenge-${index}`}>{challenge}</li>
            ))}
          </ul>
        </div>

        {/* Recommendations section */}
        <div className="bg-white p-4 rounded-lg border-4 border-gray-300  shadow">
          <h3 className="text-lg font-bold mb-4">Recommendations</h3>
          <ul className="list-disc pl-5 space-y-2">
            {/* Map through the recommendations array to create list items */}
            {data.executiveSummary.recommendations.map(
              (recommendation, index) => (
                <li key={`recommendation-${index}`}>{recommendation}</li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Export the component so it can be imported elsewhere
export default ExecutiveSummaryExample
