const express = require("express")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())

app.get("/api/dogfact", async (req, res) => {
  try {
    // Fetch a random dog fact from the API
    const response = await fetch("https://dogapi.dog/api/v2/facts")
    const data = await response.json()
    //Extract the fact from the response data
    const factText = data.data[0].attributes.body
    console.log(factText)
    //Send the fact text as a JSON response
    res.json({ fact: factText })
    console.log("Dog fact fetched successfully")
  } catch (error) {
    console.error("Error fetching dog fact: ", error)
    res
      .status(500)
      .json({ error: "An error occurred while fetching the dog fact" })
  }
})

// Start the Express server
app.listen(PORT, () => {
  console.log(
    `🐕 Express server running at http://localhost:${PORT}/api/dogfact`
  )
})
