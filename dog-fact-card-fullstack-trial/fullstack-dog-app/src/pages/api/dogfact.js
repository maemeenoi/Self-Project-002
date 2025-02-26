export default async function handler(req, res) {
  try {
    console.log("Fetching dog fact from API...")

    // Fetch a random dog fact from the API
    const response = await fetch("https://dogapi.dog/api/v2/facts")
    console.log(`Response Status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        `Error fetching dog fact: ${response.status} - ${errorText}`
      )
      return res.status(response.status).json({
        error: `Error fetching dog fact: ${response.status} - ${errorText}`,
      })
    }

    const data = await response.json()
    console.log("API Response Data:", data)

    // Check if the API response format is correct
    if (!data.data || data.data.length === 0 || !data.data[0].attributes.body) {
      console.error("Invalid API response format:", data)
      return res.status(500).json({ error: "Invalid API response format" })
    }

    const factText = data.data[0].attributes.body
    console.log("Fetched Dog Fact:", factText)

    // Send the fact text as a JSON response
    return res.status(200).json({ fact: factText })
  } catch (error) {
    console.error("Error fetching dog fact: ", error)
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the dog fact" })
  }
}
