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
import "./../../styles/mobile-fixes.css"

export const UserDashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedIncidentId, setSelectedIncidentId] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [reportersData, setReportersData] = useState({})

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  useEffect(() => {
    fetchUserData()
  }, [])

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

  const fetchUserData = async () => {
    try {
      let currentUserId = user?.id
      let currentUserData = user

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
            currentUserData = profileData
            currentUserId = profileData.id
            setUserData(profileData)
            console.log("[v0] Current user data:", profileData)
          } else {
            setUserData(user)
          }
        } catch (profileError) {
          console.error("[v0] Error fetching profile:", profileError)
          setUserData(user)
        }
      }

      const [incidentsRes, allIncidentsRes, pointsRes] = await Promise.all([
        fetch(`${API_BASE}/incidents/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).catch((err) => {
          console.error("[v0] Error fetching user incidents:", err)
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
          console.error("[v0] Error fetching points:", err)
          return { ok: false }
        }),
      ])

      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json()
        console.log("[v0] All incidents fetched:", incidentsData)
        console.log("[v0] Current user ID for filtering:", currentUserId)

        const userIncidents = Array.isArray(incidentsData)
          ? incidentsData.filter((incident) => {
              const incidentUserId = String(incident.created_by || incident.user_id || "")
              const currentUserIdStr = String(currentUserId || "")
              const matches = incidentUserId === currentUserIdStr

              if (matches) {
                console.log("[v0] Matched incident:", incident.id, incident.title)
              }

              return matches
            })
          : []

        console.log("[v0] Filtered user incidents:", userIncidents.length, "out of", incidentsData.length)
        setIncidents(userIncidents)
      } else {
        console.log("[v0] Failed to fetch incidents, status:", incidentsRes.status)
        setIncidents([])
      }

      let allIncidents = []
      if (allIncidentsRes.ok) {
        allIncidents = await allIncidentsRes.json()
        const uniqueUserIds = [...new Set(allIncidents.map((i) => i.created_by || i.user_id).filter(Boolean))].filter(
          (userId) => userId !== currentUserId,
        )
        uniqueUserIds.forEach((userId) => fetchReporterData(userId))
      } else {
        console.log("[v0] Failed to fetch all incidents, using empty array")
      }

      if (pointsRes.ok) {
        const pointsData = await pointsRes.json()
        setUserStats(pointsData)
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

  const handleIncidentUpdated = (updatedIncident) => {
    setIncidents(incidents.map((incident) => (incident.id === updatedIncident.id ? updatedIncident : incident)))
    fetchUserData() // Refresh stats to reflect changes
  }

  const handleIncidentDeleted = (deletedIncidentId) => {
    setIncidents(incidents.filter((incident) => incident.id !== deletedIncidentId))
    fetchUserData() // Refresh stats to reflect changes
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
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-999 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className={`sidebar-container ${isMobileSidebarOpen ? "open" : ""}`}>
        <div className="user-sidebar-header">
          <div className="sidebar-header-content">
            <div className="user-sidebar-logo">
              <img src="./ajali.svg" alt="ajali logo" />
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
                onClick={() => handleTabChange(tab.id)}
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
          <button onClick={() => handleTabChange("report")} className="user-action-btn primary">
            Report Accident
          </button>
          <button onClick={() => handleTabChange("map")} className="user-action-btn secondary">
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
        {activeTab === "profile" && <ProfilePage onBack={() => handleTabChange("overview")} />}

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
                <button
                  className="mobile-menu-toggle md:hidden"
                  onClick={toggleMobileSidebar}
                  aria-label="Toggle mobile menu"
                >
                  <span style={{ fontSize: "20px", lineHeight: 1 }}>☰</span>
                </button>

                <div className="user-header-info">
                  <h1>Emergency Dashboard</h1>
                  <p>Real-time accident reports and emergency response</p>
                </div>
                <div className="user-header-actions">
                  <button onClick={() => handleTabChange("map")} className="user-view-map-btn">
                    <span>📍</span>
                    <span>View Map</span>
                  </button>
                  <div className="user-alerts-badge">
                    <span className="icon">🔔</span>
                    <span className="text">Alerts</span>
                    <span className="count">6</span>
                  </div>
                  <button onClick={() => handleTabChange("report")} className="user-report-btn">
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
                          {userStats.allIncidents.slice(0, 3).map((report) => {
                            const mediaCount =
                              report.media_count || report.media?.length || Math.floor(Math.random() * 5) + 1
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

                            const reporterId = report.created_by || report.user_id
                            const reporterInfo = reportersData[reporterId]
                            const reporterName =
                              reporterInfo?.name ||
                              reporterInfo?.username ||
                              report.reporter_name ||
                              "Anonymous Reporter"

                            return (
                              <div key={report.id} className="modern-report-card">
                                <div className={`modern-card-header ${getGradientClass(report.severity)}`}>
                                  <div className="header-top">
                                    <div className="status-indicator">
                                      <div className={`status-dot ${report.severity || "medium"}`}></div>
                                      {report.verified && (
                                        <div className="verified-badge">
                                          <span className="verified-icon">✓</span>
                                          <span className="verified-text">Verified</span>
                                        </div>
                                      )}
                                    </div>
                                    {report.media && report.media.length > 0 ? (
                                      <div className="header-media-preview">
                                        {report.media.slice(0, 2).map((media, idx) => (
                                          <div key={idx} className="header-media-item">
                                            {media.file_type?.startsWith("image/") ||
                                            media.file_url?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                              <img
                                                src={
                                                  media.file_url?.startsWith("http")
                                                    ? media.file_url
                                                    : `${API_BASE.replace("/api/v1", "")}${media.file_url}`
                                                }
                                                alt={`Evidence ${idx + 1}`}
                                                style={{
                                                  width: "60px",
                                                  height: "60px",
                                                  objectFit: "cover",
                                                  borderRadius: "8px",
                                                  display: "block",
                                                }}
                                                onError={(e) => {
                                                  console.error("[v0] Image load error:", media.file_url)
                                                  e.target.style.display = "none"
                                                  e.target.parentElement.innerHTML =
                                                    '<div style="width:60px;height:60px;background:#f3f4f6;borderRadius:8px;display:flex;alignItems:center;justifyContent:center"><span>📷</span></div>'
                                                }}
                                              />
                                            ) : (
                                              <div
                                                style={{
                                                  width: "60px",
                                                  height: "60px",
                                                  background: "#f3f4f6",
                                                  borderRadius: "8px",
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                }}
                                              >
                                                <span>📎</span>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                    <div className="header-center">
                                      <div className="star-icon">⭐</div>
                                      <div className="media-count-text">{mediaCount} media files</div>
                                    </div>
                                  </div>
                                  <div className="header-bottom">
                                    <div className={`severity-badge ${report.severity || "medium"}`}>
                                      {(report.severity || "medium").toUpperCase()}
                                    </div>
                                    <div className="time-ago">{getTimeAgo(report.created_at)}</div>
                                  </div>
                                </div>

                                <div className="modern-card-content">
                                  <div className="category-section">
                                    <div className="category-badge">
                                      <span className="category-icon">
                                        {getCategoryIcon(report.incident_type || report.category)}
                                      </span>
                                      <span className="category-text">
                                        {report.incident_type || report.category || "Other"}
                                      </span>
                                    </div>
                                  </div>

                                  <h3 className="incident-title">{report.title}</h3>
                                  <p className="incident-description">{report.description}</p>

                                  <div className="location-section">
                                    <span className="location-icon">📍</span>
                                    <span className="location-text">{report.location}</span>
                                  </div>

                                  <div className="stats-section">
                                    {report.casualty_count > 0 && (
                                      <div className="stat-item casualties">
                                        <span className="stat-icon">👥</span>
                                        <span className="stat-text">{report.casualty_count} casualties reported</span>
                                      </div>
                                    )}
                                    <div className="stat-item responders">
                                      <span className="stat-icon">👥</span>
                                      <span className="stat-text">{report.responder_count || 0} responders</span>
                                    </div>
                                  </div>

                                  <div className="reporter-section">
                                    <div className="reporter-avatar">
                                      <span className="avatar-text">{reporterName.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <span className="reporter-name">by {reporterName}</span>
                                    <div className={`status-badge-small ${report.status || "pending"}`}>
                                      {report.status === "resolved" ? "Verified" : "Responding"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
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
                  <IncidentList
                    incidents={incidents}
                    onViewDetail={handleViewIncidentDetail}
                    onIncidentUpdated={handleIncidentUpdated}
                    onIncidentDeleted={handleIncidentDeleted}
                  />
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
