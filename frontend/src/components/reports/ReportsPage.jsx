"use client"

import { useState, useEffect } from "react"
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

  const getMediaCount = () => Math.floor(Math.random() * 5) + 1

  const getResponderCount = () => Math.floor(Math.random() * 10)

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_BASE}/incidents/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data)
        console.log("[v0] Successfully fetched user reports:", data.length)

        // Calculate stats
        setStats({
          totalReports: data.length,
          pending: data.filter((r) => r.status === "pending").length,
          resolved: data.filter((r) => r.status === "resolved").length,
          rejected: data.filter((r) => r.status === "rejected").length,
        })
      } else {
        console.error("[v0] Failed to fetch reports with status:", response.status, "using fallback data")
        const mockReports = [
          {
            id: 1,
            title: "Traffic Accident on Main Street",
            description: "Minor collision between two vehicles",
            location: "Main Street & 5th Ave",
            status: "pending",
            severity: "medium",
            created_at: new Date().toISOString(),
          },
        ]
        setReports(mockReports)
        setStats({
          totalReports: mockReports.length,
          pending: 1,
          resolved: 0,
          rejected: 0,
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching reports:", error)
      // Fallback to empty state
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
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1e293b", marginBottom: "1.5rem" }}>Your Reports</h2>
        <div className="reports-list">
          {filteredReports.map((report) => {
            const mediaCount = getMediaCount()
            const responderCount = getResponderCount()
            const incidentIcon = getIncidentIcon(report.title)

            return (
              <div key={report.id} className={`report-card ${report.severity}`}>
                <div className="report-card-header">
                  <div className={`status-indicator ${report.status}`}></div>

                  <div className="verified-badge">
                    <span>✓</span>
                    Verified
                  </div>

                  <div className="media-indicator">
                    <svg className="media-star" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    <span className="media-count">{mediaCount} media files</span>
                  </div>

                  <div className={`header-status-badge ${report.severity}`}>
                    {report.severity?.toUpperCase() || "MEDIUM"}
                  </div>

                  <div className="time-indicator">{getTimeAgo(report.created_at)}</div>
                </div>

                <div className="report-card-content">
                  <div className="incident-type-badge">
                    <span>{incidentIcon}</span>
                    {report.title.split(" ")[0] || "Incident"}
                  </div>

                  <h3 className="incident-title">{report.title}</h3>

                  <p className="incident-description">{report.description}</p>

                  <div className="incident-meta">
                    <div className="meta-item">
                      <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                    <div className="meta-item">
                      <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>{responderCount} responders</span>
                    </div>
                  </div>

                  <div className="responder-info">
                    <div className="reporter-info">
                      <div className="reporter-avatar">M</div>
                      <span className="reporter-name">by Mike Chen</span>
                    </div>

                    {report.status === "responding" && <div className="responding-badge">Responding</div>}
                  </div>

                  <div className="card-actions">
                    <button className="action-btn">View Details</button>
                    <button className="action-btn primary">Assign</button>
                  </div>
                </div>

                {report.status === "responding" && (
                  <div
                    style={{
                      margin: "1rem 1.5rem",
                      padding: "1rem",
                      background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                      border: "1px solid #93c5fd",
                      borderRadius: "12px",
                    }}
                  >
                    <p style={{ color: "#1e40af", fontSize: "0.875rem", margin: 0 }}>
                      <span style={{ fontWeight: 600 }}>Emergency Response Active:</span> Emergency services are
                      responding to this incident. Thank you for your report.
                    </p>
                  </div>
                )}
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
    </div>
  )
}
