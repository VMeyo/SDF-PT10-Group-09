"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"

export const EmergencyDashboard = () => {
  const [stats, setStats] = useState({
    activeReports: 3,
    critical: 1,
    responders: 20,
    resolved: 2,
  })
  const [recentReports, setRecentReports] = useState([])
  const [loading, setLoading] = useState(true)

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const incidents = await response.json()

        setStats({
          activeReports: incidents.filter((i) => i.status !== "resolved").length,
          critical: incidents.filter((i) => i.severity === "high").length,
          responders: 20, // This would come from a responders API
          resolved: incidents.filter((i) => i.status === "resolved").length,
        })

        setRecentReports(
          incidents.slice(0, 3).map((incident) => ({
            ...incident,
            mediaCount: Math.floor(Math.random() * 5) + 1, // Mock media count
            timeAgo: getTimeAgo(new Date(incident.created_at)),
          })),
        )
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const getSeverityBadge = (severity) => {
    const badges = {
      high: "bg-red-100 text-red-800 border border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      low: "bg-green-100 text-green-800 border border-green-200",
    }
    return badges[severity] || badges.low
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <button className="flex items-center text-gray-600 hover:text-gray-800">
              <span className="mr-2">←</span>
              <span className="text-sm">Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Emergency Dashboard</h1>
          <p className="text-gray-600">Real-time accident reports and emergency response</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">🗺️ View Map</Button>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🔔</span>
            </div>
            <span className="text-sm font-medium">Alerts</span>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">1</span>
            <span className="text-xs text-gray-500 ml-2">New Report</span>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Active Reports</p>
                <p className="text-3xl font-bold text-red-700">{stats.activeReports}</p>
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
                <p className="text-3xl font-bold text-orange-700">{stats.critical}</p>
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
                <p className="text-3xl font-bold text-blue-700">{stats.responders}</p>
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
                <p className="text-3xl font-bold text-green-700">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Emergency Alert */}
      <Card className="mb-8 border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white">⚠️</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Critical Emergency Alert</h3>
                <p className="text-red-700">1 critical accident requiring immediate attention.</p>
              </div>
            </div>
            <Button className="bg-red-500 hover:bg-red-600 text-white">View Critical</Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by location, type, or description..."
              className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>All Types</option>
            <option>Road Accident</option>
            <option>Fire</option>
            <option>Flood</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>All Levels</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">5 reports found</p>
      </div>

      {/* Recent Reports */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Reports</h2>
        <div className="grid grid-cols-3 gap-6">
          {recentReports.map((report, index) => (
            <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Mock image placeholder */}
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl text-gray-400">📷</span>
                    <p className="text-sm text-gray-500 mt-2">{report.mediaCount} media files</p>
                  </div>
                </div>

                {/* Status badges */}
                <div className="absolute top-3 left-3 flex space-x-2">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                    Verified
                  </span>
                </div>

                {/* Severity badge */}
                <div className="absolute top-3 right-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityBadge(report.severity)}`}>
                    {report.severity?.toUpperCase()}
                  </span>
                </div>

                {/* Time ago */}
                <div className="absolute bottom-3 left-3">
                  <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">{report.timeAgo}</span>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500">🚗</span>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 hover:bg-gray-100 rounded">👁️</button>
                    <button className="p-1 hover:bg-gray-100 rounded">✏️</button>
                    <button className="p-1 hover:bg-gray-100 rounded">🗑️</button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>📍 {report.location}</span>
                    <span>👤 {report.reporter_name || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>👥 {Math.floor(Math.random() * 5) + 1} responders</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
