"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"
import { CommentSection } from "./CommentSection"
import { MediaUpload } from "./MediaUpload"

export const IncidentDetail = ({ incidentId, onClose }) => {
  const [incident, setIncident] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchIncidentDetails()
  }, [incidentId])

  const fetchIncidentDetails = async () => {
    try {
      const [incidentRes, commentsRes] = await Promise.all([
        fetch(`${API_BASE}/incidents/${incidentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/incidents/${incidentId}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (incidentRes.ok) {
        const incidentData = await incidentRes.json()
        setIncident(incidentData)
      }

      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        setComments(commentsData)
      }
    } catch (error) {
      setError("Failed to load incident details")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment])
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading incident details...</p>
        </div>
      </div>
    )
  }

  if (error || !incident) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-8 max-w-md">
          <h3 className="text-lg font-semibold mb-4">Error</h3>
          <p className="text-muted-foreground mb-4">{error || "Incident not found"}</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Incident Details</h2>
          <Button variant="outline" onClick={onClose}>
            ✕ Close
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Incident Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{incident.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>📍 {incident.location}</span>
                  <span>📅 {new Date(incident.created_at).toLocaleDateString()}</span>
                  <span>👤 {incident.reporter_name || "Anonymous"}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(incident.status)}`}
                >
                  {incident.status?.replace("_", " ").toUpperCase()}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${getSeverityColor(incident.severity)}`}
                >
                  {incident.severity?.toUpperCase()} PRIORITY
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Category:</span>
              <span className="px-2 py-1 text-xs bg-accent text-accent-foreground rounded">{incident.category}</span>
              <span className="text-sm font-medium">ID:</span>
              <span className="text-sm text-muted-foreground">#{incident.id}</span>
            </div>
          </div>

          {/* Incident Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{incident.description}</p>
            </CardContent>
          </Card>

          {/* Media Section */}
          {incident.media && incident.media.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attached Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {incident.media.map((media, index) => (
                    <div key={index} className="border border-border rounded-lg overflow-hidden">
                      <img
                        src={media.url || "/placeholder.svg"}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media Upload for incident owner */}
          <MediaUpload incidentId={incident.id} onMediaUploaded={fetchIncidentDetails} />

          {/* Comments Section */}
          <CommentSection incidentId={incident.id} comments={comments} onCommentAdded={handleCommentAdded} />
        </div>
      </div>
    </div>
  )
}
