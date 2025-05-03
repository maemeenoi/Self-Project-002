import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { verify } from "jsonwebtoken"

// Middleware to verify JWT token
const authenticateRequest = (request) => {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided")
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key")
    return decoded
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export async function GET(request) {
  try {
    // Authenticate user
    const decoded = authenticateRequest(request)
    const clientId = decoded.clientId

    // Get latest responses for the client
    const [responses] = await pool.query(
      "SELECT * FROM responses WHERE client_id = ? ORDER BY created_at DESC LIMIT 1",
      [clientId]
    )

    if (responses.length === 0) {
      return NextResponse.json(
        { message: "No responses found" },
        { status: 404 }
      )
    }

    const response = responses[0]

    // Process the answers to calculate scores
    const answers = JSON.parse(response.answers)

    // Calculate dimensional scores
    const dimensionalScores = [
      calculateScore(answers, ["tech1", "tech2"]), // Technical
      calculateScore(answers, ["proc1", "proc2"]), // Process
      calculateScore(answers, ["people1", "people2"]), // People
      calculateScore(answers, ["tech1", "proc1"]), // Management
      calculateScore(answers, ["tech2", "proc2", "people1", "people2"]), // Strategy
    ]

    // Calculate category scores (example categories)
    const categoryScores = [
      calculateScore(answers, ["tech1"]), // Category 1
      calculateScore(answers, ["tech2"]), // Category 2
      calculateScore(answers, ["proc1"]), // Category 3
      calculateScore(answers, ["proc2"]), // Category 4
      calculateScore(answers, ["people1", "people2"]), // Category 5
    ]

    // Calculate overall score
    const overallScore = Math.round(
      dimensionalScores.reduce((sum, score) => sum + score, 0) /
        dimensionalScores.length
    )

    return NextResponse.json({
      dimensionalScores,
      categoryScores,
      overallScore,
    })
  } catch (error) {
    console.error("Error fetching responses:", error)

    if (
      error.message === "No token provided" ||
      error.message === "Invalid token"
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper function to calculate average score for a set of questions
function calculateScore(answers, questionIds) {
  const scores = questionIds.map((id) => answers[id] || 0)
  const sum = scores.reduce((acc, score) => acc + score, 0)
  return Math.round((sum / scores.length) * 20) // Convert 1-5 scale to 0-100
}
