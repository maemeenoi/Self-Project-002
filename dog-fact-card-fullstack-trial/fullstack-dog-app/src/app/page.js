"use client"

import { useState } from "react"

export default function Home() {
  const [factFront, setFactFront] = useState(
    "Click the Bark! button to see a dog fact!"
  )
  const [factBack, setFactBack] = useState("")
  const [flipped, setFlipped] = useState(false)

  const handleBark = async () => {
    try {
      const response = await fetch("/api/dogfact")
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json()
      const newFact = data.fact
      console.log(newFact)
      if (!flipped) {
        setFactBack(newFact)
        setFlipped(true)
      } else {
        setFactFront(newFact)
        setFlipped(false)
      }
    } catch (error) {
      console.error("Failed to fetch fact!: ", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-600">
      {/* Card container */}
      <div className="relative w-96 h-56 [perspective:1200px]">
        {/* Card inner wrapper that will be rotated */}
        <div
          className={`absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Front face of card */}
          <div className="absolute inset-0 flex items-center justify-center bg-white text-center p-6 rounded-xl shadow-lg border border-gray-300 [backface-visibility:hidden]">
            <p className="text-lg font-semibold text-gray-800">{factFront}</p>
          </div>
          {/* Back face of card */}
          <div className="absolute inset-0 flex items-center justify-center bg-white text-center p-6 rounded-xl shadow-lg border border-gray-300 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-lg font-semibold text-gray-800">{factBack}</p>
          </div>
        </div>
      </div>
      {/* Button */}
      <button
        onClick={handleBark}
        className="mt-8 px-6 py-3 bg-blue-500 text-white font-semibold text-lg rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg active:scale-95"
      >
        Bark!
      </button>
    </div>
  )
}
