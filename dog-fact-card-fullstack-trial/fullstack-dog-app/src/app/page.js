"use client"

import { useState } from "react"

export default function Home() {
  const [factFront, setFactFront] = useState(
    "Click the Bark! button to see a dog fact!"
  )
  const [factBack, setFactBack] = useState("")
  const [flipped, setFlipped] = useState(false)

  const handleBark = async () => {
    // TODO: Fetch a random dog fact from the API
    // and set the factFront and factBack states
    // to display the fact on the card
    try {
      // Reuest a new dog fact
      const response = await fetch('http://localhost:3001/api/dogfact')
      const data = await response.json()
      const newFact = data.fact
      console.log(newFact)
      // Set the factFront and factBack states
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Card container */}
      <div className="relative w-80 h-48 [perspective:1000px]">
        {/* Card inner wrapper that will be rotated */}
        <div
          className={`absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Front face of card */}
          <div className="absolute inset-0 flex items-center justify-center bg-white text-center p-4 rounded-xl shadow-xl [backface-visibility:hidden]">
            {factFront}
          </div>
          {/* Back face of card */}
          <div className="absolute inset-0 flex items-center justify-center bg-white text-center p-4 rounded-xl shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {factBack}
          </div>
        </div>
      </div>
      {/* Button */}
      <button
        onClick={handleBark}
        className="ml-8 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
      >
        Bark!
      </button>
    </div>
  )
}
