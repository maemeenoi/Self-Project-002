"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/firebaseConfig"

const ACHIEVEMENT_TITLES = {
  100: {
    title: "Ultimate Goal Crusher 👑",
    color: "from-purple-500 to-pink-500",
  },
  90: { title: "Elite Achiever 🌟", color: "from-yellow-400 to-orange-500" },
  75: { title: "Progress Champion ⭐", color: "from-blue-500 to-indigo-500" },
  50: { title: "Determined Warrior 💪", color: "from-green-500 to-teal-500" },
  25: { title: "Rising Challenger 🌱", color: "from-cyan-500 to-blue-500" },
  0: { title: "Journey Beginner 🎯", color: "from-gray-400 to-gray-500" },
}

const getAchievementTitle = (progress) => {
  const thresholds = Object.keys(ACHIEVEMENT_TITLES).sort((a, b) => b - a)
  for (const threshold of thresholds) {
    if (progress >= parseFloat(threshold)) {
      return ACHIEVEMENT_TITLES[threshold]
    }
  }
  return ACHIEVEMENT_TITLES[0]
}

const calculateProgress = (measurements, bodyPart) => {
  if (!measurements?.[bodyPart]) return null

  const baseline = parseFloat(measurements[bodyPart].baseline) || 0
  const goalPercentage = parseFloat(measurements[bodyPart].goalPercentage) || 0
  const target = baseline + (baseline * goalPercentage) / 100

  // Get all monthly values and sort them by date
  const monthlyValues = Object.entries(
    measurements[bodyPart].monthlyProgress || {}
  )
    .map(([month, value]) => ({
      month,
      value: parseFloat(value) || 0,
      date: new Date(month.split(" ")[0] + " 1, " + month.split(" ")[1]),
    }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.date - a.date)

  if (monthlyValues.length === 0) return null

  const latest = monthlyValues[0].value
  const progressPercentage = ((latest - baseline) / (target - baseline)) * 100
  return Math.min(Math.max(progressPercentage, 0), 100)
}

const calculateTotalProgress = (measurements, selectedParts) => {
  if (!measurements) return 0

  let totalProgress = 0
  let validParts = 0

  selectedParts.forEach((bodyPart) => {
    const progress = calculateProgress(measurements, bodyPart)
    if (progress !== null) {
      totalProgress += progress
      validParts++
    }
  })

  return validParts > 0 ? totalProgress / validParts : 0
}

export default function Leaderboard() {
  const { data: session } = useSession()
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRankings = async () => {
      try {
        const [usersSnap, measurementsSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "measurements")),
        ])

        const users = {}
        usersSnap.forEach((doc) => {
          users[doc.id] = doc.data()
        })

        const rankings = []
        measurementsSnap.forEach((doc) => {
          const userData = users[doc.id]
          if (!userData) return

          const measurements = doc.data()
          const averageProgress = calculateTotalProgress(
            measurements,
            userData.selectedParts
          )

          rankings.push({
            userId: doc.id,
            displayName: userData.displayName,
            progress: averageProgress,
            achievementTitle: getAchievementTitle(averageProgress),
          })
        })

        // Sort by progress in descending order
        rankings.sort((a, b) => b.progress - a.progress)
        setRankings(rankings)
      } catch (error) {
        console.error("Error loading rankings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRankings()
  }, [])

  const getStatistics = (ranking) => {
    const stats = [
      {
        label: "Overall Progress",
        value: `${ranking.progress.toFixed(1)}%`,
        icon: "📈",
      },
      {
        label: "Achievement Level",
        value: ranking.achievementTitle.split(" ")[0],
        icon: ranking.achievementTitle.split(" ")[1],
      },
    ]
    return stats
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">
            Loading leaderboard...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Fitness Challenge Leaderboard
          </h1>
          <p className="text-center text-gray-600">
            See how you stack up against other participants!
          </p>
        </div>

        {/* Achievement Levels */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Achievement Levels
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(ACHIEVEMENT_TITLES)
              .sort((a, b) => b[0] - a[0])
              .map(([threshold, { title, color }]) => (
                <div
                  key={threshold}
                  className="bg-gray-50 rounded-lg p-2 sm:p-3"
                >
                  <div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${color} mb-2`}
                  ></div>
                  <div className="text-xs sm:text-sm font-medium truncate">
                    {title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {threshold === "0"
                      ? "0-24%"
                      : threshold === "100"
                      ? "100%"
                      : `${threshold}-${parseInt(threshold) + 24}%`}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Rankings */}
        <div className="space-y-4">
          {rankings.map((ranking, index) => {
            const isCurrentUser = session?.user?.email === ranking.userId
            const isTopThree = index < 3
            const medalEmojis = ["🥇", "🥈", "🥉"]
            const achievement = getAchievementTitle(ranking.progress)

            return (
              <div
                key={ranking.userId}
                className={`
                  relative bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300
                  ${
                    isCurrentUser
                      ? "ring-2 ring-blue-500 scale-[1.02]"
                      : "hover:scale-[1.01]"
                  }
                  ${isTopThree ? "border-2 border-yellow-300" : ""}
                  animate-slide-in
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {isTopThree && (
                  <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rotate-45 -translate-x-6 -translate-y-6 animate-pulse" />
                )}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold w-8 animate-bounce-subtle">
                        {isTopThree ? medalEmojis[index] : `${index + 1}.`}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <span
                            className={`bg-gradient-to-r ${achievement.color} text-transparent bg-clip-text`}
                          >
                            {ranking.displayName}
                          </span>
                          {isCurrentUser && (
                            <span className="text-sm text-blue-600 animate-pulse">
                              (You)
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {achievement.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                        {ranking.progress.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">
                        Overall Progress
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${achievement.color}`}
                        style={{
                          width: `${ranking.progress}%`,
                          animation: "progressAnimation 1.5s ease-out",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <style jsx global>{`
          @keyframes progressAnimation {
            from {
              width: 0;
            }
            to {
              width: 100%;
            }
          }

          @keyframes bounce-subtle {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-3px);
            }
          }

          .animate-bounce-subtle {
            animation: bounce-subtle 2s infinite;
          }

          .animate-slide-in {
            animation: slideIn 0.5s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
          }

          @keyframes slideIn {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
