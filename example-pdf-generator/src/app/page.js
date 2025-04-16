"use client"
import React, { useState, useRef } from "react"
import html2canvas from "html2canvas"
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  PolarGrid,
  PolarAngleAxis,
} from "recharts"

// Styles for the PDF layout
const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontSize: 12,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    position: "relative",
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  section: {
    marginBottom: 25,
  },
  heading: {
    fontSize: 14,
    marginBottom: 8,
    textTransform: "uppercase",
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    paddingBottom: 4,
  },
  text: {
    marginBottom: 5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "gray",
  },
})

// Dummy data for the report
const sampleData = {
  intro:
    "This is a developer experience report based on the latest form responses. It highlights key challenges, usage stats, and recommended improvements to enhance developer workflows and reduce overhead.",
  toolsStat:
    "Developers use an average of 14 tools and 97% report frequent context switching. 59% spend a week or more building internal tooling. It takes 100 days to onboard due to tool complexity.",
  slowProcesses:
    "60% of organizations still release monthly or quarterly. 67% of developers wait over a week for code reviews. 44% say end-to-end testing is slow, and 42% feel deployments are inefficient.",
  toil: "42% of developers can't release code without risk. 39% experience deployment failures at least half the time. Manual toil increases overtime and delays innovation. 67% still perform manual rollbacks.",
  conclusion:
    "Consolidating tools and adopting platform-based delivery enables better collaboration, faster releases, and less burnout. A shared DevOps vision across the org can reduce friction and improve outcomes.",
}

