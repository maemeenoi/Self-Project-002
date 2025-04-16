"use client"

import React, { useState, useEffect } from "react"
import {
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Search,
  BarChart,
} from "lucide-react"
import flashcardsData from "./data.js" // Import the flashcard data

// Style constants for module colors
const CARD_COLORS = {
  "Module 1": "#2563eb", // blue
  "Module 2": "#7c3aed", // purple
  "Module 3": "#059669", // green
  "Module 4": "#dc2626", // red
  "Module 5": "#ea580c", // orange
  "Module 6": "#65a30d", // lime
  "Module 7": "#0891b2", // cyan
  "Module 8": "#be123c", // rose
  "Module 9": "#4338ca", // indigo
  "Module 10": "#a16207", // amber
  "Module 11": "#15803d", // emerald
  "Module 12": "#f97316", // orange
  "Module 13": "#4f46e5", // indigo
  "Module 14": "#0369a1", // sky
  "Module 15": "#ca8a04", // yellow
  "Module 16": "#be185d", // pink
  "Module 17": "#475569", // slate
  "Module 18": "#9f1239", // rose
  "Module 19": "#1e3a8a", // blue
  "Module 20": "#b45309", // amber
  "Module 21": "#1e40af", // blue
  "Module 22": "#be123c", // rose
  "Module 23": "#0e7490", // cyan
  "Module 24": "#166534", // green
  "Module 25": "#7e22ce", // purple
  "Module 26": "#0c4a6e", // sky
  "Module 27": "#92400e", // amber
  "Module 28": "#9333ea", // purple
}

// Keyboard shortcuts
const KEY_MAPPINGS = {
  ArrowRight: "next",
  ArrowLeft: "prev",
  " ": "flip",
  m: "toggle-mastered",
}

