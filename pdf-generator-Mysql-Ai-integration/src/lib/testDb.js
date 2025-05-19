const db = require("./db")

async function testDb() {
  const rows = await db.directQuery("SELECT * FROM Question")
  console.table(rows)
}

testDb()
