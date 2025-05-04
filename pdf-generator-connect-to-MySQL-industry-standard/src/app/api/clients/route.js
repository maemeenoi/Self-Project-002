// src/app/api/clients/[clientId]/route.js
import { NextResponse } from "next/server"
import { query } from "../../../../lib/db"

export async function GET(request, { params }) {
  const { clientId } = params

  try {
    // Fetch complete client information
    const clients = await query(
      "SELECT ClientID, ClientName, ContactEmail, ContactPhone, ContactName, IndustryType, CompanySize FROM Clients WHERE ClientID = ?",
      [clientId]
    )

    // Log for debugging
    console.log(`Client info for ID ${clientId}:`, clients)

    if (clients.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Return the first (and should be only) client record
    return NextResponse.json(clients[0])
  } catch (error) {
    console.error("Client fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
