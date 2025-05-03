const sql = require("mssql")
require("dotenv").config({ path: "./.env.local" })

// Create connection pool for Azure SQL
const config = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  port: 1433,
  options: {
    encrypt: true,
  },
}

// Connect function (returns a promise)
async function connect() {
  try {
    const pool = await sql.connect(config)
    console.log("Connected to Azure SQL Database successfully")
    return pool
  } catch (error) {
    console.error("Database connection error:", error.message)
    throw error
  }
}

// Query helper function for prepared statements
async function query(sqlQuery, params = []) {
  let pool
  try {
    pool = await connect()
    const request = pool.request()

    // Add parameters if any
    if (params && Array.isArray(params)) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param)
      })
    }

    const result = await request.query(sqlQuery)
    return result.recordset
  } catch (error) {
    console.error("Database query error:", error.message)
    throw error
  } finally {
    if (pool) {
      try {
        await pool.close()
      } catch (closeError) {
        console.error("Error closing connection pool:", closeError.message)
      }
    }
  }
}

// Direct query function (for simple queries without parameters)
async function directQuery(sqlQuery) {
  let pool
  try {
    pool = await connect()
    const result = await pool.request().query(sqlQuery)
    return result.recordset
  } catch (error) {
    console.error("Database direct query error:", error.message)
    throw error
  } finally {
    if (pool) {
      try {
        await pool.close()
      } catch (closeError) {
        console.error("Error closing connection pool:", closeError.message)
      }
    }
  }
}

// Get connection from pool for transaction management
async function getConnection() {
  try {
    return await connect()
  } catch (error) {
    console.error("Database connection error:", error.message)
    throw error
  }
}

module.exports = { query, directQuery, getConnection }
