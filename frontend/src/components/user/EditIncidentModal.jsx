"use client"

import { useState } from "react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"

export const EditIncidentModalComponent = ({ incident, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: incident.title || "",
    description: incident.description || "",
    location: incident.location || "",
    category: incident.category || incident.incident_type || "",
    severity: incident.severity || "medium",
    latitude: incident.latitude || null,
    longitude: incident.longitude || null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState("")

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1"
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
    { value: "critical", label: "Critical", color: "text-red-800" },
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const getCurrentLocation = () => {
    setLocationLoading(true)
    setLocationError("")

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }))
        setLocationLoading(false)
        reverseGeocode(latitude, longitude)
      },
      (error) => {
        setLocationError("Unable to get your location. Please enter manually.")
        setLocationLoading(false)
        console.error("Geolocation error:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      )
      const data = await response.json()

      if (data.locality || data.city) {
        const address = [data.locality || data.city, data.countryName].filter(Boolean).join(", ")
        setFormData((prev) => ({
          ...prev,
          location: prev.location || address,
        }))
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`${API_BASE}/incidents/${incident.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          latitude: formData.latitude || 0,
          longitude: formData.longitude || 0,
          status: incident.status || "pending",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Incident updated successfully!")
        setTimeout(() => {
          onSave(incident.id)
        }, 500)
      } else {
        setError(data.msg || "Failed to update incident")
      }
    } catch (error) {
      console.error("Error updating incident:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[70vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Edit Incident Report</CardTitle>
          <CardDescription>Update the details of your incident report</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Specific location or address"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="shrink-0 bg-transparent"
                  >
                    {locationLoading ? "📍..." : "📍 GPS"}
                  </Button>
                </div>

                {locationError && <p className="text-sm text-destructive">{locationError}</p>}

                {formData.latitude && formData.longitude && (
                  <p className="text-sm text-muted-foreground">
                    📍 Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                )}
              </div>
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
                placeholder="Provide detailed information about what happened..."
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Updating..." : "Update Incident"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}