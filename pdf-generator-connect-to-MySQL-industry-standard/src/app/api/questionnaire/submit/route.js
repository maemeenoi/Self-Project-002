// src/app/api/questionnaire/submit/route.js
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "../../../../lib/db"

export async function POST(request) {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Parse the session data
    const session = JSON.parse(sessionCookie.value)
    const clientId = session.clientId

    if (!clientId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Get the submitted answers
    const { answers } = await request.json()

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "No answers provided" },
        { status: 400 }
      )
    }

    // Insert responses into the database
    const insertPromises = answers.map(async (answer) => {
      const { questionId, score, text } = answer

      // Validate the answer
      if (!questionId) {
        throw new Error("Question ID is required for all answers")
      }

      // Check if a response already exists
      const existingResponses = await query(
        "SELECT * FROM Responses WHERE ClientID = ? AND QuestionID = ?",
        [clientId, questionId]
      )

      if (existingResponses.length > 0) {
        // Update existing response
        await query(
          "UPDATE Responses SET ResponseText = ?, Score = ?, ResponseDate = NOW() WHERE ClientID = ? AND QuestionID = ?",
          [text || null, score || null, clientId, questionId]
        )
      } else {
        // Insert new response
        await query(
          "INSERT INTO Responses (ClientID, QuestionID, ResponseText, Score, ResponseDate) VALUES (?, ?, ?, ?, NOW())",
          [clientId, questionId, text || null, score || null]
        )
      }
    })

    // Extract client information from basic questions (1-5)
    const clientInfoAnswers = answers.filter(
      (a) => a.questionId >= 1 && a.questionId <= 5
    )

    if (clientInfoAnswers.length > 0) {
      // First, get the client data to check if we need to update it
      const clientData = await query(
        "SELECT * FROM Clients WHERE ClientID = ?",
        [clientId]
      )

      if (clientData && clientData.length > 0) {
        // Check which fields need updating
        const updates = []
        const params = []

        const nameAnswer = clientInfoAnswers.find((a) => a.questionId === 1)
        if (nameAnswer && nameAnswer.text) {
          updates.push("ClientName = ?")
          params.push(nameAnswer.text)
        }

        const businessAnswer = clientInfoAnswers.find((a) => a.questionId === 2)
        if (businessAnswer && businessAnswer.text) {
          updates.push("OrganizationName = ?")
          params.push(businessAnswer.text)
        }

        const emailAnswer = clientInfoAnswers.find((a) => a.questionId === 3)
        if (emailAnswer && emailAnswer.text) {
          updates.push("ContactEmail = ?")
          params.push(emailAnswer.text)
        }

        const sizeAnswer = clientInfoAnswers.find((a) => a.questionId === 4)
        if (sizeAnswer && sizeAnswer.text) {
          updates.push("Size = ?")
          params.push(sizeAnswer.text)
        }

        const industryAnswer = clientInfoAnswers.find((a) => a.questionId === 5)
        if (industryAnswer && industryAnswer.text) {
          updates.push("Industry = ?")
          params.push(industryAnswer.text)
        }

        // Only update if we have changes
        if (updates.length > 0) {
          params.push(clientId)

          await query(
            `UPDATE Clients SET ${updates.join(", ")} WHERE ClientID = ?`,
            params
          )

          console.log(
            "Updated client information based on questionnaire answers"
          )
        }
      }
    }

    // Wait for all inserts to complete
    await Promise.all(insertPromises)

    return NextResponse.json({
      success: true,
      message: "Questionnaire submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting questionnaire:", error)
    return NextResponse.json(
      { error: "Failed to submit questionnaire", details: error.message },
      { status: 500 }
    )
  }
}
