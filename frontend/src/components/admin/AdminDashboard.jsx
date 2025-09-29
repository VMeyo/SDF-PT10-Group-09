"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { EmergencyDashboard } from "./EmergencyDashboard"
import { ReportsPage } from "../reports/ReportsPage"
import { MapView } from "../map/MapView"
import { AdminControlPanel } from "./AdminControlPanel"
import { ProfilePage } from "../profile/ProfilePage"
import { IncidentForm } from "../user/IncidentForm" // Import the user's IncidentForm component
import "./../../styles/dashboard.css"
import "./../../styles/sidebar.css"
import "./../../styles/admin-dashboard.css"
import "./../../styles/mobile-fixes.css" // Added mobile fixes import

export const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [userData, setUserData] = useState(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false) // Added mobile sidebar state

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const profileData = await response.json()
        setUserData(profileData)
      } else {
        setUserData(user)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setUserData(user)
    }
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setIsMobileSidebarOpen(false) // Close mobile sidebar when tab changes
  }

  const toggleMobileSidebar = () => {
    console.log("[v0] Toggling admin mobile sidebar, current state:", isMobileSidebarOpen)
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const handleIncidentCreated = (newIncident) => {
    console.log("[v0] New incident created by admin:", newIncident)
    // Switch to reports tab to show the new incident
    setActiveTab("reports")
  }

  const adminTabs = [
    { id: "dashboard", label: "Dashboard", icon: "🏠", description: "Emergency reports overview" },
    { id: "reports", label: "My Reports", icon: "📋", description: "View and manage your reports" },
    { id: "report", label: "Report Incident", icon: "➕", description: "Report new incidents" }, // Add report tab
    { id: "map", label: "Map View", icon: "🗺️", description: "Location-based incidents" },
    { id: "admin", label: "Admin Panel", icon: "⚙️", description: "System management" },
    { id: "profile", label: "Profile", icon: "👤", description: "Manage your account settings" },
  ]

  return (
    <div className="user-dashboard-container">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-999 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {activeTab !== "profile" && (
        <div className={`sidebar-container ${isMobileSidebarOpen ? "open" : ""}`}>
          {" "}
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
              {adminTabs.map((tab) => (
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
            <button className="user-action-btn primary" onClick={() => handleTabChange("report")}>
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
                <p className="sidebar-profile-role">{user?.role || "Emergency Admin"}</p>
              </div>
            </div>
            <button onClick={logout} className="sidebar-profile-logout">
              <span className="sidebar-profile-logout-icon">🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      <div className="user-dashboard-content">
        {activeTab === "profile" && <ProfilePage onBack={() => setActiveTab("dashboard")} />}

        {activeTab !== "profile" && (
          <>
            {activeTab !== "admin" && (
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
                    <h1>
                      {activeTab === "dashboard" && "Emergency Dashboard"}
                      {activeTab === "reports" && "My Reports"}
                      {activeTab === "report" && "Report New Incident"}
                      {activeTab === "map" && "Accident Map"}
                    </h1>
                    <p>
                      {activeTab === "dashboard" && "Real-time accident reports and emergency response"}
                      {activeTab === "reports" && "Manage your accident reports and track their status"}
                      {activeTab === "report" && "Submit a new incident report to the system"}
                      {activeTab === "map" && "Real-time accident locations and emergency response"}
                    </p>
                  </div>

                  <div className="user-header-actions">
                    {activeTab === "dashboard" && (
                      <button onClick={() => handleTabChange("map")} className="user-view-map-btn">
                        <span>📍</span>
                        <span>View Map</span>
                      </button>
                    )}
                    <div className="user-alerts-badge">
                      <span className="icon">🔔</span>
                      <span className="text">Alerts</span>
                      <span className="count">5</span>
                    </div>
                    <button className="user-report-btn" onClick={() => handleTabChange("report")}>
                      <span>+</span>
                      <span>Report Accident</span>
                    </button>
                  </div>
                </div>
              </header>
            )}

            <div className="user-dashboard-main">
              {activeTab === "dashboard" && <EmergencyDashboard />}
              {activeTab === "reports" && <ReportsPage />}
              {activeTab === "report" && (
                <div className="fade-in">
                  <IncidentForm onIncidentCreated={handleIncidentCreated} />
                </div>
              )}
              {activeTab === "map" && <MapView />}
              {activeTab === "admin" && <AdminControlPanel />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