const AreaChartPlot = () => {
  const data = [
    { year: "2016", Iphone: 4000, Samsung: 2400 },
    { year: "2017", Iphone: 3000, Samsung: 1398 },
    { year: "2018", Iphone: 2000, Samsung: 9800 },
    { year: "2019", Iphone: 2780, Samsung: 3908 },
    { year: "2020", Iphone: 1890, Samsung: 4800 },
    { year: "2021", Iphone: 2390, Samsung: 3800 },
    { year: "2022", Iphone: 3490, Samsung: 4300 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorIphone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorSamsung" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="Iphone"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorIphone)"
        />
        <Area
          type="monotone"
          dataKey="Samsung"
          stroke="#82ca9d"
          fillOpacity={1}
          fill="url(#colorSamsung)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const ChartCaptureWrapper = ({ onCapture }) => {
  const chartRef = useRef()

  const handleCapture = async () => {
    const canvas = await html2canvas(chartRef.current)
    const image = canvas.toDataURL("image/png")
    onCapture(image)
  }

  return (
    <>
      <div ref={chartRef} style={{ width: 600, height: 300 }}>
        <AreaChartPlot />
      </div>
      <button
        onClick={handleCapture}
        style={{
          margin: "1rem",
          padding: "0.5rem 1rem",
          background: "#333",
          color: "#fff",
        }}
      >
        Capture Chart for PDF
      </button>
    </>
  )
}

const BarChartPlot = () => {
  const data = [
    { name: "Jan", high: 4000, low: 2400 },
    { name: "Feb", high: 5000, low: 1500 },
    { name: "Mar", high: 6000, low: 3000 },
    { name: "Apr", high: 6500, low: 4500 },
    { name: "May", high: 7000, low: 2200 },
    { name: "Jun", high: 8000, low: 3500 },
    { name: "Jul", high: 7400, low: 5500 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="high" fill="#82ca9d" />
        <Bar dataKey="low" fill="#FA8072" />
      </BarChart>
    </ResponsiveContainer>
  )
}

const PieChartPlot = () => {
  const data = [
    { name: "Twitter", value: 200400 },
    { name: "Facebook", value: 205000 },
    { name: "Instagram", value: 23400 },
    { name: "Snapchat", value: 20000 },
    { name: "LinkedIn", value: 29078 },
    { name: "YouTube", value: 18900 },
  ]
  const colors = [
    "#8884d8",
    "#FA8072",
    "#AF69EE",
    "#3DED97",
    "#3AC7EB",
    "#F9A603",
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

const LineChartPlot = () => {
  const data = [
    { month: "Jan", paid: 5000, organic: 4230 },
    { month: "Feb", paid: 7800, organic: 2900 },
    { month: "Mar", paid: 4700, organic: 2400 },
    { month: "Apr", paid: 9000, organic: 2600 },
    { month: "May", paid: 7000, organic: 3210 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="paid" stroke="#8884d8" strokeWidth={2} />
        <Line
          type="monotone"
          dataKey="organic"
          stroke="#82ca9d"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

const RadarChartPlot = () => {
  const data = [
    { day: "Monday", amount: 500 },
    { day: "Tuesday", amount: 300 },
    { day: "Wednesday", amount: 240 },
    { day: "Thursday", amount: 230 },
    { day: "Friday", amount: 150 },
    { day: "Saturday", amount: 300 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart outerRadius={90} data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="day" />
        <Radar
          name="Orders"
          dataKey="amount"
          stroke="#82ca9d"
          fill="#82ca9d"
          fillOpacity={0.6}
        />
        <Legend />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  )
}

const Charts = () => {
  return (
    <>
      <section className="flex my-4 px-4 gap-3">
        <div className="w-1/2 h-[300px] bg-white rounded p-2 shadow">
          <AreaChartPlot />
        </div>
        <div className="w-1/2 h-[300px] bg-white rounded p-2 shadow">
          <BarChartPlot />
        </div>
      </section>

      <section className="flex my-4 px-4 gap-3">
        <div className="w-1/3 h-[250px] bg-white rounded p-2 shadow">
          <PieChartPlot />
        </div>
        <div className="w-1/3 h-[250px] bg-white rounded p-2 shadow">
          <LineChartPlot />
        </div>
        <div className="w-1/3 h-[250px] bg-white rounded p-2 shadow">
          <RadarChartPlot />
        </div>
      </section>
    </>
  )
}

// PDF document structure
const MyReport = ({ data, imageData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Developer Experience Report 2024</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>Introduction</Text>
        <Text style={styles.text}>{data.intro}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Tool Usage & Overload</Text>
        <Text style={styles.text}>{data.toolsStat}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Slow Processes & Delays</Text>
        <Text style={styles.text}>{data.slowProcesses}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Developer Toil & Burnout</Text>
        <Text style={styles.text}>{data.toil}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Conclusion & Recommendation</Text>
        <Text style={styles.text}>{data.conclusion}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Chart Insights</Text>
        <Text style={styles.text}>
          The following sections provide a breakdown of visual insights based on
          reported data.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Captured Area Chart</Text>
        {imageData && (
          <Image src={imageData} style={{ width: 400, height: 200 }} />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Area Chart: iPhone vs Samsung Sales</Text>
        <Text style={styles.text}>
          This chart visualizes annual sales trends between iPhone and Samsung
          devices from 2016 to 2022. It helps understand market competition and
          growth over the years.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Bar Chart: Monthly Highs and Lows</Text>
        <Text style={styles.text}>
          This bar chart shows the comparison between high and low values
          recorded each month, useful for identifying variance and performance
          swings.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Pie Chart: Platform Distribution</Text>
        <Text style={styles.text}>
          The pie chart illustrates the relative usage distribution among
          popular platforms such as Twitter, Facebook, Instagram, and others.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Line Chart: Paid vs Organic Growth</Text>
        <Text style={styles.text}>
          This line chart compares paid versus organic engagement or reach
          across months. It's useful for visualizing the return on investment in
          campaigns.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Radar Chart: Weekly Order Patterns</Text>
        <Text style={styles.text}>
          The radar chart represents the number of orders placed on each
          weekday, giving a quick glance at peak and off-peak order days.
        </Text>
      </View>

      <Text style={styles.footer} fixed>
        {({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      </Text>
    </Page>
  </Document>
)

// Page with download button
export default function DownloadPDFPage() {
  const [imageData, setImageData] = useState(null)

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Generate Developer Experience Report</h1>
      <ChartCaptureWrapper onCapture={setImageData} />
      <PDFDownloadLink
        document={<MyReport data={sampleData} imageData={imageData} />}
        fileName="developer_experience_2024.pdf"
      >
        {({ loading }) =>
          loading ? "Generating PDF..." : "Download Report PDF"
        }
      </PDFDownloadLink>
    </div>
  )
}
