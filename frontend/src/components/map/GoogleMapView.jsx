"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "../ui/Card"

export const GoogleMapView = () => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [activeReports, setActiveReports] = useState([])
  const [filters, setFilters] = useState({
    accidentType: "All Types",
    severityLevel: "All Levels",
  })
  const [loading, setLoading] = useState(true)

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchActiveReports()
    initializeMap()
  }, [])

  const initializeMap = () => {
    if (window.google && mapRef.current) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: -1.2921, lng: 36.8219 }, // Nairobi coordinates
        zoom: 12,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      })
      setMap(mapInstance)
    }
  }

  const fetchActiveReports = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const reports = data
          .filter((incident) => incident.status !== "resolved")
          .map((incident) => ({
            ...incident,
            casualties: Math.floor(Math.random() * 3),
            responders: Math.floor(Math.random() * 5),
            lat: -1.2921 + (Math.random() - 0.5) * 0.1,
            lng: 36.8219 + (Math.random() - 0.5) * 0.1,
          }))

        setActiveReports(reports)
        addMarkersToMap(reports)
      }
    } catch (error) {
      console.error("Error fetching active reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const addMarkersToMap = (reports) => {
    if (!map) return

    reports.forEach((report) => {
      const marker = new window.google.maps.Marker({
        position: { lat: report.lat, lng: report.lng },
        map: map,
        title: report.title,
        icon: {
          url: getSeverityMarkerIcon(report.severity),
          scaledSize: new window.google.maps.Size(30, 30),
        },
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <h3 class="font-semibold text-gray-900">${report.title}</h3>
            <p class="text-sm text-gray-600 mt-1">${report.location}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="px-2 py-1 text-xs rounded-full ${getSeverityBadgeClass(report.severity)}">
                ${report.severity}
              </span>
              <span class="text-xs text-gray-500">${report.casualties} casualties</span>
            </div>
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(map, marker)
      })
    })
  }

  const getSeverityMarkerIcon = (severity) => {
    const colors = {
      high: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ef4444'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/%3E%3C/svg%3E",
      medium:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23eab308'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/%3E%3C/svg%3E",
      low: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2322c55e'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/%3E%3C/svg%3E",
      critical:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23dc2626'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/%3E%3C/svg%3E",
    }
    return colors[severity] || colors.medium
  }

  const getSeverityBadgeClass = (severity) => {
    const classes = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
      critical: "bg-red-100 text-red-800",
    }
    return classes[severity] || classes.medium
  }

  const getSeverityColor = (severity) => {
    const colors = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500",
      critical: "bg-red-700",
    }
    return colors[severity] || "bg-gray-500"
  }

  // ... existing code for other functions ...

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="flex space-x-6">
            <div className="w-1/3 h-96 bg-gray-200 rounded"></div>
            <div className="flex-1 h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        async
        defer
        onLoad={initializeMap}
      ></script>

      <div className="flex space-x-6">
        {/* Left Sidebar - Filters and Active Reports */}
        <div className="w-1/3 space-y-6">
          {/* ... existing sidebar content ... */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-lg">🔧</span>
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accident Type</label>
                  <select
                    value={filters.accidentType}
                    onChange={(e) => setFilters({ ...filters, accidentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>All Types</option>
                    <option>Road Accident</option>
                    <option>Fire</option>
                    <option>Flood</option>
                    <option>Medical Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
                  <select
                    value={filters.severityLevel}
                    onChange={(e) => setFilters({ ...filters, severityLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>All Levels</option>
                    <option>Critical severity</option>
                    <option>High severity</option>
                    <option>Medium severity</option>
                    <option>Low severity</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Reports List */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Active Reports ({activeReports.length})</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeReports.slice(0, 3).map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-6 h-6 ${getSeverityColor(report.severity)} rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="text-white text-xs">⚠</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{report.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{report.location}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${getSeverityBadgeClass(report.severity)}`}>
                            {report.status}
                          </span>
                          <span>{report.casualties} casualties</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Google Map */}
        <div className="flex-1">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <div ref={mapRef} className="w-full h-full min-h-[600px] rounded-lg" style={{ minHeight: "600px" }} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
