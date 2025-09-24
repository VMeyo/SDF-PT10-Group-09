"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/Card"

export const EmergencyDashboard = () => {
  const [emergencyStats, setEmergencyStats] = useState({
    activeReports: 0,
    critical: 0,
    responders: 0,
    resolved: 0,
  })
  const [recentReports, setRecentReports] = useState([])
  const [loading, setLoading] = useState(true)

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchEmergencyData()
  }, [])

  const fetchEmergencyData = async () => {
    try {
      console.log("[v0] Fetching emergency data from /incidents/")

      const reportsResponse = await fetch(`${API_BASE}/incidents/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        console.log("[v0] Fetched reports data:", reportsData)
        setRecentReports(reportsData)

        const stats = {
          activeReports: reportsData.filter((r) => r.status !== "resolved").length,
          critical: reportsData.filter((r) => r.severity === "critical" || r.severity === "high").length,
          responders: reportsData.reduce((sum, r) => sum + (r.responder_count || 0), 0),
          resolved: reportsData.filter((r) => r.status === "resolved").length,
        }
        setEmergencyStats(stats)
      } else {
        console.error("[v0] Failed to fetch reports:", reportsResponse.status)
      }
    } catch (error) {
      console.error("[v0] Error fetching emergency data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityBadge = (severity) => {
    const badges = {
      high: "HIGH",
      critical: "CRITICAL",
      medium: "MEDIUM",
      low: "LOW",
    }
    return badges[severity] || "MEDIUM"
  }

  const getSeverityColor = (severity) => {
    const colors = {
      high: "bg-orange-500",
      critical: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500",
    }
    return colors[severity] || colors.medium
  }

  const getIncidentIcon = (type) => {
    const icons = {
      "Road Accident": "🚗",
      Fire: "🔥",
      Flood: "🌊",
      "Medical Emergency": "🚑",
      Crime: "🚨",
      Other: "⚠️",
    }
    return icons[type] || icons["Other"]
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Active Reports</p>
                <p className="text-3xl font-bold text-red-700">{emergencyStats.activeReports}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Critical</p>
                <p className="text-3xl font-bold text-orange-700">{emergencyStats.critical}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">📈</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Responders</p>
                <p className="text-3xl font-bold text-blue-700">{emergencyStats.responders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Resolved</p>
                <p className="text-3xl font-bold text-green-700">{emergencyStats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Emergency Alert */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">⚠️</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-red-900">Critical Emergency Alert</h3>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  View Critical
                </button>
              </div>
              <p className="text-red-800 mt-1">1 critical accident requiring immediate attention.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by location, type, or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4 ml-4">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>All Types</option>
            <option>Road Accident</option>
            <option>Fire</option>
            <option>Flood</option>
            <option>Medical Emergency</option>
            <option>Crime</option>
            <option>Other</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>All Levels</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      {/* Recent Reports */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
          <span className="text-sm text-gray-500">{recentReports.length} reports found</span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {recentReports.length > 0 ? (
            recentReports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Status indicators */}
                  <div className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 ${getSeverityColor(report.severity)} rounded-full`}></div>
                        {report.verified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{formatTimeAgo(report.created_at)}</span>
                    </div>
                  </div>

                  {/* Media placeholder */}
                  <div className="bg-gray-100 h-48 flex items-center justify-center mx-4 rounded-lg mb-4">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">⭐</span>
                      <span className="text-sm text-gray-600">{report.media_count || 0} media files</span>
                    </div>
                  </div>

                  {/* Report details */}
                  <div className="p-4 pt-0">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${getSeverityColor(report.severity)} text-white font-medium`}
                      >
                        {getSeverityBadge(report.severity)}
                      </span>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">{getIncidentIcon(report.incident_type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{report.incident_type}</h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{report.title}</p>
                        <p className="text-xs text-gray-500 mb-2">{report.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>📍 {report.location}</span>
                          <span>👥 {report.responder_count || 0} responders</span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <span className="text-lg">✓</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500">Reports will appear here once they are submitted.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
