"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Sparkles, CheckCircle } from "lucide-react"

interface SwapCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  request: any
  currentUserId: string
  onSubmit: (rating: number, feedback: string) => void
}

export default function SwapCompletionModal({
  isOpen,
  onClose,
  request,
  currentUserId,
  onSubmit,
}: SwapCompletionModalProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const otherUserName = currentUserId === request.senderId ? request.receiverName : request.senderName
  const skillLearned = currentUserId === request.senderId ? request.receiverSkill : request.senderSkill
  const skillTaught = currentUserId === request.senderId ? request.senderSkill : request.receiverSkill

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating")
      return
    }

    setIsSubmitting(true)
    await onSubmit(rating, feedback)
    setIsSubmitting(false)
    setRating(0)
    setFeedback("")
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Poor"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Very Good"
      case 5:
        return "Excellent"
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-gray-900">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Complete Your Swap
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Swap Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
            <h4 className="font-semibold text-sm mb-2 text-gray-700">Swap Summary</h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Partner:</span> {otherUserName}
              </p>
              <p>
                <span className="font-medium">You learned:</span> {skillLearned}
              </p>
              <p>
                <span className="font-medium">You taught:</span> {skillTaught}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-6">How was your experience with {otherUserName}?</p>

            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <div className="mb-4">
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 rounded-full">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-2" />
                  <span className="font-semibold text-yellow-800">
                    {rating}/5 - {getRatingText(rating)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Share your experience (Optional)</label>
            <Textarea
              placeholder={`Tell others about your experience learning ${skillLearned} from ${otherUserName}...`}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="bg-white/50 border-gray-200 focus:border-blue-400 focus:bg-white"
            />
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-white/50 border-gray-200 hover:bg-white">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Complete Swap
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
