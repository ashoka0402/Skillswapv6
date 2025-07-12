"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, X, Sparkles, Save, RotateCcw, Home, LogOut, Trophy, Edit } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import GamificationDashboard from "@/components/gamification-dashboard"
import AvatarSelector from "@/components/avatar-selector"
import { getAvatarById } from "@/lib/avatars"

export default function ProfilePage() {
  const { user, updateProfile, logout, loading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: "",
    skillsOffered: [] as string[],
    skillsWanted: [] as string[],
    availability: "",
    isPublic: true,
    avatar: "",
  })
  const [newSkillOffered, setNewSkillOffered] = useState("")
  const [newSkillWanted, setNewSkillWanted] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showGamification, setShowGamification] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      setFormData({
        name: user.name || "",
        location: user.location || "",
        bio: user.bio || "",
        skillsOffered: user.skillsOffered || [],
        skillsWanted: user.skillsWanted || [],
        availability: user.availability || "flexible",
        isPublic: user.isPublic,
        avatar: user.avatar || "",
      })
    }
  }, [user, loading, router])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateProfile(formData)
      setIsEditing(false)
      setShowAvatarSelector(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    }
    setIsSaving(false)
  }

  const handleDiscard = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        location: user.location || "",
        bio: user.bio || "",
        skillsOffered: user.skillsOffered || [],
        skillsWanted: user.skillsWanted || [],
        availability: user.availability || "flexible",
        isPublic: user.isPublic,
        avatar: user.avatar || "",
      })
    }
    setIsEditing(false)
    setShowAvatarSelector(false)
  }

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && !formData.skillsOffered.includes(newSkillOffered.trim())) {
      setFormData((prev) => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, newSkillOffered.trim()],
      }))
      setNewSkillOffered("")
    }
  }

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !formData.skillsWanted.includes(newSkillWanted.trim())) {
      setFormData((prev) => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, newSkillWanted.trim()],
      }))
      setNewSkillWanted("")
    }
  }

  const removeSkillOffered = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsOffered: prev.skillsOffered.filter((s) => s !== skill),
    }))
  }

  const removeSkillWanted = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsWanted: prev.skillsWanted.filter((s) => s !== skill),
    }))
  }

  const handleAvatarSelect = (avatarId: string) => {
    setFormData((prev) => ({ ...prev, avatar: avatarId }))
  }

  const getAvatarDisplay = () => {
    if (formData.avatar) {
      const avatar = getAvatarById(formData.avatar)
      return {
        image: avatar.url,
        fallback: user?.name.charAt(0),
        gradient: avatar.color,
      }
    }
    return {
      image: "/placeholder.svg",
      fallback: user?.name.charAt(0),
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

  if (!user) return null

  const avatarDisplay = getAvatarDisplay()

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
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Profile
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowGamification(!showGamification)}
                className="bg-white/50 hover:bg-white/80 border-purple-200"
                size="sm"
              >
                <Trophy className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Stats</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="bg-white/50 hover:bg-white/80 border-blue-200"
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button
                variant="outline"
                onClick={logout}
                className="bg-white/50 hover:bg-white/80 border-blue-200"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Gamification Dashboard */}
        {showGamification && <GamificationDashboard />}

        {/* Profile Card */}
        <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-blue-200">
                    <AvatarImage src={avatarDisplay.image || "/placeholder.svg"} />
                    <AvatarFallback className={`text-3xl bg-gradient-to-r ${avatarDisplay.gradient} text-white`}>
                      {avatarDisplay.fallback}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAvatarSelector(true)}
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 border-blue-200 text-xs px-2 py-1 h-6"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Change
                    </Button>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name}</CardTitle>
                  <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-2 text-gray-600">
                    {user.location && <span className="text-sm">{user.location}</span>}
                    <span className="text-sm">{user.rating.toFixed(1)} ⭐ rating</span>
                    {user.completedSwaps !== undefined && (
                      <span className="text-sm">{user.completedSwaps} swaps completed</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleDiscard}
                      className="bg-white/50 border-gray-200 w-full sm:w-auto"
                      size="sm"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Discard
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
                      size="sm"
                    >
                      {isSaving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
                    size="sm"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 sm:space-y-8">
            {/* Avatar Selector */}
            {showAvatarSelector && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <AvatarSelector
                  currentAvatar={formData.avatar}
                  userName={formData.name}
                  onAvatarSelect={handleAvatarSelect}
                />
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAvatarSelector(false)}
                    className="flex-1 bg-white/50 border-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setShowAvatarSelector(false)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Confirm Selection
                  </Button>
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-white/50 border-gray-200 focus:bg-white focus:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-700 font-medium">
                  Location (Optional)
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="City, State/Country"
                  className="bg-white/50 border-gray-200 focus:bg-white focus:border-blue-400"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700 font-medium">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
                placeholder="Tell others about yourself and your interests..."
                rows={4}
                className="bg-white/50 border-gray-200 focus:bg-white focus:border-blue-400"
              />
            </div>

            {/* Skills Offered */}
            <div className="space-y-4">
              <Label className="text-gray-700 font-medium text-lg">Skills I Can Teach</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.skillsOffered.map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-2 px-3 py-1"
                  >
                    {skill}
                    {isEditing && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => removeSkillOffered(skill)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={newSkillOffered}
                    onChange={(e) => setNewSkillOffered(e.target.value)}
                    placeholder="Add a skill you can teach"
                    onKeyPress={(e) => e.key === "Enter" && addSkillOffered()}
                    className="bg-white/50 border-gray-200 focus:bg-white focus:border-blue-400 flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={addSkillOffered}
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              )}
            </div>

            {/* Skills Wanted */}
            <div className="space-y-4">
              <Label className="text-gray-700 font-medium text-lg">Skills I Want to Learn</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.skillsWanted.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="border-purple-200 text-purple-700 flex items-center gap-2 px-3 py-1"
                  >
                    {skill}
                    {isEditing && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => removeSkillWanted(skill)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    placeholder="Add a skill you want to learn"
                    onKeyPress={(e) => e.key === "Enter" && addSkillWanted()}
                    className="bg-white/50 border-gray-200 focus:bg-white focus:border-blue-400 flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={addSkillWanted}
                    className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label htmlFor="availability" className="text-gray-700 font-medium">
                Availability
              </Label>
              <Select
                value={formData.availability}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, availability: value }))}
                disabled={!isEditing}
              >
                <SelectTrigger className="bg-white/50 border-gray-200 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                  <SelectItem value="evenings">Evenings</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Privacy */}
            <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div>
                <Label htmlFor="public-profile" className="text-gray-700 font-medium text-base sm:text-lg">
                  Public Profile
                </Label>
                <p className="text-sm text-gray-600 mt-1">Allow others to see your profile and send swap requests</p>
              </div>
              <Switch
                id="public-profile"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked }))}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
