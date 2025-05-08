// src/app/api/questions/route.js
import { NextResponse } from "next/server"
import { query } from "../../../lib/db"

export async function GET() {
  try {
    // First, get all the distinct questions with their categories
    const distinctQuestions = await query(`
      SELECT DISTINCT QuestionID, QuestionText, Category 
      FROM Questions 
      ORDER BY QuestionID
    `)

    if (!distinctQuestions || distinctQuestions.length === 0) {
      console.warn("No questions found in the database")
      return NextResponse.json({})
    }

    // Group questions by category
    const questionsByCategory = {}

    distinctQuestions.forEach((question) => {
      const category = question.Category || "Uncategorized"

      if (!questionsByCategory[category]) {
        questionsByCategory[category] = []
      }

      // Add the question to its category
      questionsByCategory[category].push({
        QuestionID: question.QuestionID,
        QuestionText: question.QuestionText,
        Category: question.Category,
      })
    })

    console.log(
      `Found ${distinctQuestions.length} questions across ${
        Object.keys(questionsByCategory).length
      } categories`
    )

    return NextResponse.json(questionsByCategory)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
