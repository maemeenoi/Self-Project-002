import { NextRequest, NextResponse } from "next/server"


export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.API_URL || "http://localhost:8000";
      // "https://app-makestuffgo-test-001-backend.azurewebsites.net"

    // Get JWT token from request headers (forwarded from client)
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      )
    }

    // Forward the JWT token to the backend
    const response = await fetch(
      `${backendUrl}/api/widgets/workflow/recent-activity`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json({
        recentActivity: [],
        summary: {
          totalActivities: 0,
          githubActivities: 0,
          jiraActivities: 0,
          successRate: 0,
        },
      })
    }

    const activityData = await response.json()

    const recentActivity = activityData.map((item: any) => ({
      id: `${item.provider}-${Date.now()}-${Math.random()}`,
      timestamp: item.created_at,
      user: item.author,
      action: `${item.item_type} ${item.status}`,
      service: item.provider === "github" ? "GitHub" : "Jira",
      status:
        item.status === "done" || item.status === "closed"
          ? "Success"
          : "Warning",
      device: "Web",
      ipAddress: "192.168.1.1",
      details: `${item.title} in ${item.project_or_repo}`,
    }))

    const summary = {
      totalActivities: recentActivity.length,
      githubActivities: recentActivity.filter(
        (a: any) => a.service === "GitHub"
      ).length,
      jiraActivities: recentActivity.filter((a: any) => a.service === "Jira")
        .length,
      successRate:
        recentActivity.length > 0
          ? (recentActivity.filter((a: any) => a.status === "Success").length /
              recentActivity.length) *
            100
          : 0,
    }

    return NextResponse.json({ recentActivity, summary })
  } catch (error) {
    console.error("Error fetching activity from backend:", error)
    return NextResponse.json({
      recentActivity: [],
      summary: {
        totalActivities: 0,
        githubActivities: 0,
        jiraActivities: 0,
        successRate: 0,
      },
    })
  }
}
