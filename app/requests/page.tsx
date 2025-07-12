"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Clock, CheckCircle, XCircle, Trash2, Sparkles, Home, ArrowRight, Check } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import SwapCompletionModal from "@/components/swap-completion-modal"
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { updateUserRating } from "@/lib/stats"
import { getAvatarById } from "@/lib/avatars"

export default function RequestsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<any[]>([])
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [loadingRequests, setLoadingRequests] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchRequests()
    }
  }, [user, loading, router])

  const fetchRequests = async () => {
    if (!user) return

    try {
      // Fetch sent requests
      const sentQuery = query(collection(db, "swapRequests"), where("senderId", "==", user.id))
      const sentSnapshot = await getDocs(sentQuery)
      const sentRequests = sentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Fetch received requests
      const receivedQuery = query(collection(db, "swapRequests"), where("receiverId", "==", user.id))
      const receivedSnapshot = await getDocs(receivedQuery)
      const receivedRequests = receivedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setRequests([...sentRequests, ...receivedRequests])
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoadingRequests(false)
    }
  }

  const sentRequests = requests.filter((req) => req.senderId === user?.id)
  const receivedRequests = requests.filter((req) => req.receiverId === user?.id)

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "swapRequests", requestId), {
        status: "accepted",
        acceptedAt: new Date(),
      })
      setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "accepted" } : req)))
    } catch (error) {
      console.error("Error accepting request:", error)
      alert("Failed to accept request. Please try again.")
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "swapRequests", requestId), {
        status: "rejected",
        rejectedAt: new Date(),
      })
      setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" } : req)))
    } catch (error) {
      console.error("Error rejecting request:", error)
      alert("Failed to reject request. Please try again.")
    }
  }

  const handleMarkCompleted = async (requestId: string) => {
    try {
      const request = requests.find((req) => req.id === requestId)
      if (!request) return

      const updateField = user?.id === request.senderId ? "senderCompleted" : "receiverCompleted"
      const otherField = user?.id === request.senderId ? "receiverCompleted" : "senderCompleted"

      await updateDoc(doc(db, "swapRequests", requestId), {
        [updateField]: true,
        [`${updateField}At`]: new Date(),
      })

      // Check if both parties have marked as completed
      const updatedRequest = { ...request, [updateField]: true }
      if (updatedRequest.senderCompleted && updatedRequest.receiverCompleted) {
        await updateDoc(doc(db, "swapRequests", requestId), {
          status: "completed",
          completedAt: new Date(),
        })
        updatedRequest.status = "completed"
      }

      setRequests((prev) => prev.map((req) => (req.id === requestId ? updatedRequest : req)))

      // If both completed, show rating modal
      if (updatedRequest.status === "completed") {
        setSelectedRequest(updatedRequest)
        setShowCompletionModal(true)
      }
    } catch (error) {
      console.error("Error marking request as completed:", error)
      alert("Failed to mark as completed. Please try again.")
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, "swapRequests", requestId))
      setRequests((prev) => prev.filter((req) => req.id !== requestId))
    } catch (error) {
      console.error("Error deleting request:", error)
      alert("Failed to delete request. Please try again.")
    }
  }

  const handleSubmitRating = async (rating: number, feedback: string) => {
    if (!selectedRequest || !user) return

    try {
      const ratingField = user.id === selectedRequest.senderId ? "senderRating" : "receiverRating"
      const otherUserId = user.id === selectedRequest.senderId ? selectedRequest.receiverId : selectedRequest.senderId

      await updateDoc(doc(db, "swapRequests", selectedRequest.id), {
        [ratingField]: { rating, feedback, ratedAt: new Date() },
      })

      // Update user ratings
      await updateUserRating(otherUserId)
      await updateUserRating(user.id)

      setRequests((prev) =>
        prev.map((req) => (req.id === selectedRequest.id ? { ...req, [ratingField]: { rating, feedback } } : req)),
      )

      setShowCompletionModal(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error("Error submitting rating:", error)
      alert("Failed to submit rating. Please try again.")
    }
  }

  const RequestCard = ({ request, type }: { request: any; type: "sent" | "received" }) => {
    const otherUserName = type === "sent" ? request.receiverName : request.senderName
    const otherUserPhoto = type === "sent" ? request.receiverPhoto : request.senderPhoto
    const otherUserAvatar = type === "sent" ? request.receiverAvatar : request.senderAvatar

    const currentUserCompleted = user?.id === request.senderId ? request.senderCompleted : request.receiverCompleted
    const otherUserCompleted = user?.id === request.senderId ? request.receiverCompleted : request.senderCompleted
    const currentUserRated = user?.id === request.senderId ? request.senderRating : request.receiverRating

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "pending":
          return <Clock className="h-4 w-4 text-yellow-500" />
        case "accepted":
          return <CheckCircle className="h-4 w-4 text-green-500" />
        case "completed":
          return <Star className="h-4 w-4 text-blue-500" />
        case "rejected":
          return <XCircle className="h-4 w-4 text-red-500" />
        default:
          return null
      }
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800 border-yellow-200"
        case "accepted":
          return "bg-green-100 text-green-800 border-green-200"
        case "completed":
          return "bg-blue-100 text-blue-800 border-blue-200"
        case "rejected":
          return "bg-red-100 text-red-800 border-red-200"
        default:
          return "bg-gray-100 text-gray-800 border-gray-200"
      }
    }

    const getAvatarDisplay = () => {
      if (otherUserAvatar) {
        const avatar = getAvatarById(otherUserAvatar)
        return {
          image: avatar.url,
          fallback: otherUserName?.charAt(0),
          gradient: avatar.color,
        }
      }
      return {
        image: otherUserPhoto || "/placeholder.svg",
        fallback: otherUserName?.charAt(0),
        gradient: "from-blue-500 to-purple-500",
      }
    }

    const avatarDisplay = getAvatarDisplay()

    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-14 w-14 ring-2 ring-blue-200">
              <AvatarImage src={avatarDisplay.image || "/placeholder.svg"} />
              <AvatarFallback className={`bg-gradient-to-r ${avatarDisplay.gradient} text-white`}>
                {avatarDisplay.fallback}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-900 truncate">{otherUserName}</h3>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${getStatusColor(request.status)}`}
                >
                  {getStatusIcon(request.status)}
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-3">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {type === "sent" ? request.senderSkill : request.receiverSkill}
                </Badge>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <Badge variant="outline" className="border-purple-200 text-purple-700">
                  {type === "sent" ? request.receiverSkill : request.senderSkill}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">{request.message}</p>

              {/* Completion Status */}
              {request.status === "accepted" && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-blue-800">Completion Status:</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Check
                          className={`h-4 w-4 mr-1 ${currentUserCompleted ? "text-green-600" : "text-gray-400"}`}
                        />
                        <span className={currentUserCompleted ? "text-green-600" : "text-gray-600"}>You</span>
                      </div>
                      <div className="flex items-center">
                        <Check className={`h-4 w-4 mr-1 ${otherUserCompleted ? "text-green-600" : "text-gray-400"}`} />
                        <span className={otherUserCompleted ? "text-green-600" : "text-gray-600"}>{otherUserName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {request.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                </span>

                <div className="flex space-x-2">
                  {type === "received" && request.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-white/50 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        Accept
                      </Button>
                    </>
                  )}

                  {request.status === "accepted" && !currentUserCompleted && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkCompleted(request.id)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark Completed
                    </Button>
                  )}

                  {request.status === "completed" && !currentUserRated && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request)
                        setShowCompletionModal(true)
                      }}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Rate Experience
                    </Button>
                  )}

                  {(request.status === "rejected" || request.status === "pending") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteRequest(request.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {currentUserRated && (
                <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-semibold text-green-800">Your Rating: {currentUserRated.rating}/5</span>
                  </div>
                  {currentUserRated.feedback && <p className="text-sm text-green-700">{currentUserRated.feedback}</p>}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading || loadingRequests) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Swap Requests
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="bg-white/50 hover:bg-white/80 border-blue-200"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="received" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Received ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {receivedRequests.length === 0 ? (
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">📬</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests received yet</h3>
                  <p className="text-gray-600 mb-6">
                    When others want to swap skills with you, their requests will appear here.
                  </p>
                  <Button
                    onClick={() => router.push("/")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Browse Skills
                  </Button>
                </CardContent>
              </Card>
            ) : (
              receivedRequests.map((request) => <RequestCard key={request.id} request={request} type="received" />)
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentRequests.length === 0 ? (
              <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests sent yet</h3>
                  <p className="text-gray-600 mb-6">Start connecting with others by sending your first swap request!</p>
                  <Button
                    onClick={() => router.push("/")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Find Skills to Learn
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sentRequests.map((request) => <RequestCard key={request.id} request={request} type="sent" />)
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Swap Completion Modal */}
      {showCompletionModal && selectedRequest && (
        <SwapCompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          request={selectedRequest}
          currentUserId={user?.id || ""}
          onSubmit={handleSubmitRating}
        />
      )}
    </div>
  )
}
