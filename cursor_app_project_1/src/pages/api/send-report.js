import nodemailer from "nodemailer"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { pdfData, clientData } = req.body

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

    res.status(200).json({ message: "Report sent successfully" })
  } catch (error) {
    console.error("Error sending report:", error)
    res.status(500).json({ message: "Failed to send report" })
  }
}
