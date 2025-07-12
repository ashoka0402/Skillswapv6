// Gamification system
export interface UserStats {
  xp: number
  level: number
  badges: string[]
  swapsCompleted: number
  feedbackGiven: number
  profileCompleteness: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  requirement: string
  xpReward: number
}

export const BADGES: Badge[] = [
  {
    id: "first_swap",
    name: "First Swap",
    description: "Completed your first skill swap",
    icon: "🎯",
    requirement: "Complete 1 swap",
    xpReward: 100,
  },
  {
    id: "five_swaps",
    name: "Skill Exchanger",
    description: "Completed 5 skill swaps",
    icon: "🔄",
    requirement: "Complete 5 swaps",
    xpReward: 250,
  },
  {
    id: "ten_swaps",
    name: "Swap Master",
    description: "Completed 10 skill swaps",
    icon: "🏆",
    requirement: "Complete 10 swaps",
    xpReward: 500,
  },
  {
    id: "top_rated",
    name: "Top Rated",
    description: "Maintain a 4.5+ star rating",
    icon: "⭐",
    requirement: "4.5+ rating with 5+ reviews",
    xpReward: 300,
  },
  {
    id: "helpful_reviewer",
    name: "Helpful Reviewer",
    description: "Given 10 helpful reviews",
    icon: "📝",
    requirement: "Give 10 reviews",
    xpReward: 200,
  },
  {
    id: "profile_complete",
    name: "Profile Pro",
    description: "100% profile completion",
    icon: "✨",
    requirement: "Complete all profile fields",
    xpReward: 150,
  },
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "One of the first 100 users",
    icon: "🚀",
    requirement: "Join early",
    xpReward: 500,
  },
  {
    id: "skill_teacher",
    name: "Skill Teacher",
    description: "Taught 5 different skills",
    icon: "👨‍🏫",
    requirement: "Teach 5 different skills",
    xpReward: 400,
  },
]

export const XP_REWARDS = {
  PROFILE_COMPLETE: 50,
  FIRST_SWAP_REQUEST: 25,
  SWAP_ACCEPTED: 100,
  SWAP_COMPLETED: 200,
  FEEDBACK_GIVEN: 50,
  FEEDBACK_RECEIVED: 25,
  SKILL_ADDED: 10,
  PHOTO_UPLOADED: 25,
}

export const calculateLevel = (xp: number): number => {
  // Level formula: level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export const getXpForNextLevel = (currentLevel: number): number => {
  return Math.pow(currentLevel, 2) * 100
}

export const calculateProfileCompleteness = (user: any): number => {
  let completeness = 0
  const fields = [
    { field: "name", weight: 15 },
    { field: "bio", weight: 20 },
    { field: "location", weight: 10 },
    { field: "profilePhoto", weight: 15 },
    { field: "skillsOffered", weight: 20, isArray: true },
    { field: "skillsWanted", weight: 20, isArray: true },
  ]

  fields.forEach(({ field, weight, isArray }) => {
    const value = user[field]
    if (isArray) {
      if (value && Array.isArray(value) && value.length > 0) {
        completeness += weight
      }
    } else {
      if (value && value.toString().trim() !== "") {
        completeness += weight
      }
    }
  })

  return Math.min(completeness, 100)
}

export const checkBadgeEligibility = (user: any, stats: UserStats): string[] => {
  const newBadges: string[] = []

  BADGES.forEach((badge) => {
    if (stats.badges.includes(badge.id)) return // Already has badge

    switch (badge.id) {
      case "first_swap":
        if (stats.swapsCompleted >= 1) newBadges.push(badge.id)
        break
      case "five_swaps":
        if (stats.swapsCompleted >= 5) newBadges.push(badge.id)
        break
      case "ten_swaps":
        if (stats.swapsCompleted >= 10) newBadges.push(badge.id)
        break
      case "top_rated":
        if (user.rating >= 4.5 && stats.feedbackGiven >= 5) newBadges.push(badge.id)
        break
      case "helpful_reviewer":
        if (stats.feedbackGiven >= 10) newBadges.push(badge.id)
        break
      case "profile_complete":
        if (stats.profileCompleteness >= 100) newBadges.push(badge.id)
        break
      case "skill_teacher":
        if ((user.skillsOffered || []).length >= 5) newBadges.push(badge.id)
        break
    }
  })

  return newBadges
}
