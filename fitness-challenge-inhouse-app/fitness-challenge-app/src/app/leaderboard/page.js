'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebaseConfig'

const ACHIEVEMENT_TITLES = {
  100: { title: "Ultimate Goal Crusher 👑", color: "from-purple-500 to-pink-500" },
  90: { title: "Elite Achiever 🌟", color: "from-yellow-400 to-orange-500" },
  75: { title: "Progress Champion ⭐", color: "from-blue-500 to-indigo-500" },
  50: { title: "Determined Warrior 💪", color: "from-green-500 to-teal-500" },
  25: { title: "Rising Challenger 🌱", color: "from-cyan-500 to-blue-500" },
  0: { title: "Journey Beginner 🎯", color: "from-gray-400 to-gray-500" }
}

const getAchievementTitle = (progress) => {
  const thresholds = Object.keys(ACHIEVEMENT_TITLES).sort((a, b) => b - a)
  for (const threshold of thresholds) {
    if (progress >= threshold) {
      return ACHIEVEMENT_TITLES[threshold]
    }
  }
  return ACHIEVEMENT_TITLES[0]
}

export default function Leaderboard() {
  const { data: session } = useSession()
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRankings = async () => {
      try {
        const [usersSnap, measurementsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'measurements'))
        ])

        const users = {}
        usersSnap.forEach(doc => {
          users[doc.id] = doc.data()
        })

        const rankings = []
        measurementsSnap.forEach(doc => {
          const userData = users[doc.id]
          if (!userData) return

          const measurements = doc.data()
          let totalProgress = 0
          let measurementCount = 0

          userData.selectedParts.forEach(partId => {
            const measurement = measurements[partId]
            if (!measurement) return

            const baseline = parseFloat(measurement.baseline) || 0
            const goalPercentage = parseFloat(measurement.goalPercentage) || 0
            const targetValue = baseline * (1 + goalPercentage / 100)

            // Get the latest measurement
            const monthlyProgress = measurement.monthlyProgress || {}
            const currentValue = parseFloat(Object.values(monthlyProgress).pop() || baseline)

            if (goalPercentage !== 0) {
              const progress = Math.min(100, Math.max(0, ((currentValue - baseline) / (targetValue - baseline)) * 100))
              totalProgress += progress
              measurementCount++
            }
          })

          const averageProgress = measurementCount > 0 ? totalProgress / measurementCount : 0

          rankings.push({
            userId: doc.id,
            displayName: userData.displayName,
            progress: averageProgress,
            achievementTitle: getAchievementTitle(averageProgress)
          })
        })

        // Sort by progress in descending order
        rankings.sort((a, b) => b.progress - a.progress)
        setRankings(rankings)
      } catch (error) {
        console.error('Error loading rankings:', error)
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
        icon: "📈"
      },
      {
        label: "Achievement Level",
        value: ranking.achievementTitle.split(' ')[0],
        icon: ranking.achievementTitle.split(' ')[1]
      }
    ]
    return stats
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading leaderboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Fitness Challenge Leaderboard
        </h1>
        <p className="text-gray-600">See how you stack up against other participants!</p>
      </div>

      <div className="space-y-4">
        {rankings.map((ranking, index) => {
          const isCurrentUser = session?.user?.email === ranking.userId
          const isTopThree = index < 3
          const medalEmojis = ['🥇', '🥈', '🥉']
          const achievement = Object.entries(ACHIEVEMENT_TITLES)
            .find(([threshold]) => ranking.progress >= Number(threshold))?.[1]

          return (
            <div
              key={ranking.userId}
              className={`
                relative bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300
                ${isCurrentUser ? 'ring-2 ring-blue-500 scale-[1.02]' : 'hover:scale-[1.01]'}
                ${isTopThree ? 'border-2 border-yellow-300' : ''}
                animate-slide-in
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {isTopThree && (
                <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rotate-45 -translate-x-6 -translate-y-6 animate-pulse" />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold w-8 animate-bounce-subtle">
                      {isTopThree ? medalEmojis[index] : `${index + 1}.`}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span className={`bg-gradient-to-r ${achievement.color} text-transparent bg-clip-text`}>
                          {ranking.displayName}
                        </span>
                        {isCurrentUser && (
                          <span className="text-sm text-blue-600 animate-pulse">(You)</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">{achievement.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                      {ranking.progress.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Overall Progress</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${achievement.color}`}
                      style={{ 
                        width: `${ranking.progress}%`,
                        animation: 'progressAnimation 1.5s ease-out'
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
          from { width: 0; }
          to { width: 100%; }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
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
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg animate-fade-in">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Achievement Levels</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {Object.entries(ACHIEVEMENT_TITLES).map(([threshold, { title, color }]) => (
            <div 
              key={threshold}
              className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <span className={`text-2xl bg-gradient-to-r ${color} text-transparent bg-clip-text`}>
                {title.split(' ')[1]}
              </span>
              <span className="text-sm font-medium text-gray-600">{threshold}%+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 