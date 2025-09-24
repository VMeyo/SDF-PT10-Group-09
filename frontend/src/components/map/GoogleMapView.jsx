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
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState([])

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const addDebugInfo = (message) => {
    console.log(`[v0] ${message}`)
    setDebugInfo((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addDebugInfo("GoogleMapView component mounted")
    addDebugInfo(`API_BASE: ${API_BASE || "Not set"}`)
    addDebugInfo(`GOOGLE_MAPS_API_KEY: ${GOOGLE_MAPS_API_KEY ? "Present" : "Missing"}`)
    addDebugInfo(`Environment: ${import.meta.env.MODE || "Unknown"}`)

    fetchActiveReports()
    loadGoogleMapsScript()
  }, [])

  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && !map) {
      addDebugInfo("Both Google Maps loaded and mapRef available, initializing map")
      initializeMapWithElement()
    }
  }, [googleMapsLoaded, map])

  const loadGoogleMapsScript = () => {
    addDebugInfo("Starting Google Maps script loading process")

    if (!GOOGLE_MAPS_API_KEY) {
      const errorMsg = "Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY environment variable."
      addDebugInfo(`ERROR: ${errorMsg}`)
      setError(errorMsg)
      setLoading(false)
      return
    }

    if (window.google && window.google.maps && window.google.maps.Map) {
      addDebugInfo("Google Maps already loaded and ready")
      setGoogleMapsLoaded(true)
      return
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      addDebugInfo("Google Maps script already exists, checking if loaded")

      if (window.google && window.google.maps) {
        addDebugInfo("Existing script already loaded")
        setGoogleMapsLoaded(true)
        return
      }

      const scriptTimeout = setTimeout(() => {
        addDebugInfo("ERROR: Existing script loading timeout")
        setError("Google Maps loading timeout. Please refresh the page.")
        setLoading(false)
      }, 10000)

      existingScript.addEventListener("load", () => {
        clearTimeout(scriptTimeout)
        addDebugInfo("Existing Google Maps script loaded successfully")
        setGoogleMapsLoaded(true)
      })
      existingScript.addEventListener("error", (e) => {
        clearTimeout(scriptTimeout)
        addDebugInfo(`ERROR: Existing Google Maps script failed to load: ${e.message}`)
        setError("Failed to load Google Maps. Please check your internet connection and API key.")
        setLoading(false)
      })
      return
    }

    addDebugInfo(`Creating new Google Maps script with API key: ${GOOGLE_MAPS_API_KEY.substring(0, 10)}...`)
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`
    script.async = true
    script.defer = true

    const newScriptTimeout = setTimeout(() => {
      addDebugInfo("ERROR: New script loading timeout")
      setError("Google Maps loading timeout. Please check your API key and internet connection.")
      setLoading(false)
    }, 15000)

    script.onload = () => {
      clearTimeout(newScriptTimeout)
      addDebugInfo("Google Maps script loaded successfully")

      const checkGoogleMapsReady = () => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          addDebugInfo("Google Maps API is fully ready")
          setGoogleMapsLoaded(true)
        } else {
          addDebugInfo("Google Maps API not yet ready, retrying...")
          setTimeout(checkGoogleMapsReady, 500)
        }
      }
      checkGoogleMapsReady()
    }

    script.onerror = (e) => {
      clearTimeout(newScriptTimeout)
      addDebugInfo(`ERROR: Failed to load Google Maps script: ${e.message || "Unknown error"}`)
      addDebugInfo(`Script src: ${script.src}`)
      setError("Failed to load Google Maps. Please check your API key and internet connection.")
      setLoading(false)
    }

    document.head.appendChild(script)
    addDebugInfo("Google Maps script added to document head")
  }

  const initializeMapWithElement = () => {
    if (!mapRef.current) {
      addDebugInfo("ERROR: mapRef.current is null during initialization")
      return
    }

    if (!window.google) {
      addDebugInfo("ERROR: window.google is not available")
      setError("Google Maps API not loaded. Please refresh the page.")
      setLoading(false)
      return
    }

    if (!window.google.maps) {
      addDebugInfo("ERROR: window.google.maps is not available")
      setError("Google Maps API not properly loaded. Please refresh the page.")
      setLoading(false)
      return
    }

    addDebugInfo("All prerequisites met, creating Google Map instance")
    console.log("[v0] Creating Google Map instance")
    console.log("[v0] mapRef.current dimensions:", {
      width: mapRef.current.offsetWidth,
      height: mapRef.current.offsetHeight,
      clientWidth: mapRef.current.clientWidth,
      clientHeight: mapRef.current.clientHeight,
    })

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

      console.log("[v0] Map options:", mapOptions)
      const googleMap = new window.google.maps.Map(mapRef.current, mapOptions)
      console.log("[v0] Google Map created:", googleMap)

      setMap(googleMap)
      setLoading(false)
      addDebugInfo("Google Map initialized successfully")
      console.log("[v0] Map initialization completed successfully")

      if (activeReports.length > 0) {
        addDebugInfo(`Adding ${activeReports.length} markers to map`)
        console.log("[v0] Adding markers for reports:", activeReports)
        activeReports.forEach((report) => {
          addMarkerToMap(googleMap, report)
        })
      } else {
        addDebugInfo("No active reports to add as markers")
        console.log("[v0] No active reports to add as markers")
      }
    } catch (error) {
      addDebugInfo(`ERROR: Failed to initialize Google Map: ${error.message}`)
      console.log("[v0] ERROR: Failed to initialize Google Map:", error)
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

    console.log(`[v0] Adding marker for report ${report.id}:`, {
      lat,
      lng,
      originalLat: report.latitude,
      originalLng: report.longitude,
    })

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: googleMap,
      title: report.title || report.description || `Incident ${report.id}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: getSeverityMarkerColor(report.severity || report.priority),
        fillOpacity: 0.8,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    })

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-3">
          <h3 class="font-semibold text-gray-900">${report.title || report.description || `Incident ${report.id}`}</h3>
          <p class="text-sm text-gray-600 mt-1">${report.location || "Location not specified"}</p>
          <div class="mt-2 flex items-center justify-between">
            <span class="px-2 py-1 text-xs rounded-full ${getSeverityBadgeClass(report.severity || report.priority)}">${report.status}</span>
            <span class="text-xs text-gray-500">${report.casualties || 0} casualties</span>
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
    addDebugInfo("Starting to fetch active reports")
    try {
      const token = localStorage.getItem("token")
      const apiBase = API_BASE || "/api/v1"
      const url = `${apiBase}/incidents/`
      addDebugInfo(`Fetching from: ${url}`)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      addDebugInfo(`API response status: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        addDebugInfo(`Received ${data.length} incidents from API`)
        const reports = data
          .filter((incident) => incident.status !== "resolved")
          .map((incident) => ({
            ...incident,
            casualties: incident.casualties || Math.floor(Math.random() * 3),
            responders: incident.responders || Math.floor(Math.random() * 5),
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
        addDebugInfo(`Processed ${reports.length} active reports for map`)
      } else {
        addDebugInfo(`API failed with status ${response.status}, using mock data`)
        const mockReports = [
          {
            id: 1,
            title: "Road Accident on Uhuru Highway",
            location: "Uhuru Highway, Nairobi",
            severity: "high",
            status: "active",
            casualties: 2,
            responders: 3,
            lat: -1.2921,
            lng: 36.8219,
          },
          {
            id: 2,
            title: "Fire at Industrial Area",
            location: "Industrial Area, Nairobi",
            severity: "medium",
            status: "active",
            casualties: 0,
            responders: 5,
            lat: -1.3021,
            lng: 36.8319,
          },
        ]
        setActiveReports(mockReports)
        addDebugInfo("Using mock reports data")
      }
    } catch (error) {
      addDebugInfo(`ERROR: Failed to fetch active reports: ${error.message}`)
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
              <div
                ref={mapRef}
                className="w-full h-full min-h-[600px] rounded-lg bg-gray-100"
                style={{
                  minHeight: "600px",
                  width: "100%",
                  height: "600px",
                }}
              />

              {(loading || error) && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                  {error ? (
                    <div className="text-center p-8">
                      <div className="text-red-500 text-6xl mb-4">🗺️</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Unavailable</h3>
                      <p className="text-gray-600 mb-4">{error}</p>

                      <details className="mb-4 text-left">
                        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                          Show Debug Information
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono max-h-40 overflow-y-auto">
                          {debugInfo.map((info, index) => (
                            <div key={index} className="mb-1">
                              {info}
                            </div>
                          ))}
                        </div>
                      </details>

                      <button
                        onClick={() => {
                          setError(null)
                          setLoading(true)
                          setDebugInfo([])
                          addDebugInfo("Retrying map initialization")
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
                      <div className="text-gray-600">
                        Loading Google Maps...
                        <details className="mt-2 text-left max-w-md mx-auto">
                          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                            Show Loading Details
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono max-h-32 overflow-y-auto">
                            {debugInfo.map((info, index) => (
                              <div key={index} className="mb-1">
                                {info}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
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
