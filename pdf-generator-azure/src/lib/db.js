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

// Query helper function for prepared statements
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Direct query function for transactions and statements not supported by prepared statements
async function directQuery(sql) {
  try {
    const [results] = await pool.query(sql)
    return results
  } catch (error) {
    console.error("Database direct query error:", error)
    throw error
  }
}

// Get connection from pool for transaction management
async function getConnection() {
  try {
    return await pool.getConnection()
  } catch (error) {
    console.error("Database connection error:", error)
    throw error
  }
}

module.exports = { query, directQuery, getConnection, pool }
