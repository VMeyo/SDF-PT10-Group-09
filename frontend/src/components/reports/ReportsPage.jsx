"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"

export const ReportsPage = () => {
  const [stats, setStats] = useState({
    totalReports: 4,
    pending: 1,
    resolved: 1,
    rejected: 1,
  })
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [loading, setLoading] = useState(true)

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [reports, searchTerm, statusFilter])

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_BASE}/incidents/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data)

        // Calculate stats
        setStats({
          totalReports: data.length,
          pending: data.filter((r) => r.status === "pending").length,
          resolved: data.filter((r) => r.status === "resolved").length,
          rejected: data.filter((r) => r.status === "rejected").length,
        })
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = reports

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "All Status") {
      filtered = filtered.filter((report) => report.status === statusFilter.toLowerCase())
    }

    setFilteredReports(filtered)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-orange-100 text-orange-800 border border-orange-200",
      resolved: "bg-green-100 text-green-800 border border-green-200",
      rejected: "bg-red-100 text-red-800 border border-red-200",
      responding: "bg-blue-100 text-blue-800 border border-blue-200",
    }
    return badges[status] || badges.pending
  }

  const getSeverityColor = (severity) => {
    const colors = {
      high: "text-red-600",
      medium: "text-yellow-600",
      low: "text-green-600",
    }
    return colors[severity] || colors.medium
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
          <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-600">Manage your accident reports and track their status</p>
        </div>
        <div className="flex items-center space-x-4">
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
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Reports</p>
                <p className="text-3xl font-bold text-blue-700">{stats.totalReports}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending</p>
                <p className="text-3xl font-bold text-orange-700">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">⏰</span>
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

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Rejected</p>
                <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Messages */}
      <div className="space-y-4 mb-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-800">
                <span className="font-medium">You have 1 rejected report.</span> Check your email for details from the
                admin team.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <span className="text-blue-500">ℹ️</span>
              <p className="text-blue-800">
                <span className="font-medium">1 of your reports are currently under investigation.</span> You'll receive
                email updates as they progress.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search your reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Resolved</option>
            <option>Rejected</option>
            <option>Responding</option>
          </select>
          <p className="text-sm text-gray-600">{filteredReports.length} reports found</p>
        </div>
      </div>

      {/* Reports List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Reports</h2>
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🚗</span>
                        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(report.status)}`}>
                          {report.status}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(report.severity)}`}
                        >
                          {report.severity}
                        </span>
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                          Verified
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{report.description}</p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <span>📍</span>
                        <span>{report.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📅</span>
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📷</span>
                        <span>{Math.floor(Math.random() * 5) + 1} media</span>
                      </div>
                    </div>

                    {report.status === "responding" && (
                      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-purple-800 text-sm">
                          <span className="font-medium">Emergency Response Active:</span> Emergency services are
                          responding to this incident. Thank you for your report.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <span className="text-gray-400">👁️</span>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <span className="text-gray-400">✏️</span>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <span className="text-gray-400">🗑️</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">No reports found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters to see more results.</p>
              <Button className="bg-red-500 hover:bg-red-600 text-white">+ Report New Incident</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
