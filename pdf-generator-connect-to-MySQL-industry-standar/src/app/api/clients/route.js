// src/app/api/clients/route.js
import { NextResponse } from "next/server"
import { query } from "../../../lib/db"

export async function GET() {
  try {
    const clients = await query("SELECT * FROM Clients")
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
