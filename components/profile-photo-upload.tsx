"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X, AlertCircle } from "lucide-react"
import { openCloudinaryWidget, uploadFileDirectly } from "@/lib/cloudinary"

interface ProfilePhotoUploadProps {
  currentPhoto?: string
  userName: string
  onPhotoUpdate: (photoUrl: string) => void
  disabled?: boolean
}

export default function ProfilePhotoUpload({
  currentPhoto,
  userName,
  onPhotoUpdate,
  disabled = false,
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentPhoto)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCloudinaryUpload = async () => {
    if (disabled) return

    setIsUploading(true)
    setError("")

    try {
      const photoUrl = await openCloudinaryWidget()
      setPreviewUrl(photoUrl)
      onPhotoUpdate(photoUrl)
    } catch (error: any) {
      console.error("Cloudinary upload error:", error)
      setError(error.message || "Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || disabled) return

    setIsUploading(true)
    setError("")

    try {
      const photoUrl = await uploadFileDirectly(file)
      setPreviewUrl(photoUrl)
      onPhotoUpdate(photoUrl)
    } catch (error: any) {
      console.error("File upload error:", error)
      setError(error.message || "Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    if (disabled) return
    setPreviewUrl("")
    setError("")
    onPhotoUpdate("")
  }

  const getDefaultAvatar = () => {
    // Generate a consistent default avatar based on user name
    const colors = [
      "from-blue-500 to-purple-500",
      "from-green-500 to-blue-500",
      "from-purple-500 to-pink-500",
      "from-yellow-500 to-red-500",
      "from-indigo-500 to-purple-500",
    ]
    const colorIndex = userName.charCodeAt(0) % colors.length
    return colors[colorIndex]
  }

  return (
    <div className="relative group">
      <Avatar className="h-24 w-24 ring-4 ring-blue-200 group-hover:ring-blue-300 transition-all">
        <AvatarImage
          src={previewUrl || "/placeholder.svg"}
          alt={`${userName}'s profile photo`}
          onError={() => {
            // Handle image load errors
            console.log("Image failed to load, using fallback")
          }}
        />
        <AvatarFallback className={`text-3xl bg-gradient-to-r ${getDefaultAvatar()} text-white`}>
          {userName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {!disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCloudinaryUpload}
              disabled={isUploading}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              title="Upload with camera/gallery"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>

            {previewUrl && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemove}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                title="Remove photo"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input for fallback */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

      {!disabled && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCloudinaryUpload}
            disabled={isUploading}
            className="bg-white/90 border-blue-200 text-xs px-2 py-1 h-6"
          >
            {isUploading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                Uploading...
              </div>
            ) : (
              <>
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-white/90 border-gray-200 text-xs px-2 py-1 h-6"
          >
            <Camera className="h-3 w-3 mr-1" />
            File
          </Button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-48 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
