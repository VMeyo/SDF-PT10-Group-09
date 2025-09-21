"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Card, CardContent } from "../ui/Card"
import { IncidentFilters } from "../incidents/IncidentFilters"
import { IncidentDetail } from "../incidents/IncidentDetail"

export const AdminIncidents = ({ onStatsUpdate }) => {
  const [incidents, setIncidents] = useState([])
  const [filteredIncidents, setFilteredIncidents] = useState([])
  const [filters, setFilters] = useState({})
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchIncidents()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [incidents, filters])

  const fetchIncidents = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setIncidents(data)
      }
    } catch (error) {
      console.error("Error fetching incidents:", error)
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
      const response = await fetch(`${API_BASE}/admin/incidents/${incidentId}/status`, {
        method: "PATCH",
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

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200"
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
        {filteredIncidents.map((incident) => (
          <Card key={incident.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{incident.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    <span>📍 {incident.location}</span>
                    <span>📅 {new Date(incident.created_at).toLocaleDateString()}</span>
                    <span>👤 {incident.reporter_name || "Anonymous"}</span>
                  </div>
                </div>
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
                          onClick={() => updateIncidentStatus(incident.id, "in_progress")}
                          disabled={updating === incident.id}
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
                  <Button variant="outline" size="sm" onClick={() => setSelectedIncident(incident.id)}>
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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

      {selectedIncident && <IncidentDetail incidentId={selectedIncident} onClose={() => setSelectedIncident(null)} />}
    </div>
  )
}
