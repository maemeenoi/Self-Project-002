"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"

// Helper function to calculate total progress
const calculateTotalProgress = (measurements) => {
  if (!measurements) return 0

  let totalProgress = 0
  let validParts = 0

  Object.keys(measurements).forEach((bodyPart) => {
    if (measurements[bodyPart] && measurements[bodyPart].baseline) {
      const baseline = parseFloat(measurements[bodyPart].baseline) || 0
      const goalPercentage =
        parseFloat(measurements[bodyPart].goalPercentage) || 0
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

      if (monthlyValues.length > 0) {
        const latest = monthlyValues[0].value
        const progress = ((latest - baseline) / (target - baseline)) * 100
        totalProgress += Math.min(Math.max(progress, 0), 100)
        validParts++
      }
    }
  })

  return validParts > 0 ? (totalProgress / validParts).toFixed(1) : 0
}

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

export default function Home() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const loadUserProgress = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const measurementDoc = await getDoc(
            doc(db, "measurements", session.user.email)
          )
          if (measurementDoc.exists()) {
            const measurements = measurementDoc.data()
            const totalProgress = calculateTotalProgress(measurements)
            setProgress(totalProgress)
          }
          setLoading(false)
        } catch (error) {
          console.error("Error loading progress:", error)
          setLoading(false)
        }
      } else if (status === "unauthenticated") {
        setLoading(false)
      }
    }

    loadUserProgress()
  }, [status, session])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">
            Loading your fitness journey...
          </div>
        </div>
      </div>
    )
  }

  const achievement = getAchievementTitle(progress)

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Welcome to Your Fitness Challenge
          </h1>
          <p className="text-gray-600 text-lg">
            Track your progress, achieve your goals, and compete with others!
          </p>
        </div>

        {session ? (
          <div className="space-y-6 animate-slide-in">
            {/* Progress Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-[1.01] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                    Your Progress
                  </h2>
                  <p className="text-gray-500">{achievement.title}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                    {progress}%
                  </div>
                  <div className="text-sm text-gray-500">Overall Progress</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${achievement.color}`}
                  style={{
                    width: `${progress}%`,
                    animation: "progressAnimation 1.5s ease-out",
                  }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="/dashboard"
                className="group bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      Dashboard
                    </h3>
                    <p className="text-gray-500">
                      Track your measurements and view detailed progress
                    </p>
                  </div>
                  <div className="text-3xl group-hover:translate-x-2 transition-transform">
                    📊
                  </div>
                </div>
              </a>

              <a
                href="/leaderboard"
                className="group bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      Leaderboard
                    </h3>
                    <p className="text-gray-500">
                      See how you rank against other participants
                    </p>
                  </div>
                  <div className="text-3xl group-hover:translate-x-2 transition-transform">
                    🏆
                  </div>
                </div>
              </a>

              <a
                href="/rules"
                className="group bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      Rules
                    </h3>
                    <p className="text-gray-500">
                      See the rules and how to participate
                    </p>
                  </div>
                  <div className="text-3xl group-hover:translate-x-2 transition-transform">
                    📖
                  </div>
                </div>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in">
            <a
              href="/auth/signin"
              className="group bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    Sign In
                  </h3>
                  <p className="text-gray-500">Continue your fitness journey</p>
                </div>
                <div className="text-3xl group-hover:translate-x-2 transition-transform">
                  🔑
                </div>
              </div>
            </a>

            <a
              href="/auth/register"
              className="group bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    Register
                  </h3>
                  <p className="text-gray-500">
                    Start your fitness journey today
                  </p>
                </div>
                <div className="text-3xl group-hover:translate-x-2 transition-transform">
                  🎯
                </div>
              </div>
            </a>
          </div>
        )}

        {/* Rules Section */}
        <div className="mt-12 animate-slide-in">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Challenge Rules & Achievement Levels
          </h2>

          {/* Achievement Levels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Object.entries(ACHIEVEMENT_TITLES)
              .sort((a, b) => b[0] - a[0])
              .map(([threshold, { title, color }]) => (
                <div
                  key={threshold}
                  className={`bg-white rounded-lg shadow-lg p-4 transform hover:scale-[1.01] transition-all duration-300`}
                >
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${color} mb-3`}
                  ></div>
                  <h3 className="text-lg font-semibold mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm">
                    {threshold === "0"
                      ? "0-24%"
                      : threshold === "100"
                      ? "100%"
                      : `${threshold}-${parseInt(threshold) + 24}%`}
                  </p>
                </div>
              ))}
          </div>
        </div>
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
    </main>
  )
}
