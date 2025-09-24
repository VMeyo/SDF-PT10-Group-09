"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"

export const MediaUpload = ({ incidentId, onMediaUploaded }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1"
  const token = localStorage.getItem("token")

  const handleFileUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError("")
    setSuccess("")

    try {
      let uploadedCount = 0
      const errorMessages = []

      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file) // Flask expects 'file' not 'media'

        console.log("[v0] Uploading file:", file.name, "to incident:", incidentId)
        const response = await fetch(`${API_BASE}/media/${incidentId}/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        const data = await response.json()
        console.log("[v0] Upload response:", response.status, data)

        if (response.ok) {
          uploadedCount++
        } else {
          const errorMsg = data.msg || data.message || `Upload failed for ${file.name}`
          errorMessages.push(errorMsg)
          console.error("[v0] Upload failed for file:", file.name, errorMsg)
        }
      }

      if (uploadedCount > 0) {
        setSuccess(`Successfully uploaded ${uploadedCount} file(s)`)
        onMediaUploaded()
        // Clear the input
        e.target.value = ""
      }

      if (errorMessages.length > 0) {
        setError(`Upload issues: ${errorMessages.join(", ")}`)
      }

      if (uploadedCount === 0) {
        setError("Failed to upload any files. Please check your authentication and try again.")
      }
    } catch (error) {
      console.error("[v0] Network error during upload:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Evidence</CardTitle>
        <CardDescription>Add photos or videos to support this incident report</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive-10 border border-destructive-20 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">{success}</div>
        )}

        <div className="space-y-2">
          <label htmlFor="media-upload" className="text-sm font-medium">
            Select files to upload
          </label>
          <input
            id="media-upload"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">
            Supported formats: JPG, PNG, GIF, MP4, MOV. Max size: 10MB per file.
          </p>
        </div>

        {uploading && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Uploading files...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
