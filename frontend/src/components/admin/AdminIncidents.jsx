"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Card, CardContent } from "../ui/Card"
import { IncidentFilters } from "../incidents/IncidentFilters"
import { IncidentDetailPage } from "../incidents/IncidentDetailPage"
import { Input } from "../ui/Input"

export const AdminIncidents = ({ onStatsUpdate }) => {
  const [incidents, setIncidents] = useState([])
  const [filteredIncidents, setFilteredIncidents] = useState([])
  const [filters, setFilters] = useState({})
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingIncident, setEditingIncident] = useState(null)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    severity: "",
    status: "",
  })
  const [saving, setSaving] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1"
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchIncidents()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [incidents, filters])

  const fetchIncidents = async () => {
    try {
      console.log("[v0] Admin fetching incidents from:", `${API_BASE}/incidents/`)
      const response = await fetch(`${API_BASE}/incidents/`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Admin received incidents:", data.length, "incidents")
        console.log(
          "[v0] Sample incident statuses:",
          data.slice(0, 3).map((i) => ({ id: i.id, status: i.status, title: i.title })),
        )
        setIncidents(data)
      } else {
        console.log("[v0] Admin fetch failed with status:", response.status)
      }
    } catch (error) {
      console.error("[v0] Admin error fetching incidents:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
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
  }

  const updateIncidentStatus = async (incidentId, newStatus) => {
    setUpdating(incidentId)

    try {
      const response = await fetch(`${API_BASE}/incidents/${incidentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setIncidents(
          incidents.map((incident) => (incident.id === incidentId ? { ...incident, status: newStatus } : incident)),
        )
        onStatsUpdate()
      }
    } catch (error) {
      console.error("Error updating incident status:", error)
    } finally {
      setUpdating(null)
    }
  }

  const editIncident = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`${API_BASE}/admin/incidents/${editingIncident.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedIncident = await response.json()
        setIncidents(
          incidents.map((incident) =>
            incident.id === editingIncident.id ? { ...incident, ...updatedIncident } : incident,
          ),
        )
        alert("Incident updated successfully!")
        setShowEditModal(false)
        setEditingIncident(null)
        onStatsUpdate()
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.msg || errorData.message || "Failed to update incident")
      }
    } catch (error) {
      console.error("Error updating incident:", error)
      alert("Error updating incident")
    } finally {
      setSaving(false)
    }
  }

  const deleteIncident = async (incidentId) => {
    if (!confirm("Are you sure you want to delete this incident? This action cannot be undone.")) return

    try {
      const response = await fetch(`${API_BASE}/admin/incidents/${incidentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setIncidents(incidents.filter((incident) => incident.id !== incidentId))
        alert("Incident deleted successfully!")
        onStatsUpdate()
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.msg || errorData.message || "Failed to delete incident")
      }
    } catch (error) {
      console.error("Error deleting incident:", error)
      alert("Error deleting incident")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "investigating":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading incidents...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">All Incidents</h2>
        <p className="text-muted-foreground">Manage and review all reported incidents</p>
      </div>

      <IncidentFilters filters={filters} onFiltersChange={setFilters} onClearFilters={() => setFilters({})} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredIncidents.length} of {incidents.length} incidents
        </p>
      </div>

      <div className="space-y-4">
        {filteredIncidents.map((incident) => {
          const reporterId = incident.created_by || incident.user_id
          const reporterName = incident.reporter_name || (reporterId ? `User #${reporterId}` : "Anonymous Reporter")

          const mediaArray = incident.media || []
          const firstImage = mediaArray.find(
            (m) => m.file_type?.startsWith("image/") || m.file_url?.match(/\.(jpg|jpeg|png|gif)$/i),
          )

          return (
            <Card key={incident.id} className="hover:shadow-md transition-shadow overflow-hidden">
              {firstImage && (
                <div
                  className="h-48 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${
                      firstImage.file_url?.startsWith("http")
                        ? firstImage.file_url
                        : `${API_BASE.replace("/api/v1", "")}${firstImage.file_url}`
                    })`,
                  }}
                >
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getSeverityColor(incident.severity)}`}
                    >
                      {incident.severity?.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
                      {new Date(incident.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{incident.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <span>📍 {incident.location}</span>
                      {!firstImage && <span>📅 {new Date(incident.created_at).toLocaleDateString()}</span>}
                      <span>👤 {reporterName}</span>
                    </div>
                  </div>
                  {!firstImage && (
                    <div className="flex flex-col space-y-2">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(incident.status)}`}
                      >
                        {incident.status?.replace("_", " ").toUpperCase()}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getSeverityColor(incident.severity)}`}
                      >
                        {incident.severity?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground mb-4 line-clamp-2">{incident.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">
                      Category: <span className="font-medium">{incident.category}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">ID: #{incident.id}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {incident.status !== "resolved" && (
                      <>
                        {incident.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateIncidentStatus(incident.id, "investigating")}
                            disabled={updating === incident.id}
                          >
                            {updating === incident.id ? "Updating..." : "Start Investigation"}
                          </Button>
                        )}
                        {incident.status === "investigating" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateIncidentStatus(incident.id, "approved")}
                            disabled={updating === incident.id}
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          >
                            {updating === incident.id ? "Updating..." : "Approve"}
                          </Button>
                        )}
                        {incident.status === "approved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateIncidentStatus(incident.id, "in_progress")}
                            disabled={updating === incident.id}
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                          >
                            {updating === incident.id ? "Updating..." : "Start Review"}
                          </Button>
                        )}
                        {incident.status === "in_progress" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateIncidentStatus(incident.id, "resolved")}
                            disabled={updating === incident.id}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                          >
                            {updating === incident.id ? "Updating..." : "Mark Resolved"}
                          </Button>
                        )}
                      </>
                    )}
                    {incident.status === "resolved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateIncidentStatus(incident.id, "in_progress")}
                        disabled={updating === incident.id}
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                      >
                        {updating === incident.id ? "Updating..." : "Reopen"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingIncident(incident)
                        setEditForm({
                          title: incident.title,
                          description: incident.description,
                          location: incident.location,
                          category: incident.category,
                          severity: incident.severity,
                          status: incident.status,
                        })
                        setShowEditModal(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteIncident(incident.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedIncident(incident.id)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredIncidents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No incidents found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
          </CardContent>
        </Card>
      )}

      {showEditModal && editingIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Incident #{editingIncident.id}</h3>
            <form onSubmit={editIncident} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  placeholder="Incident Title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Incident Description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[100px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <Input
                  placeholder="Location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    <option value="fire">Fire</option>
                    <option value="flood">Flood</option>
                    <option value="accident">Accident</option>
                    <option value="crime">Crime</option>
                    <option value="medical">Medical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={editForm.severity}
                    onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="investigating">Investigating</option>
                  <option value="approved">Approved</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingIncident(null)
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedIncident && (
        <IncidentDetailPage incidentId={selectedIncident} onBack={() => setSelectedIncident(null)} />
      )}
    </div>
  )
}
