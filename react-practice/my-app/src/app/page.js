"use client"
// import React from "react"
// import "./globals.css"
import React, { useState } from "react"
import "./globals.css"
import Stateful from "./stateful"
import AnimalLists from "./animal-lists"
import Stateful2 from "./stateful2"
import Countdown from "./countdown"

function Card({ icon, children }) {
  return (
    <section>
      <h1>{icon} Title</h1>
      {children}
    </section>
  )
}

function MyIcon() {
  return <i>!🔥!</i>
}

function Person({ name, age, children }) {
  return (
    <p>
      My name is {name} and I am {age} years old, {children} <br />
    </p>
  )
}

const Plus = ({ num1, num2 }) => {
  const result = num1 + num2
  return <p>{result}</p>
}

function Condition({ count }) {
  if (count % 3 === 0 && count % 5 === 0) {
    return <p>FizzBuzz</p>
  } else if (count % 3 === 0) {
    return <p>Fizz</p>
  } else if (count % 5 === 0) {
    return <p>Buzz</p>
  } else {
    return <p>{count}</p>
  }
}

const Condition2 = ({ count }) => {
  return count % 2 === 0 ? <p>Even!</p> : <p>Odd!</p>
}

const LoadingButton = ({ onClick, loading, label }) => {
  const handleClick = () => {
    console.log("Button clicked!")
  }
  return (
    <button onClick={(onClick, handleClick)} type="button">
      {loading ? <div className="loader"></div> : label}
    </button>
  )
}

function Events() {
  const handleClick = () => {
    console.log("Button clicked!")
  }

  return (
    <button onClick={handleClick} type="button">
      Click me!
    </button>
  )
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [value, setValue] = useState("")

  const eventHandler = (e) => {
    setValue(e.target.value)
    console.log(e.target)
  }
  return (
    <>
      <Person name="Jade" age="32" children="I am a software engineer" />
      <Card icon={<MyIcon />}>
        <p>The body of the card</p>
      </Card>
      <Plus num1={3} num2={5} />
      <Condition count={15} />
      <Condition2 count={8} />
      <LoadingButton
        label="Push Here!"
        loading={isLoading}
        onClick={() => setIsLoading(!isLoading)}
      />
      <AnimalLists />
      <Events />
      <input
        value={value}
        placeholder="Write something!"
        onChange={eventHandler}
      />
      <Stateful />
      <Stateful2 />
      <Countdown hr={1} min={0} sec={0} />
    </>
  )
}
