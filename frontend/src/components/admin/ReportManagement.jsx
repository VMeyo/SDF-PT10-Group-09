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
<<<<<<< HEAD
    resolved: 0,
=======
    approved: 0,
>>>>>>> feature/frontend-ui
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
<<<<<<< HEAD
      console.log("[v0] Fetching reports from:", `${API_BASE}/incidents/`)
      const response = await fetch(`${API_BASE}/incidents/`, {
=======
      const response = await fetch(`${API_BASE}/incidents`, {
>>>>>>> feature/frontend-ui
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
<<<<<<< HEAD
        console.log("[v0] Fetched reports data:", data)
        setReports(data)
      } else {
        console.log("[v0] API response not ok, status:", response.status)
        const mockReports = [
          {
            id: 1,
            title: "Road Accident on Main Street",
            description: "Multiple vehicle collision blocking traffic",
            location: "Main Street & 5th Avenue",
            category: "Road Accident",
            severity: "high",
            status: "pending",
            reporter_name: "John Doe",
            reporter_email: "john@example.com",
            created_at: new Date().toISOString(),
            media_count: 3,
            verified: false,
          },
          {
            id: 2,
            title: "Building Fire Downtown",
            description: "Smoke visible from residential building",
            location: "Downtown District",
            category: "Fire",
            severity: "critical",
            status: "in_progress",
            reporter_name: "Jane Smith",
            reporter_email: "jane@example.com",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            media_count: 5,
            verified: true,
          },
        ]
        setReports(mockReports)
      }
    } catch (error) {
      console.error("[v0] Error fetching reports:", error)
=======
        setReports(data)
      } else {
        setReports([])
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      setReports([])
>>>>>>> feature/frontend-ui
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
<<<<<<< HEAD
      pending: reports.filter((r) => r.status === "pending").length,
      inProgress: reports.filter((r) => r.status === "in_progress").length,
      resolved: reports.filter((r) => r.status === "resolved").length,
=======
      pending: reports.filter((r) => r.status === "pending" || r.status === "reported").length,
      inProgress: reports.filter((r) => r.status === "in_progress" || r.status === "under_investigation").length,
      approved: reports.filter((r) => r.status === "approved").length,
>>>>>>> feature/frontend-ui
      rejected: reports.filter((r) => r.status === "rejected").length,
    })
  }

  const updateReportStatus = async (reportId, newStatus, notes = "") => {
    setUpdating(reportId)
    try {
<<<<<<< HEAD
      console.log("[v0] Updating report status:", reportId, newStatus)
=======
>>>>>>> feature/frontend-ui
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

<<<<<<< HEAD
        // Update selected report if it's currently being viewed
        if (selectedReportId && selectedReportId === reportId) {
          // Assuming IncidentDetailPage will handle the update internally
        }

        console.log("[v0] Report status updated successfully")
      } else {
        console.log("[v0] Failed to update report status, status:", response.status)
        alert("Failed to update report status. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error updating report status:", error)
=======
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
          } catch (error) {
            console.error("Error awarding points:", error)
          }
        }

        // Show success feedback
        alert(`Report status updated to ${newStatus}`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.message || errorData.msg || "Failed to update report status. Please try again.")
      }
    } catch (error) {
      console.error("Error updating report status:", error)
>>>>>>> feature/frontend-ui
      alert("Error updating report status. Please check your connection.")
    } finally {
      setUpdating(null)
    }
  }

