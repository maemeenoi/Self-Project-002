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
    console.log(process.env.EMAIL_HOST)
    console.log(process.env.EMAIL_PORT)
    console.log(process.env.EMAIL_USER)

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
