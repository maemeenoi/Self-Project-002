import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Forward to backend authentication API
    console.log("Trying to login with:", email)
    const backendResponse = await fetch(
      "https://app-makestuffgo-test-001-backend.azurewebsites.net/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    )

    console.log("Backend response status:", backendResponse.status)
    const backendData = await backendResponse.json()
    console.log("Backend response:", backendData)

    if (backendData.success) {
      // Transform backend response to frontend format
      console.log("Backend roles:", backendData.user.roles)
      console.log("Is Super Admin:", backendData.user.is_super_admin)

      // Generate JWT token
      const tokenPayload = {
        userId: backendData.user.user_id,
        email: backendData.user.email,
        roles: backendData.user.roles,
        organizationId: backendData.user.company_id || "superadmin",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      }

      const token = jwt.sign(tokenPayload, JWT_SECRET)

      // Helper function to convert role names to frontend format
      const convertRoleName = (roleName: string): string => {
        const roleMap: { [key: string]: string } = {
          SuperAdmin: "superadmin",
          "Client Admin": "clientadmin",
          CEO: "ceo",
          CTO: "cto",
          CFO: "cfo",
          "Product Owner": "productowner",
          Engineer: "engineer",
        }
        return roleMap[roleName] || roleName.toLowerCase().replace(/\s+/g, "")
      }

      const userResponse = {
        success: true,
        message: "Login successful",
        token: token,
        user: {
          id: backendData.user.user_id.toString(),
          email: backendData.user.email,
          firstName: backendData.user.first_name,
          middleName: backendData.user.middle_name,
          lastName: backendData.user.last_name,
          roles: backendData.user.roles.map((roleName: string) => ({
            name: convertRoleName(roleName),
            permissions:
              roleName === "SuperAdmin"
                ? [{ resource: "*", actions: ["*"] }]
                : [{ resource: "dashboard", actions: ["read"] }],
          })),
        },
        organization: {
          id: backendData.user.company_id?.toString() || "superadmin",
          name: backendData.user.company_name || "makeStuffGo Super Admin",
          features: backendData.user.is_super_admin
            ? ["superAdmin"]
            : ["clientAdmin"],
        },
        redirect_url: backendData.redirect_url,
      }

      console.log("Transformed user response:", userResponse)
      return NextResponse.json(userResponse)
    } else {
      return NextResponse.json(
        {
          success: false,
          message: backendData.detail || "Invalid credentials",
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "Authentication service unavailable" },
      { status: 500 }
    )
  }
}
