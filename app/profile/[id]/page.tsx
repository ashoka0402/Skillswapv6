"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Clock, Sparkles, Home, MessageCircle, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import SwapRequestModal from "@/components/swap-request-modal"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [profileUser, setProfileUser] = useState<any>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUserProfile()
  }, [params.id])

  const fetchUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", params.id))
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() }
        if (userData.isPublic || user?.isAdmin) {
          setProfileUser(userData)
        } else {
          setError("This profile is private")
        }
      } else {
        setError("Profile not found")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSwap = () => {
    if (!user) {
      alert("Please log in to send swap requests")
      return
    }
    setShowRequestModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <Card className="bg-card border border-border shadow-xl max-w-md w-full">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              {error === "This profile is private" ? "Private Profile" : "Profile Not Found"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {error === "This profile is private"
                ? "This user has set their profile to private."
                : "This profile doesn't exist or has been removed."}
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Enhanced Header */}
      <header className="bg-card/80 backdrop-blur-md shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                User Profile
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="bg-background hover:bg-accent border-border"
              size="sm"
            >
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="bg-card border border-border shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-blue-200 mx-auto sm:mx-0">
                  <AvatarImage src={profileUser.profilePhoto || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl sm:text-3xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {profileUser.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {profileUser.name}
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-muted-foreground">
                    {profileUser.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm sm:text-base">{profileUser.location}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm sm:text-base">{(profileUser.rating || 5.0).toFixed(1)} rating</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="capitalize text-sm sm:text-base">{profileUser.availability}</span>
                    </div>
                  </div>
                  {profileUser.createdAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Member since {new Date(profileUser.createdAt.seconds * 1000).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                {user && user.id !== profileUser.id && (
                  <Button
                    onClick={handleRequestSwap}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Request Swap
                  </Button>
                )}
                {user?.isAdmin && (
                  <Button
                    variant="outline"
                    className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 w-full sm:w-auto"
                    onClick={() => {
                      // Admin actions would go here
                      alert("Admin actions: Ban user, moderate content, etc.")
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Actions
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Bio */}
            {profileUser.bio && (
              <div className="bg-muted p-6 rounded-xl border border-border">
                <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                  About
                </h3>
                <p className="text-muted-foreground leading-relaxed">{profileUser.bio}</p>
              </div>
            )}
            {/* Skills Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Skills Offered */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  Skills I Can Teach
                  <Badge className="ml-2 bg-primary/10 text-primary border-primary/20">
                    {(profileUser.skillsOffered || []).length}
                  </Badge>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(profileUser.skillsOffered || []).length > 0 ? (
                    (profileUser.skillsOffered || []).map((skill: string, index: number) => (
                      <Badge key={index} className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">No skills offered yet</p>
                  )}
                </div>
              </div>
              {/* Skills Wanted */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  Skills I Want to Learn
                  <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                    {(profileUser.skillsWanted || []).length}
                  </Badge>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(profileUser.skillsWanted || []).length > 0 ? (
                    (profileUser.skillsWanted || []).map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="border-purple-400 text-purple-300 px-3 py-1">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">No learning goals specified yet</p>
                  )}
                </div>
              </div>
            </div>
            {/* Stats Section */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-muted p-4 rounded-lg text-center border border-border">
                <div className="text-2xl font-bold text-foreground mb-1">{profileUser.completedSwaps || 0}</div>
                <div className="text-sm text-muted-foreground">Swaps</div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center border border-border">
                <div className="text-2xl font-bold text-foreground mb-1">{profileUser.rating || 5.0}</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center border border-border">
                <div className="text-2xl font-bold text-foreground mb-1">{(profileUser.skillsOffered || []).length}</div>
                <div className="text-sm text-muted-foreground">Skills Offered</div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center border border-border">
                <div className="text-2xl font-bold text-foreground mb-1">{(profileUser.skillsWanted || []).length}</div>
                <div className="text-sm text-muted-foreground">Skills Wanted</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
