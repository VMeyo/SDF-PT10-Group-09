"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"
import { IncidentFilters } from "../incidents/IncidentFilters"
import "./IncidentList.css"

export const IncidentList = ({ incidents, onViewDetail, onIncidentUpdated, onIncidentDeleted }) => {
  const [filters, setFilters] = useState({})
  const [filteredIncidents, setFilteredIncidents] = useState(incidents)
  const [editingIncident, setEditingIncident] = useState(null)
  const [deletingIncident, setDeletingIncident] = useState(null)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1"
  const token = localStorage.getItem("token")

  // Update filtered incidents when incidents or filters change
  useState(() => {
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

  const handleSaveEdit = async (updatedIncident) => {
    try {
      const response = await fetch(`${API_BASE}/incidents/${updatedIncident.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: updatedIncident.title,
          description: updatedIncident.description,
          location: updatedIncident.location,
          category: updatedIncident.category,
          severity: updatedIncident.severity,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        onIncidentUpdated?.(data)
        setEditingIncident(null)
        alert("Incident updated successfully!")
      } else {
        alert("Failed to update incident. Please try again.")
      }
    } catch (error) {
      console.error("Error updating incident:", error)
      alert("Error updating incident. Please check your connection.")
    }
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
    const now = new Date()
    const reportDate = new Date(dateString)
    const diffInMinutes = Math.floor((now - reportDate) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
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

          return (
            <div key={incident.id} className="modern-report-card">
              <div className={`modern-card-header ${getGradientClass(incident.severity)}`}>
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
                    <span className="avatar-text">
                      {(incident.reporter_name || incident.user?.name || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="reporter-name">by {incident.reporter_name || incident.user?.name || "You"}</span>
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
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {editingIncident && (
        <EditIncidentModal
          incident={editingIncident}
          onSave={handleSaveEdit}
          onCancel={() => setEditingIncident(null)}
        />
      )}
    </div>
  )
}

const EditIncidentModalComponent = ({ incident, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: incident.title || "",
    description: incident.description || "",
    location: incident.location || "",
    category: incident.category || "",
    severity: incident.severity || "medium",
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
    onSave({ ...incident, ...formData })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Incident</h2>
          <button onClick={onCancel} className="modal-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Incident Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="severity">Severity Level *</label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              required
              className="form-select"
            >
              {severityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="form-textarea"
            />
          </div>

          <div className="modal-actions">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditIncidentModal = EditIncidentModalComponent