const CyberSecurityFlashcards = () => {
  // State for the app
  const [cards, setCards] = useState([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [filter, setFilter] = useState("all")
  const [filterText, setFilterText] = useState("")
  const [filteredCards, setFilteredCards] = useState([])
  const [mastered, setMastered] = useState({})
  const [moduleList, setModuleList] = useState([])
  const [studyMode, setStudyMode] = useState("all") // all, unmastered, mastered
  const [showModuleStats, setShowModuleStats] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    mastered: 0,
    remaining: 0,
    moduleStats: {},
  })

  // Parse the flashcard data
  useEffect(() => {
    const parseFlashcardsData = () => {
      const lines = flashcardsData.split("\n")
      const parsedCards = []
      let currentModule = ""
      let currentQuestion = ""
      let currentAnswer = ""
      let moduleNames = new Set()

      lines.forEach((line) => {
        // Module header
        if (line.startsWith("# Module")) {
          currentModule = line.substring(2).trim()
          moduleNames.add(currentModule)
        }
        // Question
        else if (line.startsWith("- Question:")) {
          // Save previous question if exists
          if (currentQuestion && currentAnswer) {
            parsedCards.push({
              id: parsedCards.length,
              module: currentModule,
              question: currentQuestion,
              answer: currentAnswer,
            })
          }
          currentQuestion = line.substring("- Question:".length).trim()
          currentAnswer = ""
        }
        // Answer
        else if (line.startsWith("  Answer:")) {
          currentAnswer = line.substring("  Answer:".length).trim()
        }
      })

      // Add the last card
      if (currentQuestion && currentAnswer) {
        parsedCards.push({
          id: parsedCards.length,
          module: currentModule,
          question: currentQuestion,
          answer: currentAnswer,
        })
      }

      setModuleList(Array.from(moduleNames))
      setCards(parsedCards)
      setFilteredCards(parsedCards)
      setIsFetching(false)

      // Load saved mastered state from localStorage if available
      const savedMastered = localStorage.getItem("flashcard-mastered")
      if (savedMastered) {
        try {
          setMastered(JSON.parse(savedMastered))
        } catch (e) {
          console.error("Failed to parse saved mastered state:", e)
        }
      }
    }

    parseFlashcardsData()
  }, [])

  // Save mastered state to localStorage when it changes
  useEffect(() => {
    if (Object.keys(mastered).length > 0) {
      localStorage.setItem("flashcard-mastered", JSON.stringify(mastered))
    }
  }, [mastered])

  // Update filtered cards when filter changes
  useEffect(() => {
    let filtered = [...cards]

    // Filter by module
    if (filter !== "all") {
      filtered = filtered.filter((card) => card.module === filter)
    }

    // Filter by search text
    if (filterText) {
      const searchLower = filterText.toLowerCase()
      filtered = filtered.filter(
        (card) =>
          card.question.toLowerCase().includes(searchLower) ||
          card.answer.toLowerCase().includes(searchLower)
      )
    }

    // Filter by study mode
    if (studyMode === "mastered") {
      filtered = filtered.filter((card) => mastered[card.id])
    } else if (studyMode === "unmastered") {
      filtered = filtered.filter((card) => !mastered[card.id])
    }

    setFilteredCards(filtered)
    // Reset current card index if it's out of bounds
    if (currentCardIndex >= filtered.length) {
      setCurrentCardIndex(0)
    }

    // Update stats
    const totalMastered = Object.values(mastered).filter(Boolean).length

    // Calculate module stats
    const moduleStats = {}
    moduleList.forEach((module) => {
      const moduleCards = cards.filter((card) => card.module === module)
      const masteredInModule = moduleCards.filter(
        (card) => mastered[card.id]
      ).length
      moduleStats[module] = {
        total: moduleCards.length,
        mastered: masteredInModule,
        percentage:
          moduleCards.length > 0
            ? Math.round((masteredInModule / moduleCards.length) * 100)
            : 0,
      }
    })

    setStats({
      total: cards.length,
      mastered: totalMastered,
      remaining: cards.length - totalMastered,
      moduleStats,
    })
  }, [filter, filterText, studyMode, cards, mastered, moduleList])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const action = KEY_MAPPINGS[e.key]
      if (action === "next") nextCard()
      else if (action === "prev") prevCard()
      else if (action === "flip") flipCard()
      else if (action === "toggle-mastered") toggleMastered()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [filteredCards.length, currentCardIndex]) // Re-attach when these change

  // Handle card flipping
  const flipCard = () => {
    setIsFlipped(!isFlipped)
  }

  // Navigate to next card
  const nextCard = () => {
    if (filteredCards.length === 0) return
    setIsFlipped(false)
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % filteredCards.length)
  }

  // Navigate to previous card
  const prevCard = () => {
    if (filteredCards.length === 0) return
    setIsFlipped(false)
    setCurrentCardIndex(
      (prevIndex) =>
        (prevIndex - 1 + filteredCards.length) % filteredCards.length
    )
  }

  // Mark current card as mastered/unmastered
  const toggleMastered = () => {
    if (filteredCards.length === 0) return
    const cardId = filteredCards[currentCardIndex].id
    setMastered((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }))
  }

  // Shuffle the cards
  const shuffleCards = () => {
    if (filteredCards.length <= 1) return

    // Fisher-Yates shuffle algorithm
    const shuffled = [...filteredCards]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    setFilteredCards(shuffled)
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }

  // Reset all mastered cards
  const resetMastered = () => {
    if (window.confirm("Are you sure you want to reset all mastered cards?")) {
      setMastered({})
      localStorage.removeItem("flashcard-mastered")
    }
  }

  // Toggle module statistics view
  const toggleModuleStats = () => {
    setShowModuleStats(!showModuleStats)
  }

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-bold">Loading flashcards...</div>
      </div>
    )
  }

  // If we're showing module statistics
  if (showModuleStats) {
    return (
      <div className="flex flex-col p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Module Statistics</h1>
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={toggleModuleStats}
          >
            Back to Flashcards
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(stats.moduleStats).map(([module, moduleData]) => {
            const modulePrefix = module.split(":")[0].trim()
            const moduleColor = CARD_COLORS[modulePrefix] || "#4b5563"
            return (
              <div
                key={module}
                className="p-4 rounded-lg shadow-md border-l-4"
                style={{ borderLeftColor: moduleColor }}
              >
                <h3 className="text-lg font-medium mb-2">{module}</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-gray-100 p-2 rounded">
                    <div className="font-bold">{moduleData.total}</div>
                    <div>Total</div>
                  </div>
                  <div className="bg-green-100 p-2 rounded">
                    <div className="font-bold">{moduleData.mastered}</div>
                    <div>Mastered</div>
                  </div>
                  <div className="bg-blue-100 p-2 rounded">
                    <div className="font-bold">{moduleData.percentage}%</div>
                    <div>Complete</div>
                  </div>
                </div>
                <div className="mt-3 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${moduleData.percentage}%`,
                      backgroundColor: moduleColor,
                    }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // If no cards match the filter
  if (filteredCards.length === 0) {
    return (
      <div className="flex flex-col p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          CyberSecurity Exam Flashcards
        </h1>

        {/* Top controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            className="border border-gray-300 rounded px-3 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Modules</option>
            {moduleList.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>

          <div className="flex border border-gray-300 rounded">
            <span className="flex items-center px-3 bg-gray-100">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search cards..."
              className="px-3 py-2 w-full"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>

          <select
            className="border border-gray-300 rounded px-3 py-2"
            value={studyMode}
            onChange={(e) => setStudyMode(e.target.value)}
          >
            <option value="all">All Cards</option>
            <option value="unmastered">Unmastered Only</option>
            <option value="mastered">Mastered Only</option>
          </select>
        </div>

        <div className="text-center py-12 bg-gray-100 rounded">
          <p className="text-xl mb-4">
            No flashcards match your current filters.
          </p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => {
              setFilter("all")
              setFilterText("")
              setStudyMode("all")
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>
    )
  }

  const currentCard = filteredCards[currentCardIndex]
  const modulePrefix = currentCard.module.split(":")[0].trim()
  const moduleColor = CARD_COLORS[modulePrefix] || "#4b5563"
  const isMastered = mastered[currentCard.id] || false

  return (
    <div className="flex flex-col p-4 w-full max-w-screen-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-center">
          CyberSecurity Exam Flashcards
        </h1>
        <button
          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm md:text-base"
          onClick={toggleModuleStats}
        >
          <BarChart size={16} />
          Module Stats
        </button>
      </div>

      {/* Module Stats */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="text-sm py-1 px-2 bg-blue-100 text-blue-800 rounded">
          Total: {stats.total}
        </div>
        <div className="text-sm py-1 px-2 bg-green-100 text-green-800 rounded">
          Mastered: {stats.mastered}
        </div>
        <div className="text-sm py-1 px-2 bg-orange-100 text-orange-800 rounded">
          Remaining: {stats.remaining}
        </div>
        <div className="text-sm py-1 px-2 bg-purple-100 text-purple-800 rounded">
          Progress:{" "}
          {stats.total > 0
            ? Math.round((stats.mastered / stats.total) * 100)
            : 0}
          %
        </div>
      </div>

      {/* Top Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Modules</option>
          {moduleList.map((module) => (
            <option key={module} value={module}>
              {module}
            </option>
          ))}
        </select>

        <div className="flex border border-gray-300 rounded w-full sm:w-auto">
          <span className="flex items-center px-3 bg-gray-100">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search cards..."
            className="px-3 py-2 w-full"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        <select
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-auto"
          value={studyMode}
          onChange={(e) => setStudyMode(e.target.value)}
        >
          <option value="all">All Cards</option>
          <option value="unmastered">Unmastered Only</option>
          <option value="mastered">Mastered Only</option>
        </select>

        <button
          className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 w-full sm:w-auto"
          onClick={shuffleCards}
        >
          <Shuffle size={18} />
          Shuffle
        </button>
      </div>

      {/* Flashcard */}
      <div
        className={`relative w-full h-[50vh] sm:h-64 md:h-80 rounded-lg shadow-lg cursor-pointer transition-transform duration-500 transform ${
          isFlipped ? "scale-105" : ""
        }`}
        onClick={flipCard}
        style={{
          perspective: "1000px",
        }}
      >
        <div
          className="absolute inset-0 w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front (Question) */}
          <div
            className="absolute inset-0 backface-hidden p-6 bg-white rounded-lg flex flex-col"
            style={{
              backfaceVisibility: "hidden",
              borderTop: `8px solid ${moduleColor}`,
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className="text-sm font-medium px-2 py-1 rounded"
                style={{ backgroundColor: `${moduleColor}30` }}
              >
                {currentCard.module}
              </span>
              <span className="text-sm text-gray-500">
                Card {currentCardIndex + 1} of {filteredCards.length}
              </span>
            </div>
            <div className="flex-grow flex items-center justify-center overflow-auto">
              <h2 className="text-lg md:text-xl font-semibold text-center">
                {currentCard.question}
              </h2>
            </div>
            <div className="text-center text-sm text-gray-500">
              Click to reveal answer
            </div>
          </div>

          {/* Back (Answer) */}
          <div
            className="absolute inset-0 backface-hidden p-6 bg-white rounded-lg flex flex-col"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderBottom: `8px solid ${moduleColor}`,
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className="text-sm font-medium px-2 py-1 rounded"
                style={{ backgroundColor: `${moduleColor}30` }}
              >
                {currentCard.module}
              </span>
              <span className="text-sm text-gray-500">
                Card {currentCardIndex + 1} of {filteredCards.length}
              </span>
            </div>
            <div className="flex-grow flex items-center justify-center overflow-auto">
              <p className="text-base md:text-lg text-center">
                {currentCard.answer}
              </p>
            </div>
            <div className="text-center text-sm text-gray-500">
              Click to see question
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard shortcut info */}
      <div className="flex justify-center mt-3">
        <div className="text-xs text-gray-500">
          Keyboard shortcuts: ← Previous | → Next | Space Flip | M Toggle
          Mastered
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex flex-wrap justify-between mt-4 gap-2">
        <button
          className="flex items-center gap-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 w-full sm:w-auto"
          onClick={prevCard}
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            className={`flex items-center gap-1 px-4 py-2 rounded w-full sm:w-auto ${
              isMastered
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            onClick={toggleMastered}
          >
            {isMastered ? <X size={18} /> : <Check size={18} />}
            {isMastered ? "Unmark" : "Mark"} as Mastered
          </button>

          <button
            className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 w-full sm:w-auto"
            onClick={resetMastered}
          >
            Reset All Mastered
          </button>
        </div>

        <button
          className="flex items-center gap-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 w-full sm:w-auto"
          onClick={nextCard}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

export default CyberSecurityFlashcards
