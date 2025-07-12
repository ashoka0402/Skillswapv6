"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { subscribeToAnnouncements, type Announcement } from "@/lib/announcements"

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissedIds, setDismissedIds] = useState<string[]>([])

  useEffect(() => {
    // Load dismissed announcements from localStorage
    const dismissed = localStorage.getItem("dismissedAnnouncements")
    if (dismissed) {
      setDismissedIds(JSON.parse(dismissed))
    }

    // Subscribe to real-time announcements
    const unsubscribe = subscribeToAnnouncements((newAnnouncements) => {
      setAnnouncements(newAnnouncements)
    })

    return () => unsubscribe()
  }, [])

  const dismissAnnouncement = (id: string) => {
    const newDismissed = [...dismissedIds, id]
    setDismissedIds(newDismissed)
    localStorage.setItem("dismissedAnnouncements", JSON.stringify(newDismissed))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "warning":
        return "destructive"
      case "error":
        return "destructive"
      default:
        return "default"
    }
  }

  const visibleAnnouncements = announcements.filter((announcement) => !dismissedIds.includes(announcement.id))

  if (visibleAnnouncements.length === 0) return null

  return (
    <div className="space-y-2">
      {visibleAnnouncements.map((announcement) => (
        <Alert key={announcement.id} variant={getAlertVariant(announcement.type)} className="relative pr-12">
          {getIcon(announcement.type)}
          <AlertDescription className="pr-8">{announcement.message}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dismissAnnouncement(announcement.id)}
            className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  )
}
