import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Redirect to backend integration status instead of calling local APIs
    const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL
    // Forward authentication headers from the original request
    const authHeader = request.headers.get("authorization")
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    // Fetch integration status from backend with authentication
    const statusResponse = await fetch(
      `${backendUrl}/api/integrations/status`,
      {
        headers,
      }
    )

    if (!statusResponse.ok) {
      throw new Error(`Backend responded with status ${statusResponse.status}`)
    }

    const backendStatus = await statusResponse.json()

    // Transform backend response to match frontend expectations
    const integrationData = {
      jira: {
        status: backendStatus.find((s: any) => s.integration_type === "jira")
          ?.configured
          ? "connected"
          : "error",
        data: null, // Data will be loaded on-demand, not automatically
        error:
          backendStatus.find((s: any) => s.integration_type === "jira")
            ?.error_message || null,
      },
      github: {
        status: backendStatus.find((s: any) => s.integration_type === "github")
          ?.configured
          ? "connected"
          : "error",
        data: null, // Data will be loaded on-demand, not automatically
        error:
          backendStatus.find((s: any) => s.integration_type === "github")
            ?.error_message || null,
      },
    }

    console.log("Integration status from backend:", {
      jira: integrationData.jira.status,
      github: integrationData.github.status,
    })

    return NextResponse.json(integrationData)
  } catch (error) {
    console.error("Error fetching integration status from backend:", error)

    // Return default status when backend is unavailable
    const defaultData = {
      jira: {
        status: "error",
        data: null,
        error: "Backend unavailable - configure integrations to connect",
      },
      github: {
        status: "error",
        data: null,
        error: "Backend unavailable - configure integrations to connect",
      },
    }

    return NextResponse.json(defaultData)
  }
}
