"use client"
import React, { useState } from "react"
import "./globals.css"

export default function Stateful() {
  const [count, setCount] = useState(0)
  const [prevCount, SetPrevCount] = useState(0)

  const handleClick = () => {
    setCount((prev) => {
      SetPrevCount(prev)
      setCount(count + 1.23)
    })
  }

  return (
    <>
      <h3> Current Count: {count}</h3>
      <h3> Previous Count: {prevCount}</h3>
      <button onClick={handleClick}> Increment! </button>
    </>
  )
}
