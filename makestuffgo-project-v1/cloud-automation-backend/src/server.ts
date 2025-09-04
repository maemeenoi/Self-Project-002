import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import path from "path"

// Import routes
import authRoutes from "./routes/auth"
import uploadRoutes from "./routes/upload"
import dashboardRoutes from "./routes/dashboard"

// Import middleware
import { errorHandler } from "./middleware/errorHandler"
import { notFound } from "./middleware/notFound"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
)

// Logging middleware
app.use(morgan("combined"))

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/dashboard", dashboardRoutes)

// 404 handler
app.use(notFound)

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 FinOps Portal Backend API`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
})

export default app
