// src/lib/emailUtils.js
import nodemailer from "nodemailer"

/**
 * Sends an email with a magic link
 * @param {string} email - Recipient email
 * @param {string} magicLink - The magic link URL
 * @returns {Promise<Object>} Status and any error message
 */
export async function sendMagicLinkEmail(email, magicLink) {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Email options
    const mailOptions = {
      from: `"MakeStuffGo Cloud Assessment" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Your Cloud Assessment Results",
      text: `
Thank you for completing the Cloud Assessment Questionnaire!

To view your complete assessment results and dashboard, click the link below:
${magicLink}

This link will expire in 48 hours.

If you didn't request this assessment, you can safely ignore this email.

Best regards,
The MakeStuffGo Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F8FEA; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background-color: #4F8FEA; color: white; text-decoration: none; border-radius: 4px; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Cloud Assessment Results</h1>
    </div>
    <div class="content">
      <p>Thank you for completing the Cloud Assessment Questionnaire!</p>
      <p>Your assessment has been processed. Click the button below to view your complete results and personalized recommendations.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${magicLink}" class="button">View Your Cloud Assessment Dashboard</a>
      </p>
      <p><strong>Note:</strong> This link will expire in 48 hours.</p>
      <p>If you didn't request this assessment, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} MakeStuffGo | <a href="https://makestuffgo.com/privacy">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
      `,
    }

    // Log attempt
    console.log(`Attempting to send email to: ${email}`)
    console.log(`Magic link: ${magicLink}`)

    // Send email
    const info = await transporter.sendMail(mailOptions)

    console.log(`Email sent successfully. MessageId: ${info.messageId}`)

    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    }
  } catch (error) {
    console.error("Failed to send email:", error)
    return {
      success: false,
      message: "Failed to send email",
      error: error.message,
    }
  }
}

/**
 * Sends an assessment report email with optional PDF attachment
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {Object} options.clientInfo - Client information
 * @param {Array} options.responses - Response data
 * @param {Object} options.aiAnalysis - AI analysis data
 * @param {string} options.dashboardLink - Link to dashboard
 * @param {boolean} options.includeReport - Whether to include PDF report
 * @param {string} options.pdfData - Base64 encoded PDF data
 * @returns {Promise<Object>} Status and any error message
 */
export async function sendAssessmentReportEmail({
  email,
  clientInfo,
  responses,
  aiAnalysis,
  dashboardLink,
  includeReport = false,
  pdfData = null,
}) {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Format client name
    const clientName =
      clientInfo?.ClientName || clientInfo?.clientName || "there"
    const orgName =
      clientInfo?.OrganizationName ||
      clientInfo?.organizationName ||
      "your organization"

    // Create attachments array if including PDF
    const attachments = []
    if (includeReport && pdfData) {
      attachments.push({
        filename: `${orgName.replace(
          /[^a-zA-Z0-9]/g,
          "_"
        )}_CloudAssessment.pdf`,
        content: pdfData,
        encoding: "base64",
        contentType: "application/pdf",
      })
    }

    // Extract some data for the email content
    let overallScore = "N/A"
    let maturityLevel = "N/A"

    // Try to get overall score from responses or clientData
    if (responses && Array.isArray(responses)) {
      // Calculate average score from responses
      const scores = responses.filter((r) => r.Score).map((r) => r.Score)
      if (scores.length > 0) {
        overallScore = (
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        ).toFixed(1)
      }
    }

    // Try to get maturity level from AI analysis
    if (aiAnalysis) {
      if (aiAnalysis.executiveSummary) {
        // Extract a summary (first 150 characters)
        const summary = aiAnalysis.executiveSummary.substring(0, 150) + "..."
      }

      // Extract top strengths and areas for improvement
      const strengths = aiAnalysis.strengths || []
      const improvements = aiAnalysis.improvementAreas || []
    }

    // Email options
    const mailOptions = {
      from: `"MakeStuffGo Cloud Assessment" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Your Cloud Assessment Report",
      attachments: attachments,
      text: `
Hi ${clientName},

Thank you for using MakeStuffGo's Cloud Assessment platform!

Your comprehensive cloud maturity assessment for ${orgName} is now available. ${
        includeReport && pdfData
          ? "We've attached the full PDF report to this email for your convenience."
          : ""
      }

To access your interactive dashboard with all assessment details, visit:
${dashboardLink}

${
  aiAnalysis
    ? `
Our AI analysis has identified key insights for your cloud infrastructure:

${
  aiAnalysis.strengths && aiAnalysis.strengths.length > 0
    ? `
Key Strengths:
${aiAnalysis.strengths
  .slice(0, 3)
  .map((s) => `- ${s}`)
  .join("\n")}
`
    : ""
}

${
  aiAnalysis.improvementAreas && aiAnalysis.improvementAreas.length > 0
    ? `
Priority Areas for Improvement:
${aiAnalysis.improvementAreas
  .slice(0, 3)
  .map((a) => `- ${a}`)
  .join("\n")}
`
    : ""
}
`
    : ""
}

If you have any questions about your assessment results, please reply to this email.

Best regards,
The MakeStuffGo Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F8FEA; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background-color: #4F8FEA; color: white; text-decoration: none; border-radius: 4px; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    .insight-box { background-color: #f0f7ff; border-left: 4px solid #4F8FEA; padding: 15px; margin: 15px 0; }
    .strength-item { color: #10B981; }
    .improvement-item { color: #F59E0B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Cloud Assessment Report</h1>
    </div>
    <div class="content">
      <p>Hi ${clientName},</p>
      
      <p>Thank you for using MakeStuffGo's Cloud Assessment platform!</p>
      
      <p>Your comprehensive cloud maturity assessment for <strong>${orgName}</strong> is now available. ${
        includeReport && pdfData
          ? "We've attached the PDF report to this email for your convenience."
          : ""
      }</p>
      
      <p>To access your interactive dashboard with all assessment details, click the button below:</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${dashboardLink}" class="button">View Your Assessment Dashboard</a>
      </p>
      
      <p>If you have any questions about your assessment results, please reply to this email.</p>
      
      <p>Best regards,<br>The MakeStuffGo Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} MakeStuffGo | <a href="https://makestuffgo.com/privacy">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
      `,
    }

    // Log attempt
    console.log(`Attempting to send assessment report email to: ${email}`)
    if (includeReport && pdfData) {
      console.log("Including PDF attachment")
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)

    console.log(
      `Assessment report email sent successfully. MessageId: ${info.messageId}`
    )

    return {
      success: true,
      message: "Assessment report email sent successfully",
      messageId: info.messageId,
    }
  } catch (error) {
    console.error("Failed to send assessment report email:", error)
    return {
      success: false,
      message: "Failed to send assessment report email",
      error: error.message,
    }
  }
}
