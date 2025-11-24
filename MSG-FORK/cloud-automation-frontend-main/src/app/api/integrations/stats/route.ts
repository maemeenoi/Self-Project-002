import { NextRequest, NextResponse } from "next/server"


const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  // process.env.NEXT_PUBLIC_BACKEND_URL ||
  // "https://app-makestuffgo-test-001-backend.azurewebsites.net"

export async function GET(request: NextRequest) {
  try {
    console.log("Proxying integrations stats request to backend...")

    // Get JWT token from request headers (forwarded from client)
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      )
    }

    // Proxy the request to the FastAPI backend
    const response = await fetch(
      `${NEXT_PUBLIC_BACKEND_URL}/api/integrations/status`,
      {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      console.error(
        `Backend returned ${response.status}: ${response.statusText}`
      )
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("Successfully fetched integration stats:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying to backend:", error)
    return NextResponse.json(
      { error: "Failed to fetch integration stats from backend" },
      { status: 500 }
    )
  }
}
