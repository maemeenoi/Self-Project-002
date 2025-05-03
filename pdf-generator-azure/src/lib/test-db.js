// test-db.js
const db = require("./db")

async function testDb() {
  try {
    // Test a simple query
    console.log("Testing query...")
    const result = await db.query("SELECT 1 as testColumn")
    console.log("Query result:", result)

    console.log("Database connection working!")
  } catch (error) {
    console.error("Test failed:", error.message)
  }
}

testDb()
