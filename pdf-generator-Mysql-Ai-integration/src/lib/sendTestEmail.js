require("dotenv").config({ path: "./.env.local" })
console.log("EMAIL_HOST:", process.env.EMAIL_HOST)
const nodemailer = require("nodemailer")

async function sendTestEmail() {
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  let info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: "maemeenoi@gmail.com", // or test with a Gmail/Yahoo address
    subject: "✅ Test Email from Apple SMTP",
    text: "Hello! This is a test email using Apple iCloud SMTP setup.",
    html: "<b>Hello!</b> This is a test email using <i>Apple iCloud SMTP</i> setup.",
  })

  console.log("✅ Message sent: %s", info.messageId)
}

sendTestEmail().catch(console.error)
