"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"
import { CommentSection } from "./CommentSection"
import { MediaUpload } from "./MediaUpload"

const IncidentMap = ({ incident }) => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    console.log("[v0] IncidentMap - Starting map initialization")
    console.log("[v0] API Key available:", !!GOOGLE_MAPS_API_KEY)
    console.log("[v0] Incident data:", incident)

    if (incident && incident.latitude && incident.longitude) {
      console.log("[v0] Coordinates found:", incident.latitude, incident.longitude)
      loadGoogleMapsScript()
    } else {
      console.log("[v0] Missing coordinates - latitude:", incident?.latitude, "longitude:", incident?.longitude)
      setLoading(false)
      setError("Location coordinates not available")
    }
  }, [incident])

  const loadGoogleMapsScript = () => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.log("[v0] Google Maps API key is missing")
      setError("Google Maps API key is missing")
      setLoading(false)
      return
    }

    if (window.google && window.google.maps) {
      console.log("[v0] Google Maps already loaded, initializing map")
      initializeMap()
      return
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      console.log("[v0] Google Maps script already exists, waiting for load")
      existingScript.addEventListener("load", initializeMap)
      return
    }

    console.log("[v0] Loading Google Maps script")
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log("[v0] Google Maps script loaded successfully")
      initializeMap()
    }
    script.onerror = (error) => {
      console.error("[v0] Failed to load Google Maps script:", error)
      setError("Failed to load Google Maps - Please check your internet connection")
      setLoading(false)
    }
    document.head.appendChild(script)
  }

  const initializeMap = () => {
    console.log("[v0] Initializing map...")

    if (!mapRef.current) {
      console.error("[v0] Map container ref not available")
      setError("Map container not ready")
      setLoading(false)
      return
    }

    if (!window.google || !window.google.maps) {
      console.error("[v0] Google Maps API not available")
      setError("Google Maps API not loaded")
      setLoading(false)
      return
    }

    try {
      const lat = Number.parseFloat(incident.latitude)
      const lng = Number.parseFloat(incident.longitude)

      console.log("[v0] Parsed coordinates:", { lat, lng })

      if (isNaN(lat) || isNaN(lng)) {
        console.error("[v0] Invalid coordinates:", incident.latitude, incident.longitude)
        setError("Invalid location coordinates")
        setLoading(false)
        return
      }

      const mapOptions = {
        center: { lat, lng },
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      }

      console.log("[v0] Creating Google Map with options:", mapOptions)
      const googleMap = new window.google.maps.Map(mapRef.current, mapOptions)

      // Add marker for the incident
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: googleMap,
        title: incident.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: getSeverityColor(incident.severity),
          fillOpacity: 0.8,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <h3 class="font-semibold text-gray-900">${incident.title}</h3>
            <p class="text-sm text-gray-600 mt-1">${incident.location || "Location not specified"}</p>
            <div class="mt-2">
              <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">${incident.status}</span>
            </div>
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(googleMap, marker)
      })

      console.log("[v0] Map initialized successfully")
      setMap(googleMap)
      setLoading(false)
    } catch (error) {
      console.error("[v0] Map initialization error:", error)
      setError(`Failed to initialize map: ${error.message}`)
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      critical: "#dc2626",
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#10b981",
    }
    return colors[severity?.toLowerCase()] || "#6b7280"
  }

  const openInGoogleMaps = () => {
    if (incident.latitude && incident.longitude) {
      const url = `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`
      window.open(url, "_blank")
    }
  }

  const shareLocation = () => {
    if (navigator.share && incident.latitude && incident.longitude) {
      navigator.share({
        title: incident.title,
        text: `Incident location: ${incident.location}`,
        url: `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`,
      })
    } else {
      // Fallback: copy to clipboard
      const locationText = `${incident.title} - Location: ${incident.latitude}, ${incident.longitude}`
      navigator.clipboard.writeText(locationText)
      alert("Location copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-blue-700">Loading map...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-4xl mb-2">🗺️</div>
        <div className="text-lg font-semibold text-gray-900 mb-1">Map Unavailable</div>
        <div className="text-sm text-gray-600 mb-4">{error}</div>
        {incident.latitude && incident.longitude && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              Coordinates: {Number.parseFloat(incident.latitude).toFixed(6)},{" "}
              {Number.parseFloat(incident.longitude).toFixed(6)}
            </div>
            <div className="flex justify-center space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={openInGoogleMaps}>
                🧭 Open in Google Maps
              </Button>
              <Button variant="outline" size="sm" onClick={shareLocation}>
                📤 Share Location
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div ref={mapRef} className="w-full h-64 rounded-lg border border-gray-200" style={{ minHeight: "256px" }} />
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">{incident.location || "Location not specified"}</h4>
        <p className="text-sm text-gray-600 mb-3">Emergency responders can use this location for navigation</p>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={openInGoogleMaps}>
            🧭 Get Directions
          </Button>
          <Button variant="outline" size="sm" onClick={shareLocation}>
            📤 Share Location
          </Button>
        </div>
      </div>
    </div>
  )
}

export const IncidentDetailPage = ({ incidentId, onBack }) => {
  const [incident, setIncident] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1"
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchIncidentDetails()
  }, [incidentId])

  const fetchIncidentDetails = async () => {
    try {
      console.log("[v0] Fetching incident details for ID:", incidentId)

      const [incidentRes, commentsRes] = await Promise.all([
        fetch(`${API_BASE}/incidents/${incidentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_BASE}/incidents/${incidentId}/comments`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).catch((err) => {
          console.log("[v0] Comments fetch failed:", err)
          return { ok: false }
        }),
      ])

      if (incidentRes.ok) {
        const incidentData = await incidentRes.json()
        console.log("[v0] Incident data received:", incidentData)
        setIncident(incidentData)
      } else {
        console.log("[v0] Failed to fetch incident:", incidentRes.status)
        setError(`Failed to load incident (Status: ${incidentRes.status})`)
      }

      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        setComments(commentsData)
        console.log("[v0] Comments loaded:", commentsData.length)
      } else {
        console.log("[v0] Comments not available, using empty array")
        setComments([])
      }
    } catch (error) {
      console.error("[v0] Error fetching incident details:", error)
      setError("Failed to load incident details")
    } finally {
      setLoading(false)
    }
  }

  const updateReportStatus = async (newStatus) => {
    setUpdating(true)
    try {
      console.log("[v0] Updating report status:", incidentId, newStatus)
      const response = await fetch(`${API_BASE}/incidents/${incidentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setIncident({ ...incident, status: newStatus })
        console.log("[v0] Report status updated successfully")
      } else {
        console.log("[v0] Failed to update report status, status:", response.status)
        alert("Failed to update report status. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error updating report status:", error)
      alert("Error updating report status. Please check your connection.")
    } finally {
      setUpdating(false)
    }
  }

  const deleteReport = async () => {
    if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return
    }

    try {
      console.log("[v0] Deleting report:", incidentId)
      const response = await fetch(`${API_BASE}/incidents/${incidentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        console.log("[v0] Report deleted successfully")
        onBack() // Navigate back to reports list
      } else {
        console.log("[v0] Failed to delete report, status:", response.status)
        alert("Failed to delete report. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error deleting report:", error)
      alert("Error deleting report. Please check your connection.")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading incident details...</p>
        </div>
      </div>
    )
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Error</h3>
          <p className="text-muted-foreground mb-4">{error || "Incident not found"}</p>
          <Button onClick={onBack}>Back to Reports</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onBack}
              size="sm"
              className="flex items-center space-x-2 hover:bg-gray-50 border-gray-300 bg-transparent"
            >
              <span>←</span>
              <span className="hidden sm:inline">Back to Reports</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 text-red-800 px-3 py-2 rounded-xl text-sm font-medium border border-red-200">
              🔔 Alerts
            </div>
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm">
              6
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-purple-900/20"></div>
        <div className="relative px-4 lg:px-6 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-6 lg:space-y-0 mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-orange-100 text-orange-800 px-3 py-2 rounded-xl text-sm font-medium border border-orange-200">
                  {incident.category || "Uncategorized"}
                </span>
                <span className={`px-3 py-2 text-sm font-medium rounded-xl border ${getStatusColor(incident.status)}`}>
                  {incident.status ? incident.status.replace("_", " ").toUpperCase() : "UNKNOWN"}
                </span>
                {incident.verified && (
                  <span className="bg-green-100 text-green-800 px-3 py-2 rounded-xl text-sm font-medium flex items-center border border-green-200">
                    <span className="mr-1">✓</span>
                    Verified
                  </span>
                )}
              </div>
              <div className="text-center lg:text-right">
                <div className="text-5xl lg:text-6xl mb-3">⚠️</div>
                <div className="text-sm opacity-90 font-medium">
                  {incident.media && incident.media.length > 0
                    ? `${incident.media.length} Media Files`
                    : "No Media Available"}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {incident.media && incident.media.length === 0 ? "no photos or videos reported" : ""}
                </div>
              </div>
            </div>

            <h1
              className="text-3xl lg:text-4xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {incident.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-3 sm:space-y-0 text-sm opacity-90">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📅</span>
                <span>
                  {new Date(incident.created_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(incident.created_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">📍</span>
                <span className="truncate">{incident.location || "Location not specified"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-gray-200 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                  Incident Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">Description</h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{incident.description}</p>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                    <span className="mr-2 text-xl">📍</span>
                    Location
                  </h3>
                  <IncidentMap incident={incident} />
                </div>
              </CardContent>
            </Card>

            {/* Media Upload */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <MediaUpload incidentId={incident.id} onMediaUploaded={fetchIncidentDetails} />
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <CommentSection incidentId={incident.id} comments={comments} onCommentAdded={handleCommentAdded} />
            </div>
          </div>

          {/* Right Column - Emergency Response & Details */}
          <div className="space-y-6">
            <Card className="shadow-sm border-red-200 rounded-xl bg-gradient-to-br from-red-50 to-red-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-red-700 flex items-center text-lg">
                  <span className="mr-2">🚨</span>
                  Emergency Response
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl py-3 shadow-sm hover:shadow-md transition-all">
                  <span className="mr-2">📞</span>
                  Call Emergency Services
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-white border-red-300 text-red-700 hover:bg-red-50 rounded-xl py-3"
                >
                  <span className="mr-2">📋</span>
                  Report Update
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-white border-red-300 text-red-700 hover:bg-red-50 rounded-xl py-3"
                >
                  <span className="mr-2">✓</span>
                  Verify Report
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Reported By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
                    {incident.reporter_name ? incident.reporter_name.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{incident.reporter_name || "Anonymous"}</div>
                    <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg inline-block">
                      Citizen Reporter
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Reported:</span>{" "}
                    {new Date(incident.created_at).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(incident.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    <span className={incident.verified ? "text-green-600" : "text-orange-600"}>
                      {incident.verified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Incident Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
                    <div className="text-sm text-gray-500">Casualties</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
                    <div className="text-sm text-gray-500">Responders</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Media Files:</span>
                    <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {incident.media?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Response Status:</span>
                    <span
                      className={`font-medium px-2 py-1 rounded-full text-xs ${
                        incident.status === "resolved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {incident.status ? incident.status.replace("_", " ") : "pending"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Verification:</span>
                    <span
                      className={`font-medium px-2 py-1 rounded-full text-xs ${
                        incident.verified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {incident.verified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Actions */}
            <Card className="shadow-sm border-gray-200 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Change Status</label>
                  <select
                    value={incident.status}
                    onChange={(e) => updateReportStatus(e.target.value)}
                    disabled={updating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {updating && (
                  <div className="text-sm text-blue-600 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Updating status...
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-red-900 mb-2">Danger Zone</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Permanently delete this report. This action cannot be undone.
                  </p>
                  <Button
                    onClick={deleteReport}
                    variant="outline"
                    className="w-full text-red-600 border-red-300 hover:bg-red-100 bg-transparent"
                    size="sm"
                  >
                    Delete Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
