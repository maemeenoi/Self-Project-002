import react, { useState, useEffect } from "react"
import "./globals.css"

const Countdown = ({ hr, min, sec }) => {
  const [over, setOver] = useState(false)
  const [paused, setPaused] = useState(true)
  const [[h, m, s], setTime] = useState([hr, min, sec])

  const tick = () => {
    // if paused, do nothing
    if (paused || over) {
      return
    }
    // if hr, min, sec are all 0, set over to true
    if (h === 0 && m === 0 && s === 0) {
      setOver(true)
      // if min and sec are 0, decrement hr by 1, set min to 59, and set sec to 59
    } else if (m === 0 && s === 0) {
      setTime([h - 1, 59, 59])
      // if sec is 0, decrement min by 1 and set sec to 59
    } else if (s === 0) {
      setTime([h, m - 1, 59])
      // otherwise, decrement sec by 1
    } else {
      setTime([h, m, s - 1])
    }
  }

  const handleReset = () => {
    setTime([hr, min, sec])
    setPaused(true)
    setOver(false)
  }

  const handlePause = () => {
    setPaused(!paused)
  }

  const format = (val) => {
    return val.toString().padStart(2, "0")
  }

  useEffect(() => {
    let ticker = setInterval(() => tick(), 1000)
    return () => clearInterval(ticker)
  })
  return (
    <div>
      <h3 className="countdown">{`${format(h)}:${format(m)}:${format(s)}`}</h3>
      <button onClick={handlePause}>{paused ? "Start" : "Pause"}</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  )
}

export default Countdown
