"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "../ui/Card"
import "./GoogleMapView.css"

export const GoogleMapView = () => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [activeReports, setActiveReports] = useState([])
  const markersRef = useRef([])
  const [filters, setFilters] = useState({
    accidentType: "All Types",
    severityLevel: "All Levels",
  })
  const [loading, setLoading] = useState(true)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [error, setError] = useState(null)

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    fetchActiveReports()
    loadGoogleMapsScript()
  }, [])

  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && !map) {
      initializeMapWithElement()
    }
  }, [googleMapsLoaded, map])

  useEffect(() => {
    if (map && activeReports.length > 0) {
      clearMarkers()
      activeReports.forEach((report) => {
        addMarkerToMap(map, report)
      })
    }
  }, [map, activeReports])

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => {
      marker.setMap(null)
    })
    markersRef.current = []
  }

  const loadGoogleMapsScript = () => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY environment variable.")
      setLoading(false)
      return
    }

    if (window.google && window.google.maps && window.google.maps.Map) {
      setGoogleMapsLoaded(true)
      return
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      if (window.google && window.google.maps) {
        setGoogleMapsLoaded(true)
        return
      }

      const scriptTimeout = setTimeout(() => {
        setError("Google Maps loading timeout. Please refresh the page.")
        setLoading(false)
      }, 10000)

      existingScript.addEventListener("load", () => {
        clearTimeout(scriptTimeout)
        setGoogleMapsLoaded(true)
      })
      existingScript.addEventListener("error", () => {
        clearTimeout(scriptTimeout)
        setError("Failed to load Google Maps. Please check your internet connection and API key.")
        setLoading(false)
      })
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`
    script.async = true
    script.defer = true

    const newScriptTimeout = setTimeout(() => {
      setError("Google Maps loading timeout. Please check your API key and internet connection.")
      setLoading(false)
    }, 15000)

    script.onload = () => {
      clearTimeout(newScriptTimeout)
      const checkGoogleMapsReady = () => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          setGoogleMapsLoaded(true)
        } else {
          setTimeout(checkGoogleMapsReady, 500)
        }
      }
      checkGoogleMapsReady()
    }

    script.onerror = () => {
      clearTimeout(newScriptTimeout)
      setError("Failed to load Google Maps. Please check your API key and internet connection.")
      setLoading(false)
    }

    document.head.appendChild(script)
  }

  const initializeMapWithElement = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      setError("Google Maps API not properly loaded. Please refresh the page.")
      setLoading(false)
      return
    }

    try {
      const mapOptions = {
        center: { lat: -1.2921, lng: 36.8219 }, // Nairobi coordinates
        zoom: 12,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      }

      const googleMap = new window.google.maps.Map(mapRef.current, mapOptions)
      setMap(googleMap)
      setLoading(false)
    } catch (error) {
      setError("Failed to initialize Google Maps. Please refresh the page.")
      setLoading(false)
    }
  }

  const addMarkerToMap = (googleMap, report) => {
    if (!window.google) return

    const lat =
      Number.parseFloat(report.latitude) || Number.parseFloat(report.lat) || -1.2921 + (Math.random() - 0.5) * 0.1
    const lng =
      Number.parseFloat(report.longitude) || Number.parseFloat(report.lng) || 36.8219 + (Math.random() - 0.5) * 0.1

    const markerColor = getSeverityMarkerColor(report.severity || report.priority)
    const severityClass = (report.severity || report.priority || "medium").toLowerCase()

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: googleMap,
      title: report.title || report.description || `Incident ${report.id}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: markerColor,
        fillOpacity: 0.9,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
      animation: window.google.maps.Animation.DROP,
    })

    markersRef.current.push(marker)

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="custom-info-window">
          <h3>${report.title || report.description || `Incident ${report.id}`}</h3>
          <p>${report.location || "Location not specified"}</p>
          <div class="info-badges">
            <span class="status-badge ${getSeverityBadgeClass(report.severity || report.priority)}">${report.status || "active"}</span>
            <span class="casualty-count">${report.casualties || 0} casualties</span>
          </div>
        </div>
      `,
    })

    marker.addListener("click", () => {
      infoWindow.open(googleMap, marker)
    })
  }

  const getSeverityMarkerColor = (severity) => {
    const colors = {
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#10b981",
      critical: "#dc2626",
    }
    return colors[severity] || "#6b7280"
  }

  const fetchActiveReports = async () => {
    try {
      const token = localStorage.getItem("token")
      const apiBase = API_BASE || "/api/v1"
      const url = `${apiBase}/incidents/`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        const reports = data.map((incident) => ({
          ...incident,
          casualties: incident.casualties || 0,
          responders: incident.responders || 0,
          lat:
            Number.parseFloat(incident.latitude) ||
            Number.parseFloat(incident.lat) ||
            -1.2921 + (Math.random() - 0.5) * 0.1,
          lng:
            Number.parseFloat(incident.longitude) ||
            Number.parseFloat(incident.lng) ||
            36.8219 + (Math.random() - 0.5) * 0.1,
        }))

        setActiveReports(reports)
      } else {
        console.error("Failed to fetch incidents from API")
        setActiveReports([])
      }
    } catch (error) {
      console.error("Error fetching incidents:", error)
      setActiveReports([])
    }
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

  const refreshIncidents = async () => {
    await fetchActiveReports()
  }

  useEffect(() => {
    window.refreshMapIncidents = refreshIncidents
    return () => {
      delete window.refreshMapIncidents
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex space-x-6">
        <div className="w-1/3 space-y-6">
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

        <div className="flex-1">
          <Card className="h-full">
            <CardContent className="p-0 h-full relative">
              <div className="realtime-indicator">
                <div className="pulse-dot"></div>
                <span>Live Updates</span>
              </div>

              <div
                ref={mapRef}
                className="w-full h-full min-h-[600px] rounded-lg bg-gray-100"
                style={{
                  minHeight: "600px",
                  width: "100%",
                  height: "600px",
                }}
              />

              <div className="map-legend">
                <h4>Severity Levels</h4>
                <div className="map-legend-item">
                  <div className="map-legend-dot" style={{ backgroundColor: "#dc2626" }}></div>
                  <span>Critical</span>
                </div>
                <div className="map-legend-item">
                  <div className="map-legend-dot" style={{ backgroundColor: "#ef4444" }}></div>
                  <span>High</span>
                </div>
                <div className="map-legend-item">
                  <div className="map-legend-dot" style={{ backgroundColor: "#f59e0b" }}></div>
                  <span>Medium</span>
                </div>
                <div className="map-legend-item">
                  <div className="map-legend-dot" style={{ backgroundColor: "#10b981" }}></div>
                  <span>Low</span>
                </div>
              </div>

              {(loading || error) && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                  {error ? (
                    <div className="text-center p-8">
                      <div className="text-red-500 text-6xl mb-4">🗺️</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Unavailable</h3>
                      <p className="text-gray-600 mb-4">{error}</p>
                      <button
                        onClick={() => {
                          setError(null)
                          setLoading(true)
                          loadGoogleMapsScript()
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <div className="text-gray-600">Loading Google Maps...</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
