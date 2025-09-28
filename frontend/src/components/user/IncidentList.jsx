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

      <div className="incident-list-container">
        {filteredIncidents.map((incident) => (
          <div key={incident.id} className="incident-card">
            {/* Incident Header */}
            <div className="incident-header">
              <div className="incident-title-section">
                <div className="incident-badges">
                  <h3 className="incident-title">{incident.title}</h3>
                  <span className={`status-badge ${getStatusColor(incident.status)}`}>
                    {incident.status === "reported"
                      ? "reported"
                      : incident.status === "under_investigation"
                        ? "under investigation"
                        : incident.status?.replace("_", " ") || "unknown"}
                  </span>
                  <span className={`severity-badge ${getSeverityColor(incident.severity)}`}>
                    {incident.severity || "medium"}
                  </span>
                  {incident.verified && <span className="verified-badge">Verified</span>}
                </div>
                <p className="incident-description">{incident.description}</p>
              </div>
            </div>

            {/* Incident Details */}
            <div className="incident-details">
              <div className="incident-detail-item">
                <span>📍</span>
                <span>{incident.location}</span>
              </div>
              <div className="incident-detail-item">
                <span>🕒</span>
                <span>
                  {new Date(incident.created_at).toLocaleDateString()},{" "}
                  {new Date(incident.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div>
                <span>by {incident.reporter_name || incident.user?.name || "You"}</span>
              </div>
              <div>
                <span>{incident.media_count || incident.media?.length || 0} media files</span>
              </div>
            </div>

            {/* Actions - Only View for users */}
            <div className="incident-actions">
              <div className="incident-status-info">
                <span className="status-text">
                  Status: <span className="status-value">{incident.status?.replace("_", " ") || "Unknown"}</span>
                </span>
              </div>

              <div className="action-buttons">
                <Button variant="outline" size="sm" onClick={() => onViewDetail?.(incident.id)} className="view-button">
                  <span className="mr-1">👁️</span>
                  View
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
                >
                  <span className="mr-1">{deletingIncident === incident.id ? "⏳" : "🗑️"}</span>
                  {deletingIncident === incident.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        ))}
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
