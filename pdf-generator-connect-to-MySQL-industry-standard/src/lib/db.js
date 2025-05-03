const mysql = require("mysql2/promise")

// Create connection pool - no password
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "assessment_dev",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Sanitize parameters to replace undefined with null
function sanitizeParams(params) {
  if (!params) return []

  return params.map((param) => (param === undefined ? null : param))
}

// Query helper function
async function query(sql, params = []) {
  try {
    // Sanitize parameters before executing the query
    const sanitizedParams = sanitizeParams(params)

    const [results] = await pool.execute(sql, sanitizedParams)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Direct query function (for simple queries without parameters)
async function directQuery(sqlQuery) {
  try {
    const [results] = await pool.query(sqlQuery)
    return results
  } catch (error) {
    console.error("Database direct query error:", error)
    throw error
  }
}

// Get connection from pool for transaction management
async function getConnection() {
  try {
    const connection = await pool.getConnection()
    return connection
  } catch (error) {
    console.error("Database connection error:", error)
    throw error
  }
}

module.exports = { query, directQuery, getConnection, pool }
