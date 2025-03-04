import { useState } from "react"

export default function Stateful2() {
  const [state, setState] = useState({ count: 0, user: "Boby" })

  const handleClick = () => {
    setState({
      ...state,
      count: state.count + 1,
    })
  }

  return (
    <>
      <h3> Count: {state.count} </h3>
      <h3> User: {state.user} </h3>
      <button onClick={handleClick}>Increment!!</button>
    </>
  )
}
