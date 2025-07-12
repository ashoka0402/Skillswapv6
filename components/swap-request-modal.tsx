"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight } from "lucide-react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface SwapRequestModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: any
  currentUser: any
}

export default function SwapRequestModal({ isOpen, onClose, targetUser, currentUser }: SwapRequestModalProps) {
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState("")
  const [selectedWantedSkill, setSelectedWantedSkill] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedOfferedSkill || !selectedWantedSkill || !message.trim()) {
      alert("Please fill in all fields")
      return
    }

    setIsSubmitting(true)

    try {
      // Add swap request to Firestore
      await addDoc(collection(db, "swapRequests"), {
        senderId: currentUser.id,
        receiverId: targetUser.id,
        senderSkill: selectedOfferedSkill,
        receiverSkill: selectedWantedSkill,
        message: message.trim(),
        status: "pending",
        createdAt: new Date(),
        senderName: currentUser.name,
        receiverName: targetUser.name,
        senderPhoto: currentUser.profilePhoto || "",
        receiverPhoto: targetUser.profilePhoto || "",
      })

      alert("Swap request sent successfully!")
      onClose()

      // Reset form
      setSelectedOfferedSkill("")
      setSelectedWantedSkill("")
      setMessage("")
    } catch (error) {
      console.error("Error sending swap request:", error)
      alert("Failed to send swap request. Please try again.")
    }

    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-gray-900">
            <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
            Send Swap Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Target User Info */}
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <Avatar className="h-12 w-12 ring-2 ring-blue-200">
              <AvatarImage src={targetUser.profilePhoto || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {targetUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{targetUser.name}</h3>
              <p className="text-sm text-gray-600">{targetUser.location}</p>
            </div>
          </div>

          {/* Skill Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your skill to offer:</label>
              <Select value={selectedOfferedSkill} onValueChange={setSelectedOfferedSkill}>
                <SelectTrigger className="bg-white/50 border-gray-200 focus:border-blue-400">
                  <SelectValue placeholder="Select a skill you can teach" />
                </SelectTrigger>
                <SelectContent>
                  {currentUser?.skillsOffered?.map((skill: string) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skill you want to learn:</label>
              <Select value={selectedWantedSkill} onValueChange={setSelectedWantedSkill}>
                <SelectTrigger className="bg-white/50 border-gray-200 focus:border-blue-400">
                  <SelectValue placeholder="Select a skill they can teach" />
                </SelectTrigger>
                <SelectContent>
                  {targetUser.skillsOffered?.map((skill: string) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message:</label>
            <Textarea
              placeholder="Introduce yourself and explain why you'd like to swap skills..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="bg-white/50 border-gray-200 focus:border-blue-400 focus:bg-white"
            />
          </div>

          {/* Preview */}
          {selectedOfferedSkill && selectedWantedSkill && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
              <h4 className="font-semibold text-sm mb-3 text-gray-700 flex items-center">
                <Sparkles className="h-4 w-4 mr-1 text-green-600" />
                Swap Preview:
              </h4>
              <div className="flex items-center justify-between text-sm">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">{selectedOfferedSkill}</Badge>
                <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                <Badge variant="outline" className="border-purple-200 text-purple-700">
                  {selectedWantedSkill}
                </Badge>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-white/50 border-gray-200 hover:bg-white">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                "Send Request"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
