"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Star, MapPin, Clock, Sparkles, TrendingUp, Users, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import SwapRequestModal from "@/components/swap-request-modal"
import AnnouncementBanner from "@/components/announcement-banner"
import { collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getAvatarById } from "@/lib/avatars"

export default function HomePage() {
  const { user, loading } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const itemsPerPage = 6

  useEffect(() => {
    fetchUsers()
  }, [user])

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, "users"), where("isPublic", "==", true), limit(50))
      const querySnapshot = await getDocs(usersQuery)
      const fetchedUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Filter out admin users and current user
      const filteredUsers = fetchedUsers.filter((u) => u.id !== user?.id && !u.isAdmin)

      setUsers(filteredUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Filter users based on search and availability
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      searchTerm === "" ||
      u.skillsOffered?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.skillsWanted?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAvailability = availabilityFilter === "all" || u.availability === availabilityFilter

    return matchesSearch && matchesAvailability
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  const handleRequestSwap = (targetUser: any) => {
    if (!user) {
      alert("Please log in to send swap requests")
      return
    }
    setSelectedUser(targetUser)
    setShowRequestModal(true)
  }

  const getAvatarDisplay = (profile: any) => {
    if (profile.avatar) {
      const avatar = getAvatarById(profile.avatar)
      return {
        image: avatar.url,
        fallback: profile.name.charAt(0),
        gradient: avatar.color,
      }
    }
    return {
      image: profile.profilePhoto || "/placeholder.svg",
      fallback: profile.name.charAt(0),
      gradient: "from-blue-500 to-purple-500",
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillSwap
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link href="/profile">
                    {(() => {
                      const avatarDisplay = getAvatarDisplay(user)
                      return (
                        <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-blue-200 hover:ring-blue-300 transition-all">
                          <AvatarImage src={avatarDisplay.image || "/placeholder.svg"} />
                          <AvatarFallback className={`bg-gradient-to-r ${avatarDisplay.gradient} text-white`}>
                            {avatarDisplay.fallback}
                          </AvatarFallback>
                        </Avatar>
                      )
                    })()}
                  </Link>
                  <Link href="/requests">
                    <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white/80 border-blue-200">
                      Requests
                    </Button>
                  </Link>
                  {user.isAdmin && (
                    <Link href="/admin">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                      >
                        Admin
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white/80 border-blue-200">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Announcements */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <AnnouncementBanner />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
            <TrendingUp className="h-4 w-4 mr-2" />
            Join thousands of skill swappers worldwide
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Exchange Skills,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Grow Together
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with talented individuals, share your expertise, and learn new skills through our vibrant community
            platform.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="bg-white/50 hover:bg-white/80 border-blue-200 px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <div className="text-2xl font-bold">{users.length}+</div>
              <div className="text-blue-100">Active Members</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <div className="text-2xl font-bold">500+</div>
              <div className="text-purple-100">Skills Available</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <div className="text-2xl font-bold">4.9</div>
              <div className="text-green-100">Average Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by skills or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 border-gray-200 focus:bg-white"
            />
          </div>
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white/50 border-gray-200">
              <SelectValue placeholder="Filter by availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Availability</SelectItem>
              <SelectItem value="weekdays">Weekdays</SelectItem>
              <SelectItem value="weekends">Weekends</SelectItem>
              <SelectItem value="evenings">Evenings</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User Cards Grid */}
        {loadingUsers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedUsers.map((profile) => {
              const avatarDisplay = getAvatarDisplay(profile)
              return (
                <Card
                  key={profile.id}
                  className="group hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/90"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-14 w-14 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all">
                        <AvatarImage src={avatarDisplay.image || "/placeholder.svg"} />
                        <AvatarFallback className={`bg-gradient-to-r ${avatarDisplay.gradient} text-white text-lg`}>
                          {avatarDisplay.fallback}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {profile.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          {profile.location && (
                            <div className="flex items-center mr-3">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">{profile.location}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                            <span>{(profile.rating || 5.0).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Skills Offered</h4>
                        <div className="flex flex-wrap gap-1">
                          {(profile.skillsOffered || []).slice(0, 3).map((skill: string, index: number) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {(profile.skillsOffered || []).length > 3 && (
                            <Badge variant="outline" className="text-xs border-blue-200">
                              +{(profile.skillsOffered || []).length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Skills Wanted</h4>
                        <div className="flex flex-wrap gap-1">
                          {(profile.skillsWanted || []).slice(0, 3).map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs border-purple-200 text-purple-700">
                              {skill}
                            </Badge>
                          ))}
                          {(profile.skillsWanted || []).length > 3 && (
                            <Badge variant="outline" className="text-xs border-purple-200">
                              +{(profile.skillsWanted || []).length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span className="capitalize">{profile.availability}</span>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Link href={`/profile/${profile.id}`} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-white/50 hover:bg-white border-gray-200"
                          >
                            View Profile
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={() => handleRequestSwap(profile)}
                        >
                          Request Swap
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-white/50 border-gray-200"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-white/50 border-gray-200"
            >
              Next
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loadingUsers && filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-gray-500 mb-4 text-lg">No users found matching your criteria</div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setAvailabilityFilter("all")
                }}
                className="bg-white/50 border-gray-200"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Swap Request Modal */}
      {showRequestModal && selectedUser && (
        <SwapRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          targetUser={selectedUser}
          currentUser={user}
        />
      )}
    </div>
  )
}
