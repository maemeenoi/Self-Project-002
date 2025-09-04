import express from "express"
import cors from "cors"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
)

app.use(express.json())

// Mock data for testing
const mockUsers = [
  {
    id: 1,
    name: "Demo User",
    email: "demo@finops.com",
    password: "password123", // In real app, this would be hashed
    role: "user",
  },
]

const mockCostData = {
  summary: {
    totalCost: 125430.5,
    monthlyGrowth: 8.2,
    servicesCount: 24,
  },
  topServices: [
    { name: "Azure Virtual Machines", cost: 45230.2, percentage: 36 },
    { name: "Azure Storage", cost: 23150.1, percentage: 18 },
    { name: "Azure SQL Database", cost: 18920.3, percentage: 15 },
    { name: "Azure App Service", cost: 12450.8, percentage: 10 },
    { name: "Azure Kubernetes Service", cost: 9875.4, percentage: 8 },
    { name: "Other Services", cost: 15803.7, percentage: 13 },
  ],
  monthlyTrends: [
    { month: "Jan", year: 2024, total_cost: 98500 },
    { month: "Feb", year: 2024, total_cost: 102300 },
    { month: "Mar", year: 2024, total_cost: 108900 },
    { month: "Apr", year: 2024, total_cost: 115600 },
    { month: "May", year: 2024, total_cost: 121200 },
    { month: "Jun", year: 2024, total_cost: 125430 },
  ],
  categories: [
    { category: "Compute", cost: 65000, percentage: 52 },
    { category: "Storage", cost: 28000, percentage: 22 },
    { category: "Database", cost: 20000, percentage: 16 },
    { category: "Networking", cost: 8000, percentage: 6 },
    { category: "Other", cost: 4430, percentage: 4 },
  ],
}

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "FinOps Portal Backend",
  })
})

// Simple auth routes (for demo only - not secure!)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body

  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  )

  if (user) {
    res.json({
      success: true,
      token: "demo-jwt-token", // In real app, generate actual JWT
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    })
  }
})

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body

  // Check if user exists
  const existingUser = mockUsers.find((u) => u.email === email)
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    })
  }

  // Create new user
  const newUser = {
    id: mockUsers.length + 1,
    name,
    email,
    password, // In real app, hash this
    role: "user",
  }

  mockUsers.push(newUser)

  res.status(201).json({
    success: true,
    token: "demo-jwt-token",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  })
})

// Dashboard data routes
app.get("/api/dashboard/summary", (req, res) => {
  res.json({
    success: true,
    data: mockCostData.summary,
  })
})

app.get("/api/dashboard/top-services", (req, res) => {
  res.json({
    success: true,
    data: mockCostData.topServices,
  })
})

app.get("/api/dashboard/trends", (req, res) => {
  res.json({
    success: true,
    data: mockCostData.monthlyTrends,
  })
})

app.get("/api/dashboard/categories", (req, res) => {
  res.json({
    success: true,
    data: mockCostData.categories,
  })
})

// Upload endpoint (mock)
app.post("/api/upload/cost-data", (req, res) => {
  // Mock file upload processing
  setTimeout(() => {
    res.json({
      success: true,
      message: "File uploaded successfully",
      uploadId: Math.random().toString(36).substr(2, 9),
      recordsProcessed: Math.floor(Math.random() * 1000) + 100,
    })
  }, 1000)
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FinOps Portal Backend running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(
    `🌐 CORS enabled for: ${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }`
  )
})

export default app
