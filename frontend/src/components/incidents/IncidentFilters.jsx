"use client"

import { Input } from "../ui/Input"
import { Button } from "../ui/Button"

export const IncidentFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const categories = [
    "All Categories",
    "Traffic Accident",
    "Fire Emergency",
    "Medical Emergency",
    "Crime",
    "Natural Disaster",
    "Infrastructure",
    "Other",
  ]

  const statuses = ["All Statuses", "pending", "in_progress", "resolved"]

  const severities = ["All Severities", "low", "medium", "high"]

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === `All ${key.charAt(0).toUpperCase() + key.slice(1)}` ? "" : value,
    })
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filter Incidents</h3>
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <Input
            placeholder="Search incidents..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <select
            value={filters.category || "All Categories"}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible-outline-none focus-visible-ring-2 focus-visible-ring-offset-2"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select
            value={filters.status || "All Statuses"}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible-outline-none focus-visible-ring-2 focus-visible-ring-offset-2"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "All Statuses" ? status : status.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Severity</label>
          <select
            value={filters.severity || "All Severities"}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible-outline-none focus-visible-ring-2 focus-visible-ring-offset-2"
          >
            {severities.map((severity) => (
              <option key={severity} value={severity}>
                {severity === "All Severities" ? severity : severity.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
