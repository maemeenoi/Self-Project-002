// Updated /api/clients/route.js
import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Updated to include new client fields
    const clients = await query(`
      SELECT ClientID, ClientName, OrganizationName, ContactEmail, 
             ContactPhone, IndustryType, CompanySize, LastLoginDate
      FROM Client
    `)
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
