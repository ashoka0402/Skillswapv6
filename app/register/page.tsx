"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Sparkles, Eye, EyeOff, Check } from "lucide-react"
import AvatarSelector from "@/components/avatar-selector"
import { getDefaultAvatar } from "@/lib/avatars"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1) // 1: Basic info, 2: Avatar selection
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleAvatarSelect = (avatarId: string) => {
    setFormData((prev) => ({ ...prev, avatar: avatarId }))
  }

  const passwordRequirements = [
    { text: "At least 6 characters", met: formData.password.length >= 6 },
    { text: "Contains a number", met: /\d/.test(formData.password) },
    { text: "Contains a letter", met: /[a-zA-Z]/.test(formData.password) },
  ]

  const handleNextStep = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please fill in all required fields")
      return
    }

    setError("")
    setStep(2)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Use default avatar if none selected
      const selectedAvatar = formData.avatar || getDefaultAvatar(formData.name).id

      await register({
        ...formData,
        avatar: selectedAvatar,
      })
      router.push("/profile")
    } catch (error: any) {
      setError(error.message)
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SkillSwap
            </h1>
          </div>
        </div>

        <Card className="bg-white/70 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {step === 1 ? "Join SkillSwap" : "Choose Your Avatar"}
            </CardTitle>
            <p className="text-gray-600">
              {step === 1 ? "Create your account to start swapping skills" : "Pick an avatar to represent yourself"}
            </p>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-300"}`}></div>
                <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`}></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="bg-white/50 border-gray-200 focus:bg-white focus:border-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="bg-white/50 border-gray-200 focus:bg-white focus:border-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Create a password"
                      className="bg-white/50 border-gray-200 focus:bg-white focus:border-blue-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="space-y-1 mt-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <Check className={`h-3 w-3 mr-2 ${req.met ? "text-green-500" : "text-gray-300"}`} />
                          <span className={req.met ? "text-green-600" : "text-gray-500"}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm your password"
                      className="bg-white/50 border-gray-200 focus:bg-white focus:border-blue-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleNextStep}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
                >
                  Next: Choose Avatar
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <AvatarSelector
                  currentAvatar={formData.avatar}
                  userName={formData.name}
                  onAvatarSelect={handleAvatarSelect}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white/50 border-gray-200 hover:bg-white"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-sm text-gray-600">Already have an account? </span>
                  <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Sign in
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs text-gray-600">Find Perfect Matches</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-2xl mb-1">🚀</div>
            <div className="text-xs text-gray-600">Learn New Skills</div>
          </div>
        </div>
      </div>
    </div>
  )
}
