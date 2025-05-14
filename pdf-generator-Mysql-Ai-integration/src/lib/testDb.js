const db = require("./db")

async function testDb() {
  const rows = await db.directQuery("SELECT * FROM Questions")
  console.table(rows)
}

testDb()
