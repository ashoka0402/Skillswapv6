"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  MessageSquare,
  BarChart3,
  Ban,
  Send,
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Eye,
  UserX,
  UserCheck,
  Sparkles,
  Home,
  Info,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { collection, query, getDocs, updateDoc, doc, deleteDoc, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createAnnouncement } from "@/lib/announcements"

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [announcement, setAnnouncement] = useState("")
  const [announcementType, setAnnouncementType] = useState<"info" | "warning" | "success" | "error">("info")
  const [announcementPriority, setAnnouncementPriority] = useState<"low" | "medium" | "high">("medium")
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [banReason, setBanReason] = useState("")
  const [loadingData, setLoadingData] = useState(true)
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push("/")
      return
    }

    if (user?.isAdmin) {
      fetchAdminData()
    }
  }, [user, loading, router])

  const fetchAdminData = async () => {
    try {
      // Fetch all users
      const usersQuery = query(collection(db, "users"))
      const usersSnapshot = await getDocs(usersQuery)
      const fetchedUsers = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setUsers(fetchedUsers)

      // Fetch all swap requests
      const requestsQuery = query(collection(db, "swapRequests"), orderBy("createdAt", "desc"))
      const requestsSnapshot = await getDocs(requestsQuery)
      const fetchedRequests = requestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setRequests(fetchedRequests)
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleBanUser = async (userId: string, reason: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isBanned: true,
        banReason: reason,
        bannedAt: new Date(),
        bannedBy: user?.id,
      })

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBanned: true, banReason: reason } : u)))

      setShowBanModal(false)
      setBanReason("")
      setSelectedUser(null)
    } catch (error) {
      console.error("Error banning user:", error)
      alert("Failed to ban user. Please try again.")
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isBanned: false,
        banReason: "",
        unbannedAt: new Date(),
        unbannedBy: user?.id,
      })

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBanned: false, banReason: "" } : u)))
    } catch (error) {
      console.error("Error unbanning user:", error)
      alert("Failed to unban user. Please try again.")
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return

    try {
      await deleteDoc(doc(db, "swapRequests", requestId))
      setRequests((prev) => prev.filter((req) => req.id !== requestId))
    } catch (error) {
      console.error("Error deleting request:", error)
      alert("Failed to delete request. Please try again.")
    }
  }

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) {
      alert("Please enter an announcement message")
      return
    }

    setSendingAnnouncement(true)
    try {
      await createAnnouncement({
        message: announcement.trim(),
        type: announcementType,
        priority: announcementPriority,
        sentBy: user?.id || "",
        isActive: true,
      })

      alert("Announcement sent successfully! Users will see it on their homepage.")
      setAnnouncement("")
      setAnnouncementType("info")
      setAnnouncementPriority("medium")
      setShowAnnouncementModal(false)
    } catch (error) {
      console.error("Error sending announcement:", error)
      alert("Failed to send announcement. Please try again.")
    } finally {
      setSendingAnnouncement(false)
    }
  }

  const handleDownloadReport = (type: string) => {
    let data = ""
    let filename = ""

    switch (type) {
      case "users":
        data = `User Activity Report\nGenerated: ${new Date().toLocaleString()}\n\nTotal Users: ${users.length}\nActive Users: ${users.filter((u) => !u.isBanned).length}\nBanned Users: ${users.filter((u) => u.isBanned).length}\nPublic Profiles: ${users.filter((u) => u.isPublic).length}\n\nUser Details:\n${users.map((u) => `${u.name} (${u.email}) - ${u.isBanned ? "BANNED" : "Active"} - Skills: ${(u.skillsOffered || []).length} offered, ${(u.skillsWanted || []).length} wanted`).join("\n")}`
        filename = "users-report.txt"
        break
      case "swaps":
        data = `Swap Requests Report\nGenerated: ${new Date().toLocaleString()}\n\nTotal Requests: ${requests.length}\nPending: ${requests.filter((r) => r.status === "pending").length}\nAccepted: ${requests.filter((r) => r.status === "accepted").length}\nRejected: ${requests.filter((r) => r.status === "rejected").length}\n\nRequest Details:\n${requests.map((r) => `${r.senderName} → ${r.receiverName}: ${r.senderSkill} ↔ ${r.receiverSkill} (${r.status}) - ${r.createdAt?.toDate?.()?.toLocaleDateString() || "Date unknown"}`).join("\n")}`
        filename = "swaps-report.txt"
        break
      case "feedback":
        const ratedRequests = requests.filter((r) => r.rating)
        const avgRating =
          ratedRequests.length > 0
            ? (ratedRequests.reduce((acc, r) => acc + r.rating.rating, 0) / ratedRequests.length).toFixed(1)
            : "N/A"
        data = `Feedback Report\nGenerated: ${new Date().toLocaleString()}\n\nTotal Reviews: ${ratedRequests.length}\nAverage Rating: ${avgRating}\n5-Star Reviews: ${ratedRequests.filter((r) => r.rating.rating === 5).length}\n4-Star Reviews: ${ratedRequests.filter((r) => r.rating.rating === 4).length}\n3-Star Reviews: ${ratedRequests.filter((r) => r.rating.rating === 3).length}\n2-Star Reviews: ${ratedRequests.filter((r) => r.rating.rating === 2).length}\n1-Star Reviews: ${ratedRequests.filter((r) => r.rating.rating === 1).length}\n\nFeedback Details:\n${ratedRequests.map((r) => `${r.rating.rating}/5 - "${r.rating.feedback || "No feedback"}" - ${r.senderName} → ${r.receiverName}`).join("\n")}`
        filename = "feedback-report.txt"
        break
    }

    const blob = new Blob([data], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user?.isAdmin) return null

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => !u.isBanned).length,
    bannedUsers: users.filter((u) => u.isBanned).length,
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === "pending").length,
    acceptedRequests: requests.filter((r) => r.status === "accepted").length,
    averageRating:
      requests.filter((r) => r.rating).length > 0
        ? (
            requests.filter((r) => r.rating).reduce((acc, r) => acc + r.rating.rating, 0) /
            requests.filter((r) => r.rating).length
          ).toFixed(1)
        : "N/A",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 p-2 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Dialog open={showAnnouncementModal} onOpenChange={setShowAnnouncementModal}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto">
                    <Send className="h-4 w-4 mr-2" />
                    Send Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 backdrop-blur-md border-white/20 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                      Send Platform Announcement
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="announcement-type">Type</Label>
                      <Select value={announcementType} onValueChange={(value: any) => setAnnouncementType(value)}>
                        <SelectTrigger className="bg-white/50 border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">
                            <div className="flex items-center">
                              <Info className="h-4 w-4 mr-2 text-blue-600" />
                              Information
                            </div>
                          </SelectItem>
                          <SelectItem value="warning">
                            <div className="flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                              Warning
                            </div>
                          </SelectItem>
                          <SelectItem value="success">
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Success
                            </div>
                          </SelectItem>
                          <SelectItem value="error">
                            <div className="flex items-center">
                              <XCircle className="h-4 w-4 mr-2 text-red-600" />
                              Error
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="announcement-priority">Priority</Label>
                      <Select
                        value={announcementPriority}
                        onValueChange={(value: any) => setAnnouncementPriority(value)}
                      >
                        <SelectTrigger className="bg-white/50 border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="announcement">Message</Label>
                      <Textarea
                        id="announcement"
                        placeholder="Type your announcement here..."
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                        rows={4}
                        className="bg-white/50 border-gray-200 focus:bg-white focus:border-blue-400"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAnnouncementModal(false)}
                        className="flex-1 bg-white/50 border-gray-200"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSendAnnouncement}
                        disabled={sendingAnnouncement}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {sendingAnnouncement ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </div>
                        ) : (
                          "Send to All Users"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="bg-white/50 hover:bg-white/80 border-blue-200 w-full sm:w-auto"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4 sm:p-6 text-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-80" />
              <div className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-xs sm:text-sm text-blue-100">Total Users</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4 sm:p-6 text-center">
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-80" />
              <div className="text-xl sm:text-2xl font-bold">{stats.activeUsers}</div>
              <div className="text-xs sm:text-sm text-green-100">Active Users</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4 sm:p-6 text-center">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-80" />
              <div className="text-xl sm:text-2xl font-bold">{stats.totalRequests}</div>
              <div className="text-xs sm:text-sm text-purple-100">Swap Requests</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
            <CardContent className="p-4 sm:p-6 text-center">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-80" />
              <div className="text-xl sm:text-2xl font-bold">{stats.averageRating}</div>
              <div className="text-xs sm:text-sm text-yellow-100">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              User Management
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Content Moderation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Management
                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                    {users.filter((u) => !u.isAdmin).length} users
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users
                    .filter((u) => !u.isAdmin)
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-white/50 space-y-3 sm:space-y-0"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <Avatar className="h-10 w-10 ring-2 ring-gray-200">
                            <AvatarImage src={user.profilePhoto || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{user.name}</h3>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant={user.isPublic ? "secondary" : "outline"} className="text-xs">
                                {user.isPublic ? "Public" : "Private"}
                              </Badge>
                              {user.isBanned && (
                                <Badge variant="destructive" className="text-xs">
                                  Banned
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {user.skillsOffered?.length || 0} skills offered
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/profile/${user.id}`)}
                            className="bg-white/50 border-blue-200 text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {user.isBanned ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanUser(user.id)}
                              className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100 flex-1 sm:flex-none"
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Unban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowBanModal(true)
                              }}
                              className="flex-1 sm:flex-none"
                            >
                              <Ban className="h-3 w-3 mr-1" />
                              Ban
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Content Moderation
                  <Badge className="ml-2 bg-purple-100 text-purple-800">{requests.length} requests</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.slice(0, 10).map((request) => {
                    const getStatusIcon = (status: string) => {
                      switch (status) {
                        case "pending":
                          return <Clock className="h-4 w-4 text-yellow-500" />
                        case "accepted":
                          return <CheckCircle className="h-4 w-4 text-green-500" />
                        case "rejected":
                          return <XCircle className="h-4 w-4 text-red-500" />
                        default:
                          return null
                      }
                    }

                    return (
                      <div key={request.id} className="p-4 border rounded-lg bg-white/50">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{request.senderName}</span>
                            <span className="text-gray-500">→</span>
                            <span className="font-medium text-gray-900">{request.receiverName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                request.status === "accepted"
                                  ? "default"
                                  : request.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="flex items-center gap-1"
                            >
                              {getStatusIcon(request.status)}
                              {request.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteRequest(request.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">{request.message}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800">{request.senderSkill}</Badge>
                          <span className="text-gray-400">↔</span>
                          <Badge variant="outline" className="border-purple-200 text-purple-700">
                            {request.receiverSkill}
                          </Badge>
                          <span className="text-xs text-gray-500 ml-auto">
                            {request.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reports Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Reports & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">User Activity Report</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Users:</span>
                    <span className="font-medium">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Users:</span>
                    <span className="font-medium text-green-600">{stats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Banned Users:</span>
                    <span className="font-medium text-red-600">{stats.bannedUsers}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleDownloadReport("users")}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download Report
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Swap Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Requests:</span>
                    <span className="font-medium">{stats.totalRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accepted:</span>
                    <span className="font-medium text-green-600">{stats.acceptedRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium">
                      {stats.totalRequests > 0 ? Math.round((stats.acceptedRequests / stats.totalRequests) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => handleDownloadReport("swaps")}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download Report
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Feedback Analytics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Reviews:</span>
                    <span className="font-medium">{requests.filter((r) => r.rating).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Rating:</span>
                    <span className="font-medium text-yellow-600">{stats.averageRating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>5-Star Reviews:</span>
                    <span className="font-medium text-green-600">
                      {requests.filter((r) => r.rating?.rating === 5).length}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => handleDownloadReport("feedback")}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Ban User Modal */}
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Ban User: {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action will immediately ban the user from the platform. They will not be
                able to log in or access any features.
              </p>
            </div>
            <div>
              <Label htmlFor="banReason">Reason for Ban</Label>
              <Textarea
                id="banReason"
                placeholder="Please provide a reason for banning this user..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                className="bg-white/50 border-gray-200 focus:bg-white focus:border-red-400"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBanModal(false)
                  setBanReason("")
                  setSelectedUser(null)
                }}
                className="flex-1 bg-white/50 border-gray-200"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleBanUser(selectedUser?.id, banReason)}
                disabled={!banReason.trim()}
                className="flex-1"
              >
                <UserX className="h-4 w-4 mr-2" />
                Ban User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
