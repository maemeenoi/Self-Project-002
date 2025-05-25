const mssql = require("mssql")

// Azure SQL Database configuration
const config = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  port: 1433, // Default SQL Server port
  options: {
    encrypt: true, // For Azure SQL
    trustServerCertificate: false, // Change to true for local dev / self-signed certs
    enableArithAbort: true,
  },
}

// Connection pool
let pool = null

// Initialize connection pool
async function initializePool() {
  try {
    pool = await mssql.connect(config)
    console.log("Connected to Azure SQL Database")
    console.log("CONNECTION SUCCESSFUL!")
    return pool
  } catch (error) {
    console.error("Database connection error:", error)
    throw error
  }
}

// Get the pool (create it if it doesn't exist)
async function getPool() {
  if (!pool) {
    await initializePool()
  }
  return pool
}

// Sanitize parameters to replace undefined with null
function sanitizeParams(params) {
  if (!params) return []

  return params.map((param) => (param === undefined ? null : param))
}

// Query helper function
async function query(sql, params = []) {
  try {
    const poolConnection = await getPool()
    const request = poolConnection.request()

    // Add parameters to the request
    params.forEach((param, index) => {
      request.input(`param${index}`, sanitizeParams([param])[0])
    })

    // Replace ? placeholders with @paramX
    let modifiedSql = sql
    for (let i = 0; i < params.length; i++) {
      modifiedSql = modifiedSql.replace("?", `@param${i}`)
    }

    const results = await request.query(modifiedSql)
    return results.recordset
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Direct query function (for simple queries without parameters)
async function directQuery(sqlQuery) {
  try {
    const poolConnection = await getPool()
    const results = await poolConnection.request().query(sqlQuery)
    return results.recordset
  } catch (error) {
    console.error("Database direct query error:", error)
    throw error
  }
}

// Get connection from pool for transaction management
async function getConnection() {
  try {
    const poolConnection = await getPool()
    const transaction = new mssql.Transaction(poolConnection)
    await transaction.begin()
    return {
      transaction,
      request: () => {
        return new mssql.Request(transaction)
      },
      commit: async () => {
        await transaction.commit()
      },
      rollback: async () => {
        await transaction.rollback()
      },
    }
  } catch (error) {
    console.error("Database connection error:", error)
    throw error
  }
}

// Initialize the pool
initializePool().catch(console.error)

module.exports = { query, directQuery, getConnection, getPool }