<<<<<<< HEAD
  const assignReportToUser = async (reportId, userId) => {
    try {
      console.log("[v0] Assigning report:", reportId, "to user:", userId)
      const response = await fetch(`${API_BASE}/incidents/${reportId}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignedTo: userId }),
      })

      if (response.ok) {
        setReports(reports.map((report) => (report.id === reportId ? { ...report, assignedTo: userId } : report)))
        console.log("[v0] Report assigned successfully")
      }
    } catch (error) {
      console.error("[v0] Error assigning report:", error)
    }
  }

  const bulkUpdateReports = async (action) => {
    if (selectedReports.length === 0) return

    try {
      console.log("[v0] Bulk updating reports:", selectedReports, "action:", action)
      const response = await fetch(`${API_BASE}/incidents/bulk`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportIds: selectedReports, action }),
      })

      if (response.ok) {
        fetchReports()
        setSelectedReports([])
        console.log("[v0] Bulk update completed successfully")
      }
    } catch (error) {
      console.error("[v0] Error performing bulk action:", error)
    }
  }

=======
>>>>>>> feature/frontend-ui
  const deleteReport = async (reportId) => {
    if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return
    }

    try {
<<<<<<< HEAD
      console.log("[v0] Deleting report:", reportId)
=======
>>>>>>> feature/frontend-ui
      const response = await fetch(`${API_BASE}/incidents/${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
<<<<<<< HEAD
=======
          "Content-Type": "application/json",
>>>>>>> feature/frontend-ui
        },
      })

      if (response.ok) {
<<<<<<< HEAD
        // Remove from both reports and filteredReports
        const updatedReports = reports.filter((report) => report.id !== reportId)
        setReports(updatedReports)

        // Close detail view if deleted report was being viewed
=======
        const updatedReports = reports.filter((report) => report.id !== reportId)
        setReports(updatedReports)

>>>>>>> feature/frontend-ui
        if (selectedReportId && selectedReportId === reportId) {
          handleBackToList()
        }

<<<<<<< HEAD
        console.log("[v0] Report deleted successfully")
      } else {
        console.log("[v0] Failed to delete report, status:", response.status)
        alert("Failed to delete report. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error deleting report:", error)
=======
        // Show success message
        alert("Report deleted successfully")
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.message || errorData.msg || "Failed to delete report. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting report:", error)
>>>>>>> feature/frontend-ui
      alert("Error deleting report. Please check your connection.")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
<<<<<<< HEAD
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
=======
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
>>>>>>> feature/frontend-ui
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
<<<<<<< HEAD
    // Refresh reports when coming back from detail view
=======
>>>>>>> feature/frontend-ui
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
<<<<<<< HEAD
        <div className="flex space-x-2">
          {selectedReports.length > 0 && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => bulkUpdateReports("approve")}>
                Approve Selected
              </Button>
              <Button variant="outline" size="sm" onClick={() => bulkUpdateReports("reject")}>
                Reject Selected
              </Button>
              <Button variant="outline" size="sm" onClick={() => bulkUpdateReports("resolve")}>
                Resolve Selected
              </Button>
            </div>
          )}
          <Button onClick={() => handleViewDetails(null)}>+ Create Report</Button>
        </div>
=======
>>>>>>> feature/frontend-ui
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
<<<<<<< HEAD
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-sm text-gray-600">Resolved</div>
=======
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
>>>>>>> feature/frontend-ui
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
<<<<<<< HEAD
              <option value="resolved">Resolved</option>
=======
              <option value="approved">Approved</option>
>>>>>>> feature/frontend-ui
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
<<<<<<< HEAD
              <div
                key={report.id}
                className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReports([...selectedReports, report.id])
                      } else {
                        setSelectedReports(selectedReports.filter((id) => id !== report.id))
                      }
                    }}
                    className="mt-1 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(report.severity)}`}>
                        {report.severity ? report.severity.toUpperCase() : "UNKNOWN"}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(report.status)}`}>
                        {report.status ? report.status.replace("_", " ").toUpperCase() : "UNKNOWN"}
                      </span>
                      {report.verified && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full border border-green-200">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">{report.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Location:</span> {report.location || "Not specified"}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {report.category || "Uncategorized"}
                      </div>
                      <div>
                        <span className="font-medium">Reporter:</span>{" "}
                        {report.reporter_name || report.user?.name || "Anonymous"}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(report.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Media:</span> {report.media_count || report.media?.length || 0}{" "}
                        files
                      </div>
                      <div>
                        <span className="font-medium">ID:</span> #{report.id}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(report.id)}>
                      View Details
                    </Button>

                    <select
                      value={report.status}
                      onChange={(e) => updateReportStatus(report.id, e.target.value)}
                      disabled={updating === report.id}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateReportStatus(report.id, "in_progress")}
                      disabled={updating === report.id || report.status === "resolved"}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      {updating === report.id ? "Updating..." : "Start Review"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateReportStatus(report.id, "resolved")}
                      disabled={updating === report.id || report.status === "resolved"}
                      className="text-green-600 hover:bg-green-50"
                    >
                      Resolve
                    </Button>

=======
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
>>>>>>> feature/frontend-ui
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReport(report.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
<<<<<<< HEAD
=======
                      <span className="mr-1">🗑️</span>
>>>>>>> feature/frontend-ui
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
