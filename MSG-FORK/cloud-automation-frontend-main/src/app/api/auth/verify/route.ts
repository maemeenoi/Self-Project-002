import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "No token provided",
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any

      // Return user data from JWT token
      const user = {
        id: decoded.userId?.toString(),
        email: decoded.email,
        roles:
          decoded.roles?.map((roleName: string) => ({
            name: roleName.toLowerCase().replace(" ", ""), // Convert "Super Admin" to "superadmin"
            permissions:
              roleName === "Super Admin"
                ? [{ resource: "*", actions: ["*"] }]
                : [{ resource: "dashboard", actions: ["read"] }],
          })) || [],
      }

      const organization = {
        id: decoded.organizationId?.toString() || "superadmin",
        name: decoded.organizationId
          ? "Client Organization"
          : "makeStuffGo Super Admin",
        features: decoded.roles?.includes("Super Admin")
          ? ["superAdmin"]
          : ["clientAdmin"],
      }

      return NextResponse.json({
        success: true,
        user: user,
        organization: organization,
      })
    } catch (jwtError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    )
  }
}
