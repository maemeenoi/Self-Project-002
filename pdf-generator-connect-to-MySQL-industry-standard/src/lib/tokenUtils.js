// src/lib/tokenUtils.js (with enhanced logging)
import crypto from "crypto"
import { query as dbQuery } from "./db"

export function generateSecureToken() {
  const token = crypto.randomBytes(48).toString("hex")
  console.log(`Generated token: ${token.substring(0, 10)}...`)
  return token
}

export async function createMagicLinkToken(email, clientId = null) {
  console.log(
    `Creating magic link token for email: ${email}, clientId: ${clientId}`
  )

  const token = generateSecureToken()

  // Set expiration to 48 hours from now
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 48)
  const expiresAtString = expiresAt.toISOString().slice(0, 19).replace("T", " ")

  // Store in database
  const sqlQuery = `
    INSERT INTO MagicLinks (Token, Email, ClientID, ExpiresAt)
    VALUES (?, ?, ?, ?)
  `

  console.log(`Executing SQL: ${sqlQuery}`)
  console.log(
    `With params: [${token.substring(
      0,
      10
    )}..., ${email}, ${clientId}, ${expiresAtString}]`
  )

  try {
    const result = await dbQuery(sqlQuery, [token, email, clientId, expiresAt])
    console.log(`Magic link token created successfully. Result:`, result)
    return token
  } catch (error) {
    console.error(`Error creating magic link token:`, error)
    throw error
  }
}

export async function validateToken(token) {
  console.log(`Validating token: ${token.substring(0, 10)}...`)

  const sqlQuery = `
    SELECT ml.TokenID, ml.Email, ml.ClientID, ml.Used, ml.ExpiresAt, 
           c.ClientName, c.ContactEmail
    FROM MagicLinks ml
    LEFT JOIN Clients c ON ml.ClientID = c.ClientID
    WHERE ml.Token = ? AND ml.ExpiresAt > NOW() AND ml.Used = FALSE
  `

  try {
    const results = await dbQuery(sqlQuery, [token])
    console.log(
      `Token validation result:`,
      results.length > 0 ? "Valid" : "Invalid"
    )

    // Mark token as used
    await dbQuery("UPDATE MagicLinks SET Used = TRUE WHERE TokenID = ?", [
      results[0].TokenID,
    ])

    if (results.length === 0) {
      return null
    }

    return results[0]
  } catch (error) {
    console.error(`Error validating token:`, error)
    throw error
  }
}
