"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Target, Award, TrendingUp } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  calculateLevel,
  getXpForNextLevel,
  calculateProfileCompleteness,
  BADGES,
  type UserStats,
} from "@/lib/gamification"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function GamificationDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    badges: [],
    swapsCompleted: 0,
    feedbackGiven: 0,
    profileCompleteness: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserStats()
    }
  }, [user])

  const fetchUserStats = async () => {
    if (!user) return

    try {
      const statsDoc = await getDoc(doc(db, "userStats", user.id))

      if (statsDoc.exists()) {
        const userData = statsDoc.data() as UserStats
        setStats(userData)
      } else {
        // Initialize stats for new user
        const initialStats: UserStats = {
          xp: 0,
          level: 1,
          badges: [],
          swapsCompleted: 0,
          feedbackGiven: 0,
          profileCompleteness: calculateProfileCompleteness(user),
        }

        await setDoc(doc(db, "userStats", user.id), initialStats)
        setStats(initialStats)
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentLevel = calculateLevel(stats.xp)
  const nextLevelXp = getXpForNextLevel(currentLevel)
  const currentLevelXp = getXpForNextLevel(currentLevel - 1)
  const progressToNextLevel = ((stats.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100

  const userBadges = BADGES.filter((badge) => stats.badges.includes(badge.id))
  const availableBadges = BADGES.filter((badge) => !stats.badges.includes(badge.id))

  return (
    <div className="space-y-6">
      {/* Level and XP */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-xl">
            <Trophy className="h-6 w-6 mr-2" />
            Level {currentLevel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{stats.xp} XP</span>
              <span>{nextLevelXp} XP</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2 bg-white/20" />
            <p className="text-sm text-purple-100">{nextLevelXp - stats.xp} XP to next level</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{stats.swapsCompleted}</div>
            <div className="text-xs text-gray-600">Swaps Completed</div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-600">{stats.feedbackGiven}</div>
            <div className="text-xs text-gray-600">Reviews Given</div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">{stats.badges.length}</div>
            <div className="text-xs text-gray-600">Badges Earned</div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{stats.profileCompleteness}%</div>
            <div className="text-xs text-gray-600">Profile Complete</div>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Badges ({userBadges.length}/{BADGES.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Earned Badges */}
            {userBadges.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Earned Badges</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {userBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-3 text-center"
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <div className="font-medium text-xs text-yellow-800">{badge.name}</div>
                      <div className="text-xs text-yellow-600 mt-1">{badge.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Badges */}
            {availableBadges.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Available Badges</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableBadges.slice(0, 8).map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center opacity-60"
                    >
                      <div className="text-2xl mb-1 grayscale">{badge.icon}</div>
                      <div className="font-medium text-xs text-gray-600">{badge.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{badge.requirement}</div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        +{badge.xpReward} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
