import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

interface JWTPayload {
  sub: string
  company_id: number
  exp: number
}

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Decode JWT to get company_id (we don't verify here since backend will verify)
    let company_id: number
    try {
      const decoded = jwt.decode(token) as JWTPayload
      company_id = decoded.company_id
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Fetch stats from backend with company_id filter
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      // process.env.NEXT_PUBLIC_BACKEND_URL ||
      // "https://app-makestuffgo-test-001-backend.azurewebsites.net"

    const [usersResponse, integrationsResponse, activitiesResponse] =
      await Promise.allSettled([
        fetch(
          `${backendUrl}/api/admin/users?company_id=${company_id}&limit=1000`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        ),
        // Placeholder for integrations endpoint
        Promise.resolve({ ok: true, json: async () => ({ total: 0 }) }),
        // Placeholder for activities endpoint
        Promise.resolve({ ok: true, json: async () => ({ total: 0 }) }),
      ])

    // Process users data
    let totalUsers = 0
    let activeUsers = 0

    if (usersResponse.status === "fulfilled" && usersResponse.value.ok) {
      const users = await usersResponse.value.json()
      totalUsers = users.length
      activeUsers = users.filter((user: any) => user.is_active).length
    }

    // Process other stats (placeholder values for now)
    let connectedIntegrations = 0
    let recentActivities = 0

    if (
      integrationsResponse.status === "fulfilled" &&
      integrationsResponse.value.ok
    ) {
      const integrations = await integrationsResponse.value.json()
      connectedIntegrations = integrations.total || 0
    }

    if (
      activitiesResponse.status === "fulfilled" &&
      activitiesResponse.value.ok
    ) {
      const activities = await activitiesResponse.value.json()
      recentActivities = activities.total || 0
    }

    return NextResponse.json({
      totalUsers,
      activeUsers,
      connectedIntegrations,
      recentActivities,
      developmentTimeSaved: "80%", // Static for now
      enterpriseServices: connectedIntegrations, // Using integrations count for now
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
