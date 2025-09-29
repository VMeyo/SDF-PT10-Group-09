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
      const apiBase = API_BASE || "/api/v1"
      console.log("[v0] Fetching dashboard data from:", `${apiBase}/incidents/`)

      const response = await fetch(`${apiBase}/incidents/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Dashboard API response status:", response.status)

      if (response.ok) {
        const incidents = await response.json()
        console.log("[v0] Dashboard incidents received:", incidents)

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
      } else {
        console.warn("[v0] API failed, using mock data")
        const mockIncidents = [
          {
            id: 1,
            title: "Road Accident on Uhuru Highway",
            description: "Multi-vehicle collision blocking traffic",
            location: "Uhuru Highway, Nairobi",
            severity: "high",
            status: "active",
            reporter_name: "John Doe",
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            title: "Fire at Industrial Area",
            description: "Building fire requiring immediate response",
            location: "Industrial Area, Nairobi",
            severity: "medium",
            status: "resolved",
            reporter_name: "Jane Smith",
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ]

        setStats({
          activeReports: mockIncidents.filter((i) => i.status !== "resolved").length,
          critical: mockIncidents.filter((i) => i.severity === "high").length,
          responders: 20,
          resolved: mockIncidents.filter((i) => i.status === "resolved").length,
        })

        setRecentReports(
          mockIncidents.slice(0, 3).map((incident) => ({
            ...incident,
            mediaCount: Math.floor(Math.random() * 5) + 1,
            timeAgo: getTimeAgo(new Date(incident.created_at)),
          })),
        )
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setStats({
        activeReports: 3,
        critical: 1,
        responders: 20,
        resolved: 2,
      })
      setRecentReports([])
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
<<<<<<< HEAD
      high: "bg-red-100 text-red-800 border border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      low: "bg-green-100 text-green-800 border border-green-200",
=======
      high: "bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md",
      medium: "bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-md",
      low: "bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md",
>>>>>>> feature/frontend-ui
    }
    return badges[severity] || badges.low
  }

  if (loading) {
    return (
<<<<<<< HEAD
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
=======
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-4 lg:space-y-6">
          <div className="h-6 lg:h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 lg:h-24 bg-gray-200 rounded"></div>
>>>>>>> feature/frontend-ui
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--ajali-red)" }}>
            Emergency Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Real-time accident reports and emergency response</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            className="text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base"
            style={{ background: "linear-gradient(135deg, var(--ajali-blue), var(--ajali-gradient-end))" }}
          >
            🗺️ <span className="hidden sm:inline ml-1">View Map</span>
          </Button>
          <div className="flex items-center space-x-2 bg-red-50 px-3 lg:px-4 py-2 rounded-lg">
            <div className="w-5 h-5 lg:w-6 lg:h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🔔</span>
            </div>
            <span className="text-xs lg:text-sm font-medium text-red-700 hidden sm:inline">Alerts</span>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">1</span>
            <span className="text-xs text-red-600 ml-2 hidden lg:inline">New Report</span>
>>>>>>> feature/frontend-ui
          </div>
        </div>
      </div>

<<<<<<< HEAD
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
=======
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-red-600 mb-1">Active Reports</p>
                <p className="text-xl lg:text-3xl font-bold text-red-700">{stats.activeReports}</p>
                <p className="text-xs text-red-500 mt-1 hidden lg:block">Requires attention</p>
              </div>
              <div
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--ajali-red), #ef4444)" }}
              >
                <span className="text-white text-lg lg:text-xl">⚠️</span>
>>>>>>> feature/frontend-ui
              </div>
            </div>
          </CardContent>
        </Card>

<<<<<<< HEAD
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Critical</p>
                <p className="text-3xl font-bold text-orange-700">{stats.critical}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">📈</span>
=======
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-orange-600 mb-1">Critical</p>
                <p className="text-xl lg:text-3xl font-bold text-orange-700">{stats.critical}</p>
                <p className="text-xs text-orange-500 mt-1 hidden lg:block">High priority</p>
              </div>
              <div
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--ajali-orange), #dc2626)" }}
              >
                <span className="text-white text-lg lg:text-xl">📈</span>
>>>>>>> feature/frontend-ui
              </div>
            </div>
          </CardContent>
        </Card>

<<<<<<< HEAD
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Responders</p>
                <p className="text-3xl font-bold text-blue-700">{stats.responders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
=======
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-blue-600 mb-1">Responders</p>
                <p className="text-xl lg:text-3xl font-bold text-blue-700">{stats.responders}</p>
                <p className="text-xs text-blue-500 mt-1 hidden lg:block">Currently active</p>
              </div>
              <div
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--ajali-blue), var(--ajali-gradient-end))" }}
              >
                <span className="text-white text-lg lg:text-xl">👥</span>
>>>>>>> feature/frontend-ui
              </div>
            </div>
          </CardContent>
        </Card>

<<<<<<< HEAD
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Resolved</p>
                <p className="text-3xl font-bold text-green-700">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
=======
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-green-600 mb-1">Resolved</p>
                <p className="text-xl lg:text-3xl font-bold text-green-700">{stats.resolved}</p>
                <p className="text-xs text-green-500 mt-1 hidden lg:block">Successfully handled</p>
              </div>
              <div
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--ajali-green), #059669)" }}
              >
                <span className="text-white text-lg lg:text-xl">✅</span>
>>>>>>> feature/frontend-ui
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

<<<<<<< HEAD
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
=======
      <Card className="border-red-200/50 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: "linear-gradient(135deg, var(--ajali-gradient-start), var(--ajali-gradient-end))",
                }}
              >
                <span className="text-white text-lg">⚠️</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-900 text-sm lg:text-base">Critical Emergency Alert</h3>
                <p className="text-red-700 text-xs lg:text-sm">1 critical accident requiring immediate attention.</p>
              </div>
            </div>
            <Button className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base">
              View Critical
            </Button>
>>>>>>> feature/frontend-ui
          </div>
        </CardContent>
      </Card>

<<<<<<< HEAD
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
=======
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <div className="relative w-full sm:w-80 lg:w-96">
            <input
              type="text"
              placeholder="Search by location, type, or description..."
              className="w-full pl-8 lg:pl-10 pr-4 py-2 lg:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all duration-300 text-sm lg:text-base"
            />
            <span className="absolute left-2 lg:left-3 top-2.5 lg:top-3.5 text-gray-400">🔍</span>
          </div>
          <div className="flex space-x-2">
            <select className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 shadow-sm transition-all duration-300 text-sm lg:text-base">
              <option>All Types</option>
              <option>Road Accident</option>
              <option>Fire</option>
              <option>Flood</option>
            </select>
            <select className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 shadow-sm transition-all duration-300 text-sm lg:text-base">
              <option>All Levels</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
        <p className="text-xs lg:text-sm text-gray-600 bg-gray-50 px-2 lg:px-3 py-1 lg:py-2 rounded-lg">
          5 reports found
        </p>
      </div>

      <div>
        <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-4 lg:mb-6">Recent Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {recentReports.map((report, index) => (
            <Card
              key={report.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-white/80 backdrop-blur-sm"
            >
              <div className="relative">
                <div className="h-32 lg:h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-2xl lg:text-4xl text-gray-400">📷</span>
                    <p className="text-xs lg:text-sm text-gray-500 mt-2">{report.mediaCount} media files</p>
                  </div>
                </div>

                <div className="absolute top-2 lg:top-3 left-2 lg:left-3 flex space-x-2">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-md">
>>>>>>> feature/frontend-ui
                    <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                    Verified
                  </span>
                </div>

<<<<<<< HEAD
                {/* Severity badge */}
                <div className="absolute top-3 right-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityBadge(report.severity)}`}>
=======
                <div className="absolute top-2 lg:top-3 right-2 lg:right-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium shadow-md ${getSeverityBadge(report.severity)}`}
                  >
>>>>>>> feature/frontend-ui
                    {report.severity?.toUpperCase()}
                  </span>
                </div>

<<<<<<< HEAD
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
=======
                <div className="absolute bottom-2 lg:bottom-3 left-2 lg:left-3">
                  <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
                    {report.timeAgo}
                  </span>
                </div>
              </div>

              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-yellow-500">🚗</span>
                    <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm lg:text-base">{report.title}</h3>
                  </div>
                  <div className="flex space-x-1 flex-shrink-0">
                    <button className="p-1 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors">👁️</button>
                    <button className="p-1 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors">✏️</button>
                    <button className="p-1 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors">🗑️</button>
                  </div>
                </div>

                <p className="text-xs lg:text-sm text-gray-600 mb-4 line-clamp-2">{report.description}</p>

                <div className="flex flex-col space-y-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span>📍</span>
                    <span className="line-clamp-1">{report.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span>👤</span>
                      <span>{report.reporter_name || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>👥</span>
                      <span>{Math.floor(Math.random() * 5) + 1} responders</span>
                    </div>
>>>>>>> feature/frontend-ui
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
