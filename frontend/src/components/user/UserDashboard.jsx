"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { IncidentForm } from "./IncidentForm"
import { IncidentList } from "./IncidentList"
import { PointsSystem } from "../rewards/PointsSystem"
import { MapView } from "../map/MapView"
import { IncidentDetailPage } from "../incidents/IncidentDetailPage"
import { ProfilePage } from "../profile/ProfilePage"
import "./../../styles/dashboard.css"
import "./../../styles/sidebar.css"
import "./../../styles/user-dashboard.css"

export const UserDashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedIncidentId, setSelectedIncidentId] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      console.log("[v0] Fetching user data from /incidents/")

      const [incidentsRes, allIncidentsRes, pointsRes] = await Promise.all([
        fetch(`${API_BASE}/incidents/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).catch((err) => {
          console.log("[v0] /incidents/mine failed, will use fallback:", err)
          return { ok: false, status: 422 }
        }),
        fetch(`${API_BASE}/incidents/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_BASE}/users/points`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).catch((err) => {
          console.log("[v0] /users/points failed:", err)
          return { ok: false }
        }),
      ])

      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json()
        setIncidents(incidentsData)
        console.log("[v0] Successfully fetched user incidents:", incidentsData.length)
      } else {
        console.log("[v0] /incidents/mine failed with status:", incidentsRes.status, "using empty array")
        setIncidents([])
      }

      let allIncidents = []
      if (allIncidentsRes.ok) {
        allIncidents = await allIncidentsRes.json()
        console.log("[v0] Fetched all incidents:", allIncidents.length)
      } else {
        console.log("[v0] Failed to fetch all incidents, using empty array")
      }

      if (pointsRes.ok) {
        const pointsData = await pointsRes.json()
        setUserStats(pointsData)
        console.log("[v0] Successfully fetched user points")
      } else {
        console.log("[v0] Failed to fetch user points, using defaults")
      }

      const stats = {
        activeReports: allIncidents.filter((r) => r.status !== "resolved").length,
        critical: allIncidents.filter((r) => r.severity === "critical" || r.severity === "high").length,
        responders: allIncidents.reduce((sum, r) => sum + (r.responder_count || 0), 0),
        resolved: allIncidents.filter((r) => r.status === "resolved").length,
      }

      setUserStats((prev) => ({ ...prev, ...stats, allIncidents }))

      if (token) {
        try {
          const profileRes = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
          if (profileRes.ok) {
            const profileData = await profileRes.json()
            setUserData(profileData)
            console.log("[v0] Successfully fetched user profile")
          } else {
            console.log("[v0] Profile fetch failed with status:", profileRes.status)
            setUserData(user)
          }
        } catch (profileError) {
          console.log("[v0] Profile fetch error:", profileError)
          setUserData(user)
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching user data:", error)
      setUserData(user)
      setIncidents([])
      setUserStats({ activeTab: 0, critical: 0, responders: 0, resolved: 0, allIncidents: [] })
    } finally {
      setLoading(false)
    }
  }

  const handleIncidentCreated = (newIncident) => {
    setIncidents([newIncident, ...incidents])
    setActiveTab("incidents")
    fetchUserData() // Refresh stats
  }

  const handleViewIncidentDetail = (incidentId) => {
    setSelectedIncidentId(incidentId)
    setActiveTab("incident-detail")
  }

  const handleBackFromIncidentDetail = () => {
    setSelectedIncidentId(null)
    setActiveTab("incidents")
  }

  const userTabs = [
    { id: "overview", label: "Dashboard", icon: "🏠", description: "Emergency reports overview" },
    { id: "incidents", label: "My Reports", icon: "📋", description: "View and manage your reports" },
    { id: "report", label: "Report Incident", icon: "➕", description: "Report new incidents" },
    { id: "map", label: "Map View", icon: "🗺️", description: "Location-based incidents" },
    {
      id: "rewards",
      label: "Community Points",
      icon: "🏆",
      description: "Earn recognition for contributing to community safety",
    },
    { id: "profile", label: "Profile", icon: "👤", description: "Manage your account settings" },
  ]

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-content">
          <div className="dashboard-loading-spinner"></div>
          <h3 className="dashboard-loading-title">Loading Dashboard</h3>
          <p className="dashboard-loading-subtitle">Preparing your emergency response center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="user-dashboard-container">
      <div className="sidebar-container">
        <div className="user-sidebar-header">
          <div className="sidebar-header-content">
            <div className="user-sidebar-logo">
              <img src="./ajali.svg" alt="ajali logo"/>
            </div>
            <div className="user-sidebar-brand">
              <h1>Ajali</h1>
              <p>Emergency Response System</p>
            </div>
          </div>
        </div>

        <div className="user-sidebar-status">
          <div className="sidebar-status-content">
            <div className="sidebar-status-dot"></div>
            <span className="sidebar-status-text">System Status: Active</span>
          </div>
          <p className="sidebar-status-updated">Last updated: Just now</p>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-list">
            {userTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`user-nav-item ${activeTab === tab.id ? "active" : ""}`}
              >
                <span className="user-nav-item-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="user-sidebar-actions">
          <h3 className="sidebar-actions-title">Quick Actions</h3>
          <button onClick={() => setActiveTab("report")} className="user-action-btn primary">
            Report Accident
          </button>
          <button onClick={() => setActiveTab("map")} className="user-action-btn secondary">
            <span>🗺️</span>
            View Map
          </button>
        </div>

        <div className="user-sidebar-contacts">
          <h3 className="sidebar-contacts-title">Emergency Contacts</h3>
          <div className="sidebar-contacts-list">
            <div className="user-contact-item">
              <div className="user-contact-info">
                <span className="sidebar-contact-icon">📞</span>
                <span className="sidebar-contact-label">Emergency Services</span>
              </div>
              <span className="user-contact-number">911</span>
            </div>
            <div className="user-contact-item">
              <div className="user-contact-info">
                <span className="sidebar-contact-icon">🚒</span>
                <span className="sidebar-contact-label">Fire Department</span>
              </div>
              <span className="user-contact-number">911</span>
            </div>
          </div>
        </div>

        <div className="user-sidebar-profile">
          <div className="sidebar-profile-info">
            <div className="user-profile-avatar">
              <span className="sidebar-profile-avatar-text">
                {userData?.name ? userData.name.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <div className="sidebar-profile-details">
              <p className="sidebar-profile-email">{userData?.email || user?.email || "admin@koci358.com"}</p>
              <p className="sidebar-profile-role">Emergency Admin</p>
            </div>
          </div>
          <button onClick={logout} className="sidebar-profile-logout">
            <span className="sidebar-profile-logout-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="user-dashboard-content">
        {activeTab === "profile" && <ProfilePage onBack={() => setActiveTab("overview")} />}

        {activeTab === "incident-detail" && selectedIncidentId && (
          <IncidentDetailPage
            incidentId={selectedIncidentId}
            onBack={handleBackFromIncidentDetail}
            backLabel="Back to My Reports"
          />
        )}

        {activeTab !== "incident-detail" && activeTab !== "profile" && (
          <>
            <header className="user-dashboard-header">
              <div className="user-header-content">
                <div className="user-header-info">
                  <h1>Emergency Dashboard</h1>
                  <p>Real-time accident reports and emergency response</p>
                </div>
                <div className="user-header-actions">
                  <button onClick={() => setActiveTab("map")} className="user-view-map-btn">
                    <span>📍</span>
                    <span>View Map</span>
                  </button>
                  <div className="user-alerts-badge">
                    <span className="icon">🔔</span>
                    <span className="text">Alerts</span>
                    <span className="count">6</span>
                  </div>
                  <button onClick={() => setActiveTab("report")} className="user-report-btn">
                    <span>+</span>
                    <span>Report Accident</span>
                  </button>
                </div>
              </div>
            </header>

            <div className="user-dashboard-main">
              {activeTab === "overview" && (
                <div className="fade-in">
                  <div className="dashboard-stats-grid">
                    <div className="dashboard-stat-card active-reports">
                      <div className="dashboard-stat-card-content">
                        <div className="dashboard-stat-card-info">
                          <p>Active Reports</p>
                          <p>{userStats?.activeReports || 3}</p>
                        </div>
                        <div className="dashboard-stat-card-icon">
                          <span>⚠️</span>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-stat-card critical">
                      <div className="dashboard-stat-card-content">
                        <div className="dashboard-stat-card-info">
                          <p>Critical</p>
                          <p>{userStats?.critical || 1}</p>
                        </div>
                        <div className="dashboard-stat-card-icon">
                          <span>📈</span>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-stat-card responders">
                      <div className="dashboard-stat-card-content">
                        <div className="dashboard-stat-card-info">
                          <p>Responders</p>
                          <p>{userStats?.responders || 20}</p>
                        </div>
                        <div className="dashboard-stat-card-icon">
                          <span>👥</span>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-stat-card resolved">
                      <div className="dashboard-stat-card-content">
                        <div className="dashboard-stat-card-info">
                          <p>Resolved</p>
                          <p>{userStats?.resolved || 2}</p>
                        </div>
                        <div className="dashboard-stat-card-icon">
                          <span>✓</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-critical-alert">
                    <div className="dashboard-critical-alert-content">
                      <div className="dashboard-critical-alert-info">
                        <div className="dashboard-critical-alert-icon">
                          <span>⚠️</span>
                        </div>
                        <div className="dashboard-critical-alert-text">
                          <h3>Critical Emergency Alert</h3>
                          <p>1 critical accident requiring immediate attention.</p>
                        </div>
                      </div>
                      <button className="dashboard-critical-alert-btn">View Critical</button>
                    </div>
                  </div>

                  <div className="dashboard-search-filters">
                    <div>
                      <input
                        type="text"
                        placeholder="Search by location, type, or description..."
                        className="dashboard-search-input"
                      />
                    </div>
                    <div className="dashboard-filters">
                      <select className="dashboard-filter-select">
                        <option>All Types</option>
                      </select>
                      <select className="dashboard-filter-select">
                        <option>All Levels</option>
                      </select>
                    </div>
                  </div>

                  <div className="dashboard-recent-reports">
                    <div className="dashboard-recent-reports-header">
                      <div className="dashboard-recent-reports-header-content">
                        <h2>Recent Reports</h2>
                        <span className="dashboard-recent-reports-count">
                          {userStats?.allIncidents?.length || 5} reports found
                        </span>
                      </div>
                    </div>
                    <div className="dashboard-recent-reports-content">
                      {userStats?.allIncidents && userStats.allIncidents.length > 0 ? (
                        <div className="dashboard-reports-grid">
                          {userStats.allIncidents.slice(0, 3).map((report) => (
                            <div key={report.id} className="dashboard-report-card">
                              <div className="dashboard-report-card-header">
                                <span
                                  className={`dashboard-report-card-severity ${
                                    report.severity === "critical"
                                      ? "critical"
                                      : report.severity === "high"
                                        ? "high"
                                        : "medium"
                                  }`}
                                >
                                  {report.severity?.toUpperCase() || "MEDIUM"}
                                </span>
                                <span className="dashboard-report-card-date">
                                  {new Date(report.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="dashboard-report-card-title">{report.title}</h3>
                              <p className="dashboard-report-card-location">{report.location}</p>
                              <div className="dashboard-report-card-footer">
                                <span className="dashboard-report-card-type">{report.incident_type}</span>
                                <span
                                  className={`dashboard-report-card-status ${
                                    report.status === "resolved"
                                      ? "resolved"
                                      : report.status === "in-progress"
                                        ? "in-progress"
                                        : "pending"
                                  }`}
                                >
                                  {report.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="dashboard-empty-state">
                          <div className="dashboard-empty-state-icon">📋</div>
                          <h3>No reports found</h3>
                          <p>Reports will appear here once they are submitted.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "incidents" && (
                <div className="fade-in">
                  <IncidentList incidents={incidents} onViewDetail={handleViewIncidentDetail} />
                </div>
              )}

              {activeTab === "report" && (
                <div className="fade-in">
                  <IncidentForm onIncidentCreated={handleIncidentCreated} />
                </div>
              )}

              {activeTab === "map" && (
                <div className="fade-in">
                  <div className="dashboard-map-container">
                    <div className="dashboard-map-header">
                      <h2>Incident Map</h2>
                      <div className="dashboard-map-legend">
                        <div className="dashboard-map-legend-item">
                          <span className="dashboard-map-legend-dot critical"></span>
                          <span>Critical</span>
                        </div>
                        <div className="dashboard-map-legend-item">
                          <span className="dashboard-map-legend-dot high"></span>
                          <span>High</span>
                        </div>
                        <div className="dashboard-map-legend-item">
                          <span className="dashboard-map-legend-dot medium"></span>
                          <span>Medium</span>
                        </div>
                        <div className="dashboard-map-legend-item">
                          <span className="dashboard-map-legend-dot low"></span>
                          <span>Low</span>
                        </div>
                      </div>
                    </div>
                    <div className="dashboard-map-view">
                      <MapView />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "rewards" && (
                <div className="fade-in">
                  <PointsSystem />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
