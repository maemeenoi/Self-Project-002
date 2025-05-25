const sql = require("mssql")
require("dotenv").config({ path: "./.env.local" })
// Configuration
const config = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  port: 1433, // Default SQL Server port
  options: {
    encrypt: true,
    // Enable detailed logging
    debug: {
      packet: true,
      data: true,
      payload: true,
      token: true,
    },
  },
}

async function runDiagnostic() {
  try {
    // Try to connect
    console.log("Attempting to connect...")
    const pool = await sql.connect(config)
    console.log("CONNECTION SUCCESSFUL!")

    // If connection works, try a simple query
    console.log("Testing query...")
    const result = await pool.request().query("SELECT * FROM IndustryStandards")
    console.log("Query result:", result.recordset)

    // Close connection
    await pool.close()
    console.log("Connection closed")
  } catch (err) {
    // Log detailed error info
    console.error("CONNECTION ERROR!")
    console.error("Error code:", err.code)
    console.error("Error number:", err.number)
    console.error("Error state:", err.state)
    console.error("Error class:", err.class)
    console.error("Error message:", err.message)

    if (err.originalError) {
      console.error("Original error:", err.originalError.message)
    }

    // Check common issues
    if (err.code === "ELOGIN") {
      console.error("DIAGNOSIS: Login failed - incorrect username or password")
    } else if (err.code === "ESOCKET") {
      console.error(
        "DIAGNOSIS: Network connectivity issue or firewall blocking connection"
      )
    } else if (err.code === "ETIMEOUT") {
      console.error("DIAGNOSIS: Connection timed out - likely firewall issue")
    }
  }
}

// Run the diagnostic
runDiagnostic()
