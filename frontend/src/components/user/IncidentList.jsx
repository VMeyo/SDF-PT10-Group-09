"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"
import { IncidentFilters } from "../incidents/IncidentFilters"
import "./IncidentList.css"
import { EditIncidentModalComponent } from "./EditIncidentModal"

export const IncidentList = ({ incidents, onViewDetail, onIncidentUpdated, onIncidentDeleted }) => {
  const { user } = useAuth()
  const [filters, setFilters] = useState({})
  const [filteredIncidents, setFilteredIncidents] = useState(incidents)
  const [editingIncident, setEditingIncident] = useState(null)
  const [deletingIncident, setDeletingIncident] = useState(null)
  const [reportersData, setReportersData] = useState({})

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1"
  const token = localStorage.getItem("token")

  const fetchReporterData = async (userId) => {
    if (reportersData[userId]) {
      return reportersData[userId]
    }

    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setReportersData((prev) => ({ ...prev, [userId]: userData }))
        return userData
      }
    } catch (error) {
      console.error("[v0] Error fetching reporter data:", error)
    }
    return null
  }

  useEffect(() => {
    const uniqueUserIds = [...new Set(incidents.map((i) => i.created_by || i.user_id).filter(Boolean))]
    uniqueUserIds.forEach((userId) => fetchReporterData(userId))
  }, [incidents])

  useEffect(() => {
    let filtered = incidents

    if (filters.search) {
      filtered = filtered.filter(
        (incident) =>
          incident.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          incident.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          incident.location.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    if (filters.category) {
      filtered = filtered.filter((incident) => incident.category === filters.category)
    }

    if (filters.status) {
      filtered = filtered.filter((incident) => incident.status === filters.status)
    }

    if (filters.severity) {
      filtered = filtered.filter((incident) => incident.severity === filters.severity)
    }

    setFilteredIncidents(filtered)
  }, [incidents, filters])

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
      case "verified":
        return "status-approved"
      case "in_progress":
      case "under_investigation":
        return "status-in-progress"
      case "pending":
      case "reported":
        return "status-pending"
      case "rejected":
        return "status-rejected"
      default:
        return "status-default"
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "severity-critical"
      case "high":
        return "severity-high"
      case "medium":
        return "severity-medium"
      case "low":
        return "severity-low"
      default:
        return "severity-default"
    }
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  const handleEditIncident = (incident) => {
    setEditingIncident(incident)
  }

  const handleDeleteIncident = async (incidentId) => {
    if (!confirm("Are you sure you want to delete this incident? This action cannot be undone.")) {
      return
    }

    setDeletingIncident(incidentId)
    try {
      const response = await fetch(`${API_BASE}/incidents/${incidentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        onIncidentDeleted?.(incidentId)
        alert("Incident deleted successfully!")
      } else {
        alert("Failed to delete incident. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting incident:", error)
      alert("Error deleting incident. Please check your connection.")
    } finally {
      setDeletingIncident(null)
    }
  }

  const handleSaveEdit = async (incidentId) => {
    setEditingIncident(null)
    // Trigger parent component to refresh incidents
    onIncidentUpdated?.()
  }

  const getGradientClass = (severity) => {
    switch (severity) {
      case "critical":
        return "gradient-critical"
      case "high":
        return "gradient-high"
      case "medium":
        return "gradient-medium"
      case "low":
        return "gradient-low"
      default:
        return "gradient-medium"
    }
  }

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "traffic accident":
      case "road accident":
        return "🚗"
      case "fire emergency":
      case "fire":
        return "🔥"
      case "medical emergency":
        return "🚑"
      case "flood":
        return "🌊"
      case "crime":
        return "🚨"
      case "natural disaster":
        return "🌪️"
      case "infrastructure":
        return "🏗️"
      default:
        return "⚠️"
    }
  }

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Date not available"

    try {
      const reportDate = new Date(dateString)
      if (isNaN(reportDate.getTime())) return "Invalid date"

      const now = new Date()
      const diffInMinutes = Math.floor((now - reportDate) / (1000 * 60))

      if (diffInMinutes < 1) return "Just now"
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`

      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `${diffInHours}h ago`

      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays}d ago`

      return reportDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Date not available"
    }
  }

  if (incidents.length === 0) {
    return (
      <Card>
        <CardContent className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">No incidents reported yet</h3>
          <p className="empty-state-description">
            Start by reporting your first incident to help your community stay safe.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="incident-list-container">
      <IncidentFilters filters={filters} onFiltersChange={setFilters} onClearFilters={handleClearFilters} />

      <div className="filter-results">
        <p className="filter-count">
          Showing {filteredIncidents.length} of {incidents.length} incidents
        </p>
      </div>

      <div className="dashboard-reports-grid">
        {filteredIncidents.map((incident) => {
          const mediaCount = incident.media_count || incident.media?.length || 0
          const reporterId = incident.created_by || incident.user_id
          const reporterInfo = reportersData[reporterId]
          const reporterName =
            reporterInfo?.name || reporterInfo?.username || incident.reporter_name || "Anonymous Reporter"

          const isOwner = String(reporterId) === String(user?.id)
          const canEdit = isOwner && incident.status !== "resolved"
          const canDelete = isOwner

          const mediaArray = incident.media || []
          const firstImage = mediaArray.find(
            (m) => m.file_type?.startsWith("image/") || m.file_url?.match(/\.(jpg|jpeg|png|gif)$/i),
          )
          const remainingMedia = mediaArray.filter((m) => m !== firstImage).slice(0, 3)

          return (
            <div key={incident.id} className="modern-report-card">
              <div
                className={`modern-card-header ${getGradientClass(incident.severity)}`}
                style={
                  firstImage
                    ? {
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${
                          firstImage.file_url?.startsWith("http")
                            ? firstImage.file_url
                            : `${API_BASE.replace("/api/v1", "")}${firstImage.file_url}`
                        })`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }
                    : {}
                }
              >
                <div className="header-top">
                  <div className="status-indicator">
                    <div className={`status-dot ${incident.severity || "medium"}`}></div>
                    {incident.verified && (
                      <div className="verified-badge">
                        <span className="verified-icon">✓</span>
                        <span className="verified-text">Verified</span>
                      </div>
                    )}
                  </div>
                  {remainingMedia.length > 0 && (
                    <div
                      className="header-media-circles"
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      {remainingMedia.map((media, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "2px solid white",
                            backgroundColor: "#f3f4f6",
                          }}
                        >
                          {media.file_type?.startsWith("image/") || media.file_url?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img
                              src={
                                media.file_url?.startsWith("http")
                                  ? media.file_url
                                  : `${API_BASE.replace("/api/v1", "")}${media.file_url}`
                              }
                              alt={`Media ${idx + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none"
                                e.target.parentElement.innerHTML =
                                  '<div style="width:100%;height:100%;display:flex;alignItems:center;justifyContent:center;fontSize:16px">📷</div>'
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "16px",
                              }}
                            >
                              📎
                            </div>
                          )}
                        </div>
                      ))}
                      {mediaArray.length > 4 && (
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            border: "2px solid white",
                            backgroundColor: "rgba(255,255,255,0.9)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "#333",
                          }}
                        >
                          +{mediaArray.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="header-center">
                    <div className="star-icon">⭐</div>
                    <div className="media-count-text">{mediaCount} media files</div>
                  </div>
                </div>
                <div className="header-bottom">
                  <div className={`severity-badge ${incident.severity || "medium"}`}>
                    {(incident.severity || "medium").toUpperCase()}
                  </div>
                  <div className="time-ago">{getTimeAgo(incident.created_at)}</div>
                </div>
              </div>

              <div className="modern-card-content">
                <div className="category-section">
                  <div className="category-badge">
                    <span className="category-icon">
                      {getCategoryIcon(incident.incident_type || incident.category)}
                    </span>
                    <span className="category-text">{incident.incident_type || incident.category || "Other"}</span>
                  </div>
                </div>

                <h3 className="incident-title">{incident.title}</h3>
                <p className="incident-description">{incident.description}</p>

                <div className="location-section">
                  <span className="location-icon">📍</span>
                  <span className="location-text">{incident.location}</span>
                </div>

                <div className="stats-section">
                  {incident.casualty_count > 0 && (
                    <div className="stat-item casualties">
                      <span className="stat-icon">👥</span>
                      <span className="stat-text">{incident.casualty_count} casualties reported</span>
                    </div>
                  )}
                  <div className="stat-item responders">
                    <span className="stat-icon">👥</span>
                    <span className="stat-text">{incident.responder_count || 0} responders</span>
                  </div>
                </div>

                <div className="reporter-section">
                  <div className="reporter-avatar">
                    <span className="avatar-text">{reporterName.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="reporter-name">by {reporterName}</span>
                  <div className={`status-badge-small ${incident.status || "pending"}`}>
                    {incident.status === "resolved" ? "Verified" : "Responding"}
                  </div>
                </div>

                <div
                  className="incident-actions"
                  style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}
                >
                  <div
                    className="action-buttons"
                    style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetail?.(incident.id)}
                      className="view-button"
                    >
                      <span className="mr-1">👁️</span>
                      View Details
                    </Button>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditIncident(incident)}
                        className="edit-button"
                        disabled={incident.status === "resolved"}
                      >
                        <span className="mr-1">✏️</span>
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteIncident(incident.id)}
                        className="delete-button"
                        disabled={deletingIncident === incident.id}
                        style={{ color: "#dc2626", borderColor: "#fecaca" }}
                      >
                        <span className="mr-1">{deletingIncident === incident.id ? "⏳" : "🗑️"}</span>
                        {deletingIncident === incident.id ? "Deleting..." : "Delete"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {editingIncident && (
        <EditIncidentModalComponent
          incident={editingIncident}
          onSave={() => handleSaveEdit(editingIncident.id)}
          onCancel={() => setEditingIncident(null)}
        />
      )}
    </div>
  )
}
