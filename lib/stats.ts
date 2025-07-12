// User statistics calculation system
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "./firebase"

export interface UserStats {
  completedSwaps: number
  averageRating: number
  totalRatings: number
  acceptanceRate: number
  totalRequestsSent: number
  totalRequestsReceived: number
  totalRequestsAccepted: number
}

export const calculateUserStats = async (userId: string): Promise<UserStats> => {
  try {
    // Get all swap requests involving this user
    const sentQuery = query(collection(db, "swapRequests"), where("senderId", "==", userId))
    const receivedQuery = query(collection(db, "swapRequests"), where("receiverId", "==", userId))

    const [sentSnapshot, receivedSnapshot] = await Promise.all([getDocs(sentQuery), getDocs(receivedQuery)])

    const sentRequests = sentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const receivedRequests = receivedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    // Calculate stats
    const totalRequestsSent = sentRequests.length
    const totalRequestsReceived = receivedRequests.length
    const totalRequestsAccepted = receivedRequests.filter(
      (req) => req.status === "accepted" || req.status === "completed",
    ).length

    // Count completed swaps (where user was either sender or receiver)
    const completedSwaps = [
      ...sentRequests.filter((req) => req.status === "completed"),
      ...receivedRequests.filter((req) => req.status === "completed"),
    ].length

    // Calculate average rating from completed swaps where user received feedback
    const ratingsReceived = [
      ...sentRequests.filter((req) => req.status === "completed" && req.senderRating),
      ...receivedRequests.filter((req) => req.status === "completed" && req.receiverRating),
    ]

    const totalRatings = ratingsReceived.length
    const averageRating =
      totalRatings > 0
        ? ratingsReceived.reduce((sum, req) => {
            const rating = req.senderId === userId ? req.senderRating?.rating : req.receiverRating?.rating
            return sum + (rating || 0)
          }, 0) / totalRatings
        : 5.0

    // Calculate acceptance rate
    const acceptanceRate = totalRequestsReceived > 0 ? (totalRequestsAccepted / totalRequestsReceived) * 100 : 0

    return {
      completedSwaps,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings,
      acceptanceRate: Math.round(acceptanceRate),
      totalRequestsSent,
      totalRequestsReceived,
      totalRequestsAccepted,
    }
  } catch (error) {
    console.error("Error calculating user stats:", error)
    return {
      completedSwaps: 0,
      averageRating: 5.0,
      totalRatings: 0,
      acceptanceRate: 0,
      totalRequestsSent: 0,
      totalRequestsReceived: 0,
      totalRequestsAccepted: 0,
    }
  }
}

export const updateUserRating = async (userId: string) => {
  try {
    const stats = await calculateUserStats(userId)
    await updateDoc(doc(db, "users", userId), {
      rating: stats.averageRating,
      completedSwaps: stats.completedSwaps,
      lastStatsUpdate: new Date(),
    })
  } catch (error) {
    console.error("Error updating user rating:", error)
  }
}
