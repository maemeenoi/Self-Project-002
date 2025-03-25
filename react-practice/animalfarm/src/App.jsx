import { useState, useEffect } from "react"
import MyDocument from "./pdf/page"
import "./App.css"

function useAnimalSearch() {
  const [animals, setAnimals] = useState([])

  useEffect(() => {
    const lastquery = localStorage.getItem("lastquery")
    search(lastquery)
  }, [])

  const search = async (query) => {
    const response = await fetch(
      "http://localhost:8080?" + new URLSearchParams({ q: query })
    )
    const data = await response.json()
    setAnimals(data)

    localStorage.setItem("lastquery", query)
  }

  return { animals, search }
}

function Animal({ type, name, age }) {
  return (
    <li className="animal-item">
      <strong>{type}</strong> called {name}. ({age} years old.)
    </li>
  )
}

function App() {
  const { animals, search } = useAnimalSearch()

  return (
    <div className="app-container">
      <div className="card">
        <MyDocument />
        <h1>Animal Farm</h1>
        <input
          type="text"
          className="search-box"
          placeholder="Search animals..."
          onChange={(e) => search(e.target.value)}
        />
        {animals.length === 0 ? (
          <p className="no-results">No animals found</p>
        ) : (
          <ul className="animal-list">
            {animals.map((animal) => (
              <Animal key={animal.id} {...animal} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
