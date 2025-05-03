// components/GaugeMeter.jsx
// can try svg match 1 - 5 in each image
import { useRef, useEffect } from "react"
import * as d3 from "d3"

// Helper function to get maturity level label
const getMatureityLabel = (score) => {
  if (score < 2) return "Level 1: Initial"
  if (score < 3) return "Level 2: Repeatable"
  if (score < 4) return "Level 3: Defined"
  if (score < 4.6) return "Level 4: Managed"
  return "Level 5: Optimized"
}

// Conversion functions
function percToRad(perc) {
  return degToRad(perc * 360)
}

function degToRad(deg) {
  return (deg * Math.PI) / 180
}

const GaugeMeter = ({ value }) => {
  const ref = useRef()

  useEffect(() => {
    const percent = value / 5 // Normalize the value to a 0-1 range
    const width = 400
    const height = 220
    const barWidth = 50
    const numSections = 5
    const chartInset = 10
    const padRad = 0.05
    const radius = Math.min(width, height * 2) / 2

    d3.select(ref.current).selectAll("*").remove()

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)

    const chart = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height})`)

    // Define the gauge arc geometry
    // We're creating a half-circle (π radians)
    const startAngle = -Math.PI / 2 // Start at -90 degrees (top)
    const endAngle = Math.PI / 2 // End at 90 degrees (bottom)

    // Create background sections
    const sectionWidth = Math.PI / numSections
    const colors = ["#900C3F", "#C70039", "#FF5733", "#FFC300", "#DAF7A6"]

    for (let i = 0; i < numSections; i++) {
      const sectionStart = startAngle + i * sectionWidth
      const sectionEnd = sectionStart + sectionWidth

      const arc = d3
        .arc()
        .innerRadius(radius - barWidth)
        .outerRadius(radius)
        .startAngle(sectionStart)
        .endAngle(sectionEnd)

      chart.append("path").attr("d", arc).attr("fill", colors[i])
    }

    // Add value labels
    for (let i = 0; i <= numSections; i++) {
      const labelAngle = startAngle + i * sectionWidth
      const labelRadius = radius + 15

      const labelX = Math.cos(labelAngle) * (radius - barWidth / 2)
      const labelY = Math.sin(labelAngle) * (radius - barWidth / 2)

      chart
        .append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("dy", "0.3em")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#333")
        .text(i + 1)
    }

    // Draw the needle
    const needleLength = radius - chartInset
    const needleRadius = 5

    // Calculate the angle for the needle based on value (0-5 range)
    // Map the 0-5 range to the startAngle-endAngle range
    const needleAngle = startAngle + percent * Math.PI

    const needleX = Math.cos(needleAngle) * needleLength
    const needleY = Math.sin(needleAngle) * needleLength

    // Draw needle circle base
    chart
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", needleRadius)
      .attr("fill", "#333")

    // Draw the needle line
    chart
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", needleX)
      .attr("y2", needleY)
      .attr("stroke", "#333")
      .attr("stroke-width", 3)

    // Add the value text
    chart
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", -radius / 2)
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .attr("fill", "#333")
      .text(`${value.toFixed(1)}/5.0`)
  }, [value])

  return (
    <div className="flex flex-col items-center">
      <div ref={ref}></div>
      <div className="mt-4 text-lg font-semibold text-center">
        Maturity Level: {getMatureityLabel(value)}
      </div>
    </div>
  )
}

export default GaugeMeter
