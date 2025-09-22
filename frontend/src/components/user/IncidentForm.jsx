"use client"

import { useState } from "react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"

export const IncidentForm = ({ onIncidentCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    severity: "medium",
  })
  const [mediaFiles, setMediaFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  const categories = [
    "Traffic Accident",
    "Fire Emergency",
    "Medical Emergency",
    "Crime",
    "Natural Disaster",
    "Infrastructure",
    "Other",
  ]

  const severityLevels = [
    { value: "low", label: "Low", color: "text-green-600" },
    { value: "medium", label: "Medium", color: "text-yellow-600" },
    { value: "high", label: "High", color: "text-red-600" },
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/") || file.type.startsWith("video/")
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return isValidType && isValidSize
    })

    if (validFiles.length !== files.length) {
      setError("Some files were rejected. Only images and videos under 10MB are allowed.")
    }

    setMediaFiles((prev) => [...prev, ...validFiles])
  }

  const removeFile = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadMedia = async (files) => {
    const uploadedUrls = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append("media", file)

      try {
        setUploadProgress((prev) => ({ ...prev, [i]: 0 }))

        const response = await fetch(`${API_BASE}/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          uploadedUrls.push(data.url)
          setUploadProgress((prev) => ({ ...prev, [i]: 100 }))
        }
      } catch (error) {
        console.error("Upload failed:", error)
      }
    }

    return uploadedUrls
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      let mediaUrls = []
      if (mediaFiles.length > 0) {
        mediaUrls = await uploadMedia(mediaFiles)
      }

      const response = await fetch(`${API_BASE}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          mediaUrls,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Incident reported successfully!")
        setFormData({
          title: "",
          description: "",
          location: "",
          category: "",
          severity: "medium",
        })
        setMediaFiles([])
        setUploadProgress({})
        onIncidentCreated(data)
      } else {
        setError(data.message || "Failed to report incident")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Report New Incident</CardTitle>
        <CardDescription>
          Provide detailed information about the incident to help authorities respond effectively
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">{success}</div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Incident Title *
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief description of the incident"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="severity" className="text-sm font-medium">
              Severity Level *
            </label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              {severityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location *
            </label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Specific location or address"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about what happened, when it occurred, and any other relevant details..."
              rows={6}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Photos & Videos (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-3xl">📷</div>
                  <div className="text-sm text-gray-600">Click to upload photos or videos</div>
                  <div className="text-xs text-gray-500">Max 10MB per file. Images and videos only.</div>
                </div>
              </label>
            </div>

            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative border rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{file.type.startsWith("image/") ? "🖼️" : "🎥"}</span>
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                    {uploadProgress[index] !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress[index]}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting Report..." : "Submit Incident Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
