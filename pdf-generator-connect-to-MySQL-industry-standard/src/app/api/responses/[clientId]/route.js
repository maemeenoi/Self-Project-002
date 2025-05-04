// src/app/api/responses/[clientId]/route.js
import { NextResponse } from "next/server"
import { query } from "../../../../lib/db"

export async function GET(request, context) {
  try {
    // Correctly extract the clientId parameter
    const clientId = context.params.clientId

    // First fetch the client information
    const clientInfo = await query(
      "SELECT ClientID, ClientName, ContactName, ContactEmail, CompanySize, IndustryType FROM Clients WHERE ClientID = ?",
      [clientId]
    )

    // Then fetch the responses
    const responses = await query(
      "SELECT * FROM Responses WHERE ClientID = ?",
      [clientId]
    )

    // Log for debugging
    console.log("Enhanced responses prepared:", {
      responseCount: responses.length,
      clientInfo: clientInfo.length > 0 ? clientInfo[0] : null,
    })

    // Return combined data
    return NextResponse.json({
      responses: responses,
      clientInfo: clientInfo.length > 0 ? clientInfo[0] : null,
    })
  } catch (error) {
    console.error("Error fetching responses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
