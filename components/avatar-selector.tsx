"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"
import { getRandomAvatars } from "@/lib/avatars"

interface AvatarSelectorProps {
  currentAvatar?: string
  userName: string
  onAvatarSelect: (avatarId: string) => void
  disabled?: boolean
}

export default function AvatarSelector({
  currentAvatar,
  userName,
  onAvatarSelect,
  disabled = false,
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "")
  const [availableAvatars] = useState(() => getRandomAvatars(5))

  const handleSelect = (avatarId: string) => {
    if (disabled) return
    setSelectedAvatar(avatarId)
    onAvatarSelect(avatarId)
  }

  const getAvatarDisplay = (avatar: any) => {
    return {
      image: avatar.url,
      fallback: userName.charAt(0).toUpperCase(),
      gradient: avatar.color,
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-medium text-gray-900 mb-2">Choose Your Avatar</h3>
        <p className="text-sm text-gray-600">Select an avatar to represent your profile</p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {availableAvatars.map((avatar) => {
          const display = getAvatarDisplay(avatar)
          const isSelected = selectedAvatar === avatar.id

          return (
            <Card
              key={avatar.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md hover:scale-105"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handleSelect(avatar.id)}
            >
              <CardContent className="p-3 text-center">
                <div className="relative">
                  <Avatar className="h-12 w-12 mx-auto mb-2">
                    <AvatarImage src={display.image || "/placeholder.svg"} alt={avatar.name} />
                    <AvatarFallback className={`bg-gradient-to-r ${display.gradient} text-white text-lg`}>
                      {display.fallback}
                    </AvatarFallback>
                  </Avatar>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate">{avatar.name}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!selectedAvatar && !disabled && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => handleSelect(availableAvatars[0].id)}
            className="bg-white/50 border-blue-200"
          >
            Use Default Avatar
          </Button>
        </div>
      )}
    </div>
  )
}
