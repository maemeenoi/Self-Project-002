import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request) {
  try {
    const { pdfData, clientData } = await request.json()

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Convert base64 PDF data to buffer
    const pdfBuffer = Buffer.from(pdfData.split(",")[1], "base64")

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: clientData.email,
      subject: "Your Assessment Report",
      text: "Please find your assessment report attached.",
      attachments: [
        {
          filename: "assessment-report.pdf",
          content: pdfBuffer,
        },
      ],
    })

    return NextResponse.json({ message: "Report sent successfully" })
  } catch (error) {
    console.error("Error sending report:", error)
    return NextResponse.json(
      { message: "Failed to send report" },
      { status: 500 }
    )
  }
}
