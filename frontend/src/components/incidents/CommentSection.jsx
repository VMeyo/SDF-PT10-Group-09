"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"

export const CommentSection = ({ incidentId, comments, onCommentAdded }) => {
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth()

<<<<<<< HEAD
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1"
=======
  const API_BASE = import.meta.env.VITE_API_BASE_URL
>>>>>>> feature/frontend-ui
  const token = localStorage.getItem("token")

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    setError("")

    try {
      console.log("[v0] Posting comment to incident:", incidentId)
      const response = await fetch(`${API_BASE}/incidents/${incidentId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
<<<<<<< HEAD
        body: JSON.stringify({ text: newComment }), // Flask expects 'text' not 'content'
=======
        body: JSON.stringify({ text: newComment.trim() }),
>>>>>>> feature/frontend-ui
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Comment posted successfully:", data)
        onCommentAdded(data)
        setNewComment("")
        // Show success feedback
        alert("Comment posted successfully!")
      } else {
<<<<<<< HEAD
        setError(data.msg || "Failed to add comment") // Flask uses 'msg' not 'message'
=======
        const errorData = await response.json().catch(() => ({}))
        console.log("[v0] Comment post failed:", response.status, errorData)
        setError(errorData.msg || errorData.message || "Failed to add comment")
>>>>>>> feature/frontend-ui
      }
    } catch (error) {
      console.error("[v0] Network error posting comment:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive-10 border border-destructive-20 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Add a comment
            </label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share updates, ask questions, or provide additional information..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus-visible-outline-none focus-visible-ring-2 focus-visible-ring-offset-2 resize-none"
            />
          </div>

          <Button type="submit" disabled={loading || !newComment.trim()}>
            {loading ? "Posting..." : "Post Comment"}
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {comment.author_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{comment.author_name || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {comment.author_id === user?.id && <span className="text-xs text-muted-foreground">You</span>}
                </div>
                <p className="text-muted-foreground leading-relaxed">{comment.text}</p>{" "}
                {/* Flask uses 'text' field for comment content */}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-muted-foreground">No comments yet. Be the first to share an update!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
