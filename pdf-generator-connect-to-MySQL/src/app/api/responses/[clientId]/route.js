// src/app/api/responses/[clientId]/route.js
import { NextResponse } from "next/server"
import { query } from "../../../../lib/db"

export async function GET(request, { params }) {
  const { clientId } = params

  try {
    const responses = await query(
      "SELECT * FROM Responses WHERE ClientID = ?",
      [clientId]
    )
    console.log(responses)
    console.log("Responses fetched successfully")
    return NextResponse.json(responses)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
