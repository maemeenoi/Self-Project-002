import express from "express"
import cors from "cors"
// initialize express
const app = express()
// use cors middleware
app.use(cors())
// use json middleware
app.use(express.json())

// create a list of animals
import Chance from "chance"
const chance = new Chance()
const animals = [...Array(1000).keys()].map((id) => {
  return {
    id,
    name: chance.name(),
    type: chance.animal(),
    age: chance.age(),
  }
})

// Endpoint to search all animals
app.get("", (req, res) => {
  // Filter animals by query
  const query = req.query.q?.toLowerCase() || ""
  const result = animals.filter(
    (animal) =>
      animal.type.toLowerCase().includes(query) ||
      animal.name.toLowerCase().includes(query)
  )
  res.send(result)
})

app.listen(8080, () => console.log("listening on port http://localhost:8080"))
