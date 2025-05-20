// src/app/api/responses/[clientId]/route.js
import { NextResponse } from "next/server"
import { query } from "../../../../lib/db"

export async function GET(request, { params }) {
  try {
    const { clientId } = await params
    console.log("Fetching responses for client ID:", clientId)

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      )
    }

    // First get the client info - using query instead of directQuery to handle parameters
    console.log("Fetching client info...")
    const clientResults = await query(
      `SELECT ClientID, ClientName, OrganizationName, ContactEmail, CompanySize, IndustryType
       FROM Client WHERE ClientID = ?`,
      [clientId]
    )

    console.log("Client query result:", clientResults)

    if (clientResults.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const clientInfo = clientResults[0]
    console.log("Client info:", clientInfo)

    // Then get their responses
    console.log("Fetching responses...")

    // First check if there are any responses at all
    const responseCount = await query(
      `SELECT COUNT(*) as count FROM Response WHERE ClientID = ?`,
      [clientId]
    )

    console.log("Response count:", responseCount[0].count)

    if (responseCount[0].count === 0) {
      return NextResponse.json({
        clientInfo,
        responses: [],
      })
    }

    // Now fetch the actual responses with a join to Question
    const responseResults = await query(
      `SELECT r.ResponseID, r.ClientID, r.QuestionID, r.ResponseText, r.Score, r.ResponseDate,
              q.QuestionText, q.Category, q.StandardText
       FROM Response r
       LEFT JOIN Question q ON r.QuestionID = q.QuestionID
       WHERE r.ClientID = ?
       ORDER BY r.QuestionID`,
      [clientId]
    )

    console.log(
      `Found ${responseResults.length} responses for client ${clientId}`
    )

    // Return both client info and their responses
    return NextResponse.json({
      clientInfo,
      responses: responseResults,
    })
  } catch (error) {
    console.error("Error fetching responses:", error)
    return NextResponse.json(
      { error: "Failed to fetch responses", details: error.message },
      { status: 500 }
    )
  }
}
