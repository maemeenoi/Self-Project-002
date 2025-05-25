// src/app/api/questionnaire-options/route.js - AZURE SQL VERSION
import { NextResponse } from "next/server"
import { directQuery } from "@/lib/db"

export async function GET(request) {
  try {
    // First, let's check which database we're actually connected to
    console.log("Testing database connection...")

    // Get database name and connection info
    const connInfo = await directQuery(
      "SELECT DB_NAME() AS db, SYSTEM_USER AS [user]"
    )
    console.log("Connected to database:", connInfo[0])

    // Check table structure
    console.log("Checking table structure...")
    const tableStructure = await directQuery(`
      SELECT COLUMN_NAME AS Field, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Question'
      ORDER BY ORDINAL_POSITION
    `)
    console.log(
      "Table columns:",
      tableStructure.map((col) => col.Field)
    )

    // Now try to get the data
    console.log("Attempting to get question options...")
    const results = await directQuery(`
      SELECT * 
      FROM Question 
      WHERE Score IS NOT NULL
      ORDER BY QuestionID, Score
    `)

    console.log(`Retrieved ${results.length} options from the database`)

    if (results.length > 0) {
      console.log("Sample row with keys:", Object.keys(results[0]))
      console.log("Sample row values:", results[0])
    }

    // Format options for the frontend
    const formattedOptions = {}

    results.forEach((row) => {
      // Determine the actual column names from the results
      const keys = Object.keys(row)
      const qidCol =
        keys.find((k) => k.toLowerCase().includes("questionid")) || "QuestionID"
      const scoreCol =
        keys.find((k) => k.toLowerCase().includes("score")) || "Score"
      const textCol =
        keys.find((k) => k.toLowerCase().includes("standard")) ||
        keys.find((k) => k.toLowerCase().includes("text")) ||
        "StandardText"

      const qid = row[qidCol]
      const score = row[scoreCol]
      const text = row[textCol]

      // Skip if missing critical data
      if (qid === undefined || score === undefined) return

      // Initialize array for this QuestionID if it doesn't exist
      if (!formattedOptions[qid]) {
        formattedOptions[qid] = []
      }

      // Add this option to the array
      formattedOptions[qid].push({
        id: `${qid}_${score}`, // Create a unique ID
        score: score,
        text: text || `Level ${score}`, // Fallback text if missing
      })
    })

    return NextResponse.json(formattedOptions)
  } catch (error) {
    console.error("Error fetching questionnaire options:", error)

    // Return detailed error information for debugging
    return NextResponse.json(
      {
        error: "Database query failed",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState,
        sql: error.sql,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
