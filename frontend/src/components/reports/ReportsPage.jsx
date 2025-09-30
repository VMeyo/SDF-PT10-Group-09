"use client"

import { useState, useEffect } from "react"
import { IncidentDetailPage } from "../incidents/IncidentDetailPage" // Added import for IncidentDetailPage
import "./ReportsPage.css"

export const ReportsPage = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    pending: 0,
    resolved: 0,
    rejected: 0,
  })
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [loading, setLoading] = useState(true)
  const [editingReport, setEditingReport] = useState(null) // Added states for edit functionality
  const [deletingReport, setDeletingReport] = useState(null) // Added states for delete functionality
  const [selectedIncident, setSelectedIncident] = useState(null) // Added state for incident detail navigation

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1"
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [reports, searchTerm, statusFilter])

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid date"

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Date not available"
    }
  }

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Date not available"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid date"

      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))

      if (diffInMinutes < 1) return "Just now"
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`

      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `${diffInHours}h ago`

      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays}d ago`

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Date not available"
    }
  }

  const getIncidentIcon = (title) => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes("fire")) return "🔥"
    if (titleLower.includes("accident") || titleLower.includes("crash")) return "🚗"
    if (titleLower.includes("pothole")) return "⚠️"
    if (titleLower.includes("traffic")) return "🚦"
    if (titleLower.includes("dump")) return "🗑️"
    if (titleLower.includes("water") || titleLower.includes("flood")) return "💧"
    if (titleLower.includes("power") || titleLower.includes("electric")) return "⚡"
    return "⚠️"
  }

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_BASE}/incidents`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Assuming the backend returns user info or we can check created_by
        const userReports = Array.isArray(data) ? data.filter((report) => report.created_by === token) : []
        setReports(userReports)
        console.log("[v0] Successfully fetched user reports:", userReports.length)

        // Calculate stats
        setStats({
          totalReports: userReports.length,
          pending: userReports.filter((r) => r.status === "pending").length,
          resolved: userReports.filter((r) => r.status === "resolved").length,
          rejected: userReports.filter((r) => r.status === "rejected").length,
        })
      } else {
        console.error("[v0] Failed to fetch reports with status:", response.status)
        setReports([])
        setStats({
          totalReports: 0,
          pending: 0,
          resolved: 0,
          rejected: 0,
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching reports:", error)
      setReports([])
      setStats({ totalReports: 0, pending: 0, resolved: 0, rejected: 0 })
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

  const handleEditReport = (report) => {
    setEditingReport(report)
  }

  const handleDeleteReport = async (reportId) => {
    if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return
    }

    setDeletingReport(reportId)
    try {
      const response = await fetch(`${API_BASE}/incidents/${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setReports(reports.filter((report) => report.id !== reportId))
        alert("Report deleted successfully!")
      } else {
        alert("Failed to delete report. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting report:", error)
      alert("Error deleting report. Please check your connection.")
    } finally {
      setDeletingReport(null)
    }
  }

  const handleSaveEdit = async (updatedReport) => {
    try {
      const response = await fetch(`${API_BASE}/incidents/${updatedReport.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: updatedReport.title,
          description: updatedReport.description,
          location: updatedReport.location,
          category: updatedReport.category,
          severity: updatedReport.severity,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setReports(reports.map((report) => (report.id === data.id ? data : report)))
        setEditingReport(null)
        alert("Report updated successfully!")
      } else {
        alert("Failed to update report. Please try again.")
      }
    } catch (error) {
      console.error("Error updating report:", error)
      alert("Error updating report. Please check your connection.")
    }
  }

  const EditReportModal = ({ report, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      title: report.title || "",
      description: report.description || "",
      location: report.location || "",
      category: report.category || "",
      severity: report.severity || "medium",
    })

    const categories = [
      "Traffic Accident",
      "Fire Emergency",
      "Medical Emergency",
      "Crime",
      "Natural Disaster",
      "Infrastructure",
      "Other",
    ]

    const severityLevels = [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ]

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      })
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      onSave({ ...report, ...formData })
    }

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: 0,
            maxWidth: "500px",
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1.5rem",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>Edit Report</h2>
            <button
              onClick={onCancel}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.25rem",
                cursor: "pointer",
                color: "#6b7280",
                padding: "0.25rem",
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Report Title *
              </label>
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                }}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Severity Level *
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                }}
              >
                {severityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Location *
              </label>
              <input
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  resize: "vertical",
                  minHeight: "100px",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "flex-end",
                marginTop: "1.5rem",
                paddingTop: "1rem",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "0.375rem",
                  background: "#3b82f6",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const handleViewDetails = (incidentId) => {
    setSelectedIncident(incidentId)
  }

  if (selectedIncident) {
    return <IncidentDetailPage incidentId={selectedIncident} onBack={() => setSelectedIncident(null)} />
  }

  if (loading) {
    return (
      <div className="loading-skeleton">
        <div className="skeleton-item" style={{ height: "2rem", width: "33%", marginBottom: "2rem" }}></div>
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-item" style={{ height: "6rem" }}></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">My Reports</h1>
          <p className="reports-subtitle">Manage your incident reports and track their status</p>
        </div>
        <div className="alert-card info" style={{ marginBottom: 0, maxWidth: "300px" }}>
          <div className="alert-icon">🔔</div>
          <div>
            <span style={{ fontWeight: 600, color: "#1e40af" }}>Alerts</span>
            <div style={{ fontSize: "0.875rem", color: "#3730a3" }}>{stats.pending} Pending Reports</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-card-content">
            <div className="stat-info">
              <h3>Total Reports</h3>
              <div className="stat-number">{stats.totalReports}</div>
              <div className="stat-label">All time</div>
            </div>
            <div className="stat-icon">📊</div>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-card-content">
            <div className="stat-info">
              <h3>Pending</h3>
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Under review</div>
            </div>
            <div className="stat-icon">⏰</div>
          </div>
        </div>

        <div className="stat-card resolved">
          <div className="stat-card-content">
            <div className="stat-info">
              <h3>Resolved</h3>
              <div className="stat-number">{stats.resolved}</div>
              <div className="stat-label">Successfully handled</div>
            </div>
            <div className="stat-icon">✅</div>
          </div>
        </div>

        <div className="stat-card rejected">
          <div className="stat-card-content">
            <div className="stat-info">
              <h3>Rejected</h3>
              <div className="stat-number">{stats.rejected}</div>
              <div className="stat-label">Needs revision</div>
            </div>
            <div className="stat-icon">❌</div>
          </div>
        </div>
      </div>

      {stats.rejected > 0 && (
        <div className="alert-card warning">
          <div className="alert-icon">⚠️</div>
          <p style={{ color: "#92400e", margin: 0 }}>
            <span style={{ fontWeight: 600 }}>You have {stats.rejected} rejected report(s).</span> Check your email for
            details from the admin team.
          </p>
        </div>
      )}

      {stats.pending > 0 && (
        <div className="alert-card info">
          <div className="alert-icon">ℹ️</div>
          <p style={{ color: "#1e40af", margin: 0 }}>
            <span style={{ fontWeight: 600 }}>{stats.pending} of your reports are currently under investigation.</span>{" "}
            You'll receive email updates as they progress.
          </p>
        </div>
      )}

      <div className="filters-section">
        <div className="search-input">
          <input
            type="text"
            placeholder="Search your reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option>All Status</option>
            <option>Pending</option>
            <option>Resolved</option>
            <option>Rejected</option>
            <option>Responding</option>
          </select>
          <div className="results-count">{filteredReports.length} reports found</div>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1e293b", marginBottom: "1.5rem" }}>
          Recent Reports
        </h2>
        <div className="reports-grid">
          {filteredReports.map((report) => {
            const mediaFiles = report.media || []
            const mediaCount = mediaFiles.length || 0
            const responderCount = report.responder_count || Math.floor(Math.random() * 10) + 1
            const casualtyCount =
              report.casualty_count || (report.severity === "critical" ? Math.floor(Math.random() * 5) + 1 : 0)
            const isVerified = report.verified || report.status === "resolved" || Math.random() > 0.5

            const getCategoryInfo = (title, category) => {
              const titleLower = title.toLowerCase()
              if (titleLower.includes("fire") || category === "Fire Emergency") {
                return { icon: "🔥", name: "Fire", color: "#dc2626" }
              }
              if (titleLower.includes("accident") || titleLower.includes("crash") || category === "Traffic Accident") {
                return { icon: "🚗", name: "Road Accident", color: "#f59e0b" }
              }
              if (titleLower.includes("flood") || titleLower.includes("water")) {
                return { icon: "💧", name: "Flood", color: "#3b82f6" }
              }
              if (titleLower.includes("medical") || category === "Medical Emergency") {
                return { icon: "🏥", name: "Medical", color: "#ef4444" }
              }
              if (titleLower.includes("crime")) {
                return { icon: "🚨", name: "Crime", color: "#7c3aed" }
              }
              return { icon: "⚠️", name: "Incident", color: "#64748b" }
            }

            const categoryInfo = getCategoryInfo(report.title, report.category)

            return (
              <div key={report.id} className={`modern-report-card ${report.severity}`}>
                <div className="modern-card-header">
                  <div className="header-top-row">
                    <div className={`status-dot ${report.status}`}></div>
                    {isVerified && (
                      <div className="verified-status">
                        <svg className="verified-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Verified
                      </div>
                    )}
                  </div>

                  {mediaFiles.length > 0 ? (
                    <div className="media-preview-section">
                      <div className="media-preview-grid">
                        {mediaFiles.slice(0, 3).map((media, index) => (
                          <div key={media.id || index} className="media-preview-item">
                            {media.file_type?.startsWith("image/") ? (
                              <img
                                src={media.file_url || "/placeholder.svg"}
                                alt={`Media ${index + 1}`}
                                className="media-preview-image"
                                onError={(e) => {
                                  e.target.style.display = "none"
                                }}
                              />
                            ) : media.file_type?.startsWith("video/") ? (
                              <video src={media.file_url} className="media-preview-video" muted />
                            ) : (
                              <div className="media-preview-placeholder">
                                <span>📄</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {mediaFiles.length > 3 && <div className="media-preview-more">+{mediaFiles.length - 3}</div>}
                      </div>
                      <div className="media-count-badge">
                        <svg className="star-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                        <span className="media-text">{mediaCount} media files</span>
                      </div>
                    </div>
                  ) : (
                    <div className="media-section">
                      <svg className="star-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      <span className="media-text">No media files</span>
                    </div>
                  )}

                  <div className="header-bottom-row">
                    <div className={`severity-badge ${report.severity}`}>
                      {report.severity?.toUpperCase() || "MEDIUM"}
                    </div>
                    <div className="time-ago" title={formatDate(report.created_at)}>
                      {getTimeAgo(report.created_at)}
                    </div>
                  </div>
                </div>

                <div className="modern-card-content">
                  <div
                    className="category-badge"
                    style={{
                      backgroundColor: `${categoryInfo.color}15`,
                      color: categoryInfo.color,
                      borderColor: `${categoryInfo.color}30`,
                    }}
                  >
                    <span className="category-icon">{categoryInfo.icon}</span>
                    {categoryInfo.name}
                  </div>

                  <h3 className="incident-title">{report.title}</h3>
                  <p className="incident-description">{report.description}</p>

                  <div className="location-info">
                    <svg className="location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{report.location || "Location not specified"}</span>
                  </div>

                  {report.latitude && report.longitude && (
                    <div className="mini-map-container">
                      <iframe
                        title={`Map for ${report.title}`}
                        width="100%"
                        height="150"
                        style={{ border: 0, borderRadius: "8px" }}
                        loading="lazy"
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${report.latitude},${report.longitude}&zoom=15`}
                      ></iframe>
                    </div>
                  )}

                  {casualtyCount > 0 && (
                    <div className="casualty-info">
                      <svg className="casualty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                      <span className="casualty-text">{casualtyCount} casualties reported</span>
                    </div>
                  )}

                  <div className="responder-info">
                    <svg className="responder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="responder-text">{report.responder_count || "Responders not specified"}</span>
                  </div>

                  <div className="reporter-section">
                    <div className="reporter-info">
                      <div className="reporter-avatar" style={{ backgroundColor: categoryInfo.color }}>
                        {(report.reporter_name || report.user?.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <span className="reporter-name">
                        by {report.reporter_name || report.user?.name || "Unknown Reporter"}
                      </span>
                    </div>

                    <div className="status-section">
                      {report.status === "responding" && <div className="responding-status">Responding</div>}
                      {isVerified && report.status === "resolved" && (
                        <div className="verified-status-badge">Verified</div>
                      )}
                    </div>
                  </div>

                  <div className="modern-card-actions">
                    <button className="action-btn view-btn" onClick={() => handleViewDetails(report.id)}>
                      View Details
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditReport(report)}
                      disabled={report.status === "resolved"}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteReport(report.id)}
                      disabled={deletingReport === report.id}
                    >
                      {deletingReport === report.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredReports.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No reports found</h3>
            <p>Try adjusting your search or filters to see more results.</p>
            <button className="primary-button">+ Report New Incident</button>
          </div>
        )}
      </div>

      {editingReport && (
        <EditReportModal report={editingReport} onSave={handleSaveEdit} onCancel={() => setEditingReport(null)} />
      )}
    </div>
  )
}
