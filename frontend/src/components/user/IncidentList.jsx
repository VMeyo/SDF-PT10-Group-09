"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"
import { IncidentFilters } from "../incidents/IncidentFilters"

export const IncidentList = ({ incidents, onViewDetail }) => {
  const [filters, setFilters] = useState({})
  const [filteredIncidents, setFilteredIncidents] = useState(incidents)

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
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  if (incidents.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold mb-2">No incidents reported yet</h3>
          <p className="text-muted-foreground">
            Start by reporting your first incident to help your community stay safe.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <IncidentFilters filters={filters} onFiltersChange={setFilters} onClearFilters={handleClearFilters} />

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
                    <span className={`font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity?.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(incident.status)}`}
                >
                  {incident.status?.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <p className="text-muted-foreground mb-4 line-clamp-3">{incident.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Category: <span className="font-medium">{incident.category}</span>
                  </span>
                  {incident.comments_count > 0 && (
                    <span className="text-sm text-muted-foreground">💬 {incident.comments_count} comments</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">ID: #{incident.id}</span>
                  <Button variant="outline" size="sm" onClick={() => onViewDetail?.(incident.id)}>
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
