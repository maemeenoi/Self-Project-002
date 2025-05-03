// src/app/api/questionnaire-options/route.js
import { NextResponse } from "next/server"
import { query } from "../../../lib/db"

export async function GET(request) {
  try {
    // Get question ID from the query string if needed
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get("questionId")

    let sql = "SELECT * FROM IndustryStandards"
    let params = []

    // If a specific question ID is requested
    if (questionId) {
      sql += " WHERE QuestionID = ?"
      params.push(questionId)
    }

    // Order by QuestionID and Score for consistent results
    sql += " ORDER BY QuestionID, Score"

    const options = await query(sql, params)

    // Format the options for easier consumption by the frontend
    const formattedOptions = {}

    options.forEach((option) => {
      if (!formattedOptions[option.QuestionID]) {
        formattedOptions[option.QuestionID] = []
      }

      formattedOptions[option.QuestionID].push({
        score: option.Score,
        text: option.StandardText,
      })
    })

    return NextResponse.json(formattedOptions)
  } catch (error) {
    console.error("Error fetching questionnaire options:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
