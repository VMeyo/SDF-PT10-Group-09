"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/Card"
import { IncidentDetailPage } from "../incidents/IncidentDetailPage"
import "../../styles/emergency-dashboard.css"

export const EmergencyDashboard = () => {
  const [emergencyStats, setEmergencyStats] = useState({
    activeReports: 0,
    critical: 0,
    responders: 0,
    resolved: 0,
  })
  const [recentReports, setRecentReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [severityFilter, setSeverityFilter] = useState("All Levels")
  const [selectedIncident, setSelectedIncident] = useState(null)

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchEmergencyData()
  }, [])

  const fetchEmergencyData = async () => {
    try {
      const reportsResponse = await fetch(`${API_BASE}/incidents/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setRecentReports(reportsData)

        const stats = {
          activeReports: reportsData.filter((r) => r.status !== "resolved").length,
          critical: reportsData.filter((r) => r.severity === "critical" || r.severity === "high").length,
          responders: reportsData.reduce((sum, r) => sum + (r.responder_count || 0), 0),
          resolved: reportsData.filter((r) => r.status === "resolved").length,
        }
        setEmergencyStats(stats)
      }
    } catch (error) {
      console.error("Error fetching emergency data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = recentReports.filter((report) => {
    const matchesSearch =
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "All Types" || report.incident_type === typeFilter
    const matchesSeverity = severityFilter === "All Levels" || report.severity === severityFilter.toLowerCase()

    return matchesSearch && matchesType && matchesSeverity
  })

  const getSeverityBadge = (severity) => {
    const badges = {
      high: "HIGH",
      critical: "CRITICAL",
      medium: "MEDIUM",
      low: "LOW",
    }
    return badges[severity] || "MEDIUM"
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

  const getGradientClass = (severity) => {
    const gradients = {
      critical: "gradient-critical",
      high: "gradient-high",
      medium: "gradient-medium",
      low: "gradient-low",
    }
    return gradients[severity] || "gradient-medium"
  }

  const getStatusDotColor = (status) => {
    const colors = {
      pending: "status-dot-blue",
      in_progress: "status-dot-blue",
      resolved: "status-dot-green",
      verified: "status-dot-green",
    }
    return colors[status] || "status-dot-blue"
  }

  const handleViewDetails = (incident) => {
    setSelectedIncident(incident.id)
  }

  const handleBackFromDetail = () => {
    setSelectedIncident(null)
    fetchEmergencyData() // Refresh data when returning
  }

  if (selectedIncident) {
    return <IncidentDetailPage incidentId={selectedIncident} onBack={handleBackFromDetail} isAdmin={true} />
  }

  if (loading) {
    return (
      <div className="emergency-dashboard">
        <div className="emergency-header">
          <div className="loading-shimmer loading-title"></div>
        </div>
        <div className="emergency-stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="loading-shimmer loading-card"></div>
          ))}
        </div>
        <div className="loading-shimmer loading-section"></div>
      </div>
    )
  }

  return (
    <div className="emergency-dashboard">
      <div className="emergency-header">
        <h1 className="emergency-title">Emergency Response Center</h1>
        <p className="emergency-subtitle">Monitor and manage emergency incidents in real-time</p>
      </div>

      {/* Stats Grid */}
      <div className="emergency-stats-grid">
        <Card className="emergency-stat-card critical">
          <CardContent>
            <div className="stat-content">
              <div className="stat-info">
                <h3>Active Reports</h3>
                <div className="stat-number">{emergencyStats.activeReports}</div>
              </div>
              <div className="stat-icon">
                <span>⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="emergency-stat-card warning">
          <CardContent>
            <div className="stat-content">
              <div className="stat-info">
                <h3>Critical</h3>
                <div className="stat-number">{emergencyStats.critical}</div>
              </div>
              <div className="stat-icon">
                <span>🔥</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="emergency-stat-card info">
          <CardContent>
            <div className="stat-content">
              <div className="stat-info">
                <h3>Responders</h3>
                <div className="stat-number">{emergencyStats.responders}</div>
              </div>
              <div className="stat-icon">
                <span>👥</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="emergency-stat-card success">
          <CardContent>
            <div className="stat-content">
              <div className="stat-info">
                <h3>Resolved</h3>
                <div className="stat-number">{emergencyStats.resolved}</div>
              </div>
              <div className="stat-icon">
                <span>✅</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {emergencyStats.critical > 0 && (
        <Card className="critical-alert">
          <CardContent>
            <div className="critical-alert-content">
              <div className="critical-alert-icon">
                <span>🚨</span>
              </div>
              <div className="critical-alert-text">
                <h3>Critical Emergency Alert</h3>
                <p>
                  {emergencyStats.critical} critical incident{emergencyStats.critical > 1 ? "s" : ""} requiring
                  immediate attention
                </p>
              </div>
              <button className="critical-alert-button">View Critical</button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="search-filters-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by location, type, or description..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filters-container">
          <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>All Types</option>
            <option>Road Accident</option>
            <option>Fire</option>
            <option>Flood</option>
            <option>Medical Emergency</option>
            <option>Crime</option>
            <option>Other</option>
          </select>
          <select className="filter-select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option>All Levels</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      {/* Reports Section */}
      <div className="reports-section">
        <div className="reports-header">
          <h2 className="reports-title">Recent Reports</h2>
          <span className="reports-count">
            {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""} found
          </span>
        </div>

        <div className="modern-reports-grid">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div key={report.id} className={`modern-report-card ${getGradientClass(report.severity)}`}>
                {/* Card Header with gradient background */}
                <div className="modern-card-header">
                  <div className="header-top">
                    <div className={`status-dot ${getStatusDotColor(report.status)}`}></div>
                    {report.verified && (
                      <div className="verified-badge">
                        <span className="verified-icon">✓</span>
                        <span>Verified</span>
                      </div>
                    )}
                    <div className="star-section">
                      <div className="star-icon">⭐</div>
                      <div className="media-count">{report.media_count || 0} media files</div>
                    </div>
                  </div>
                  <div className="header-bottom">
                    <div className={`severity-badge-modern ${report.severity}`}>
                      {getSeverityBadge(report.severity)}
                    </div>
                    <div className="timestamp-modern">{formatTimeAgo(report.created_at)}</div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="modern-card-content">
                  <div className="incident-category">
                    <span className="category-icon">{getIncidentIcon(report.incident_type)}</span>
                    <span className="category-text">{report.incident_type}</span>
                  </div>

                  <h3 className="incident-title">{report.title}</h3>
                  <p className="incident-description">{report.description}</p>

                  {report.media && report.media.length > 0 && (
                    <div className="media-preview">
                      <div className="media-grid">
                        {report.media.slice(0, 3).map((media, index) => (
                          <div key={index} className="media-item">
                            {media.file_url && media.file_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <img
                                src={media.file_url || "/placeholder.svg"}
                                alt={`Evidence ${index + 1}`}
                                className="media-thumbnail"
                                onError={(e) => {
                                  e.target.style.display = "none"
                                }}
                              />
                            ) : media.file_url && media.file_url.match(/\.(mp4|mov|avi)$/i) ? (
                              <video src={media.file_url} className="media-thumbnail" controls={false} muted />
                            ) : (
                              <div className="media-placeholder">
                                <span>📎</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {report.media.length > 3 && <div className="media-more">+{report.media.length - 3} more</div>}
                      </div>
                    </div>
                  )}

                  <div className="incident-meta">
                    <div className="meta-item">
                      <span className="meta-icon">📍</span>
                      <span>{report.location}</span>
                    </div>
                    {report.casualty_count > 0 && (
                      <div className="meta-item casualties">
                        <span className="meta-icon">🚨</span>
                        <span>{report.casualty_count} casualties reported</span>
                      </div>
                    )}
                    <div className="meta-item">
                      <span className="meta-icon">👥</span>
                      <span>{report.responder_count || 0} responders</span>
                    </div>
                  </div>

                  <div className="reporter-section">
                    <div className="reporter-avatar">
                      {(report.reporter_name || report.user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="reporter-name">
                      by {report.reporter_name || report.user?.name || "Unknown Reporter"}
                    </span>
                    <div className={`status-badge ${report.status}`}>
                      {report.status === "resolved" ? "Verified" : "Responding"}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="modern-card-actions">
                  <button className="action-btn view-details" onClick={() => handleViewDetails(report)}>
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3 className="empty-state-title">No reports found</h3>
              <p className="empty-state-description">
                {searchTerm || typeFilter !== "All Types" || severityFilter !== "All Levels"
                  ? "Try adjusting your search or filters"
                  : "Reports will appear here once they are submitted"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
