"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"
import { Input } from "../ui/Input"
import { IncidentDetailPage } from "../incidents/IncidentDetailPage"

export const ReportManagement = () => {
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [selectedReports, setSelectedReports] = useState([])
  const [currentView, setCurrentView] = useState("list") // "list" or "detail"
  const [selectedReportId, setSelectedReportId] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    approved: 0,
    rejected: 0,
  })

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    applyFilters()
    calculateStats()
  }, [reports, searchTerm, statusFilter, severityFilter, categoryFilter, dateFilter])

  const fetchReports = async () => {
    try {
      console.log("[v0] Fetching reports from:", `${API_BASE}/incidents`)
      const response = await fetch(`${API_BASE}/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Fetched reports data:", data)
        setReports(data)
      } else {
        console.log("[v0] API response not ok, status:", response.status)
        setReports([])
      }
    } catch (error) {
      console.error("[v0] Error fetching reports:", error)
      setReports([])
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
          report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter)
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter((report) => report.severity === severityFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((report) => report.category === categoryFilter)
    }

    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      if (dateFilter !== "all") {
        filtered = filtered.filter((report) => new Date(report.created_at) >= filterDate)
      }
    }

    setFilteredReports(filtered)
  }

  const calculateStats = () => {
    setStats({
      total: reports.length,
      pending: reports.filter((r) => r.status === "pending" || r.status === "reported").length,
      inProgress: reports.filter((r) => r.status === "in_progress" || r.status === "under_investigation").length,
      approved: reports.filter((r) => r.status === "approved").length,
      rejected: reports.filter((r) => r.status === "rejected").length,
    })
  }

  const updateReportStatus = async (reportId, newStatus, notes = "") => {
    setUpdating(reportId)
    try {
      console.log("[v0] Updating report status:", reportId, newStatus)
      const response = await fetch(`${API_BASE}/incidents/${reportId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, notes }),
      })

      if (response.ok) {
        const updatedReports = reports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report,
        )
        setReports(updatedReports)

        // Award points for approved incidents
        if (newStatus === "approved") {
          try {
            const pointsResponse = await fetch(`${API_BASE}/incidents/${reportId}/award-points`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })
            if (pointsResponse.ok) {
              console.log("[v0] Points awarded for approved incident")
            } else {
              console.log("[v0] Points award failed but status updated")
            }
          } catch (error) {
            console.error("[v0] Error awarding points:", error)
          }
        }

        console.log("[v0] Report status updated successfully")
        // Show success feedback
        alert(`Report status updated to ${newStatus}`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log("[v0] Failed to update report status, status:", response.status, errorData)
        alert(errorData.message || errorData.msg || "Failed to update report status. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error updating report status:", error)
      alert("Error updating report status. Please check your connection.")
    } finally {
      setUpdating(null)
    }
  }

  const deleteReport = async (reportId) => {
    if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return
    }

    try {
      console.log("[v0] Deleting report:", reportId)
      const response = await fetch(`${API_BASE}/incidents/${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const updatedReports = reports.filter((report) => report.id !== reportId)
        setReports(updatedReports)

        if (selectedReportId && selectedReportId === reportId) {
          handleBackToList()
        }

        console.log("[v0] Report deleted successfully")
        // Show success message
        alert("Report deleted successfully")
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log("[v0] Failed to delete report, status:", response.status, errorData)
        alert(errorData.message || errorData.msg || "Failed to delete report. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error deleting report:", error)
      alert("Error deleting report. Please check your connection.")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
      case "verified":
        return "bg-green-100 text-green-800"
      case "in_progress":
      case "under_investigation":
        return "bg-blue-100 text-blue-800"
      case "pending":
      case "reported":
        return "bg-orange-100 text-orange-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity) => {
    if (!severity) return "bg-gray-500 text-white"

    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const handleViewDetails = (reportId) => {
    setSelectedReportId(reportId)
    setCurrentView("detail")
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedReportId(null)
    fetchReports()
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    )
  }

  if (currentView === "detail" && selectedReportId) {
    return <IncidentDetailPage incidentId={selectedReportId} onBack={handleBackToList} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Report Management</h2>
          <p className="text-muted-foreground">Manage and review all incident reports</p>
        </div>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search and Filter Reports</CardTitle>
          <CardDescription>Find reports using multiple criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="col-span-2"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="Road Accident">Road Accident</option>
              <option value="Fire">Fire</option>
              <option value="Flood">Flood</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Crime">Crime</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
          <CardDescription>Manage individual reports and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                {/* Report Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{report.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                        {report.status === "reported"
                          ? "reported"
                          : report.status === "under_investigation"
                            ? "under investigation"
                            : report.status?.replace("_", " ") || "unknown"}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(report.severity)}`}>
                        {report.severity || "medium"}
                      </span>
                      {report.verified && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Verified</span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{report.description}</p>
                  </div>
                </div>

                {/* Report Details */}
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>{report.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🕒</span>
                    <span>
                      {new Date(report.created_at).toLocaleDateString()}{" "}
                      {new Date(report.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div>
                    <span>by {report.reporter_name || "Unknown Reporter"}</span>
                  </div>
                  <div>
                    <span>{report.media_count || 0} media files</span>
                  </div>
                </div>

                {/* Status Change and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Change Status:</span>
                      <select
                        value={report.status}
                        onChange={(e) => updateReportStatus(report.id, e.target.value)}
                        disabled={updating === report.id}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(report.id)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <span className="mr-1">👁️</span>
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(report.id)}
                      className="text-green-600 hover:bg-green-50"
                    >
                      <span className="mr-1">✏️</span>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReport(report.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <span className="mr-1">🗑️</span>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
