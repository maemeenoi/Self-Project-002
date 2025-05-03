// src/lib/tokenUtils.js
import crypto from "crypto"
import { query as dbQuery } from "./db" // Rename the import to avoid conflict

/**
 * Generates a secure random token
 * @returns {string} Secure random token
 */
export function generateSecureToken() {
  return crypto.randomBytes(48).toString("hex")
}

/**
 * Creates a magic link token record in the database
 * @param {string} email - User's email
 * @param {number|null} clientId - Client ID if known
 * @returns {Promise<string>} Generated token
 */
export async function createMagicLinkToken(email, clientId = null) {
  const token = generateSecureToken()

  // Set expiration to 48 hours from now
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 48)

  // Store in database
  const sqlQuery = `
    INSERT INTO MagicLinks (Token, Email, ClientID, ExpiresAt)
    VALUES (?, ?, ?, ?)
  `

  await dbQuery(sqlQuery, [token, email, clientId, expiresAt])

  return token
}

/**
 * Validates a magic link token
 * @param {string} token - Token to validate
 * @returns {Promise<Object|null>} User info or null if invalid
 */
export async function validateToken(token) {
  const sqlQuery = `
    SELECT ml.TokenID, ml.Email, ml.ClientID, ml.Used, ml.ExpiresAt, 
           c.ClientName, c.ContactEmail
    FROM MagicLinks ml
    LEFT JOIN Clients c ON ml.ClientID = c.ClientID
    WHERE ml.Token = ? AND ml.ExpiresAt > NOW() AND ml.Used = FALSE
  `

  const results = await dbQuery(sqlQuery, [token])

  if (results.length === 0) {
    return null
  }

  // Mark token as used
  await dbQuery("UPDATE MagicLinks SET Used = TRUE WHERE TokenID = ?", [
    results[0].TokenID,
  ])

  return results[0]
}
