import { adminDb } from "@/firebaseAdmin"
import { NextResponse } from "next/server"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    const userDoc = await adminDb.collection("users").doc(email).get()
    return NextResponse.json({ exists: userDoc.exists })
  } catch (error) {
    console.error("Error checking user profile:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
