"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { IncidentForm } from "./IncidentForm"
import { IncidentList } from "./IncidentList"
import { PointsSystem } from "../rewards/PointsSystem"
import { MapView } from "../map/MapView"
import { IncidentDetailPage } from "../incidents/IncidentDetailPage"

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
          const profileRes = await fetch(`${API_BASE}/auth/profile`, {
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
      setUserStats({ activeReports: 0, critical: 0, responders: 0, resolved: 0, allIncidents: [] })
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
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Loading Dashboard
          </h3>
          <p className="text-gray-600">Preparing your emergency response center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {activeTab !== "incident-detail" && (
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold">⚠</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Ajali</h1>
                <p className="text-xs text-gray-500">Emergency Response System</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">System Status: Active</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Last updated: Just now</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {userTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200 ${
                  activeTab === tab.id ? "bg-red-500 text-white shadow-sm" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                <div>
                  <span className="font-medium text-sm">{tab.label}</span>
                  <span className={`text-xs block ${activeTab === tab.id ? "text-red-100" : "text-gray-500"}`}>
                    {tab.description}
                  </span>
                </div>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <button
              onClick={() => setActiveTab("report")}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
            >
              + Report Accident
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className="w-full mt-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <span className="mr-2">👁️</span>
              View Map
            </button>
          </div>

          <div className="p-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Emergency Contacts</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">📞</span>
                  <span className="text-sm text-gray-700">Emergency Services</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">911</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">🚒</span>
                  <span className="text-sm text-gray-700">Fire Department</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">911</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userData?.email || user?.email || "admin@koci358.com"}
                </p>
                <p className="text-xs text-gray-500">
                  {userData?.role === "admin" || user?.role === "admin" ? "Emergency Admin" : "Citizen Reporter"}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full text-left flex items-center text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
            >
              <span className="mr-2">🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1">
        {activeTab !== "incident-detail" && (
          <header className="bg-white border-b border-gray-200 px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Emergency Dashboard</h1>
                <p className="text-gray-600">Real-time accident reports and emergency response</p>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab("map")}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <span>📍</span>
                  <span>View Map</span>
                </button>
                <button
                  onClick={() => setActiveTab("report")}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Report Accident</span>
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">🔔</span>
                  <span className="text-sm font-medium text-gray-700">Alerts</span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">6</span>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">System Active</span>
                </div>
              </div>
            </div>
          </header>
        )}

        <div className={activeTab !== "incident-detail" ? "p-6" : ""}>
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-red-50 border border-red-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600 mb-1">Active Reports</p>
                      <p className="text-3xl font-bold text-red-700">{userStats?.activeReports || 0}</p>
                      <p className="text-xs text-red-500 flex items-center mt-1">
                        <span className="mr-1">⚠️</span>
                        Requires attention
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">⚠️</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 mb-1">Critical</p>
                      <p className="text-3xl font-bold text-orange-700">{userStats?.critical || 0}</p>
                      <p className="text-xs text-orange-500 flex items-center mt-1">
                        <span className="mr-1">📈</span>
                        High priority
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">📈</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">Responders</p>
                      <p className="text-3xl font-bold text-blue-700">{userStats?.responders || 0}</p>
                      <p className="text-xs text-blue-500 flex items-center mt-1">
                        <span className="mr-1">👥</span>
                        Active teams
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">👥</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">Resolved</p>
                      <p className="text-3xl font-bold text-green-700">{userStats?.resolved || 0}</p>
                      <p className="text-xs text-green-500 flex items-center mt-1">
                        <span className="mr-1">✅</span>
                        Completed
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">✅</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white">⚠️</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-800">Critical Emergency Alert</h3>
                      <p className="text-red-600">1 critical accident requiring immediate attention.</p>
                    </div>
                  </div>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium">
                    View Critical
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by location, type, or description..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>All Types</option>
                    <option>Fire</option>
                    <option>Accident</option>
                    <option>Medical</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>All Levels</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                    <span className="text-sm text-gray-500">{userStats?.allIncidents?.length || 0} reports found</span>
                  </div>
                </div>
                <div className="p-6">
                  {userStats?.allIncidents && userStats.allIncidents.length > 0 ? (
                    <div className="space-y-4">
                      {userStats.allIncidents.slice(0, 5).map((report) => (
                        <div key={report.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-red-600">⚠️</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{report.title}</h3>
                            <p className="text-sm text-gray-600">{report.location}</p>
                            <p className="text-xs text-gray-500">
                              {report.incident_type} • {report.severity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{report.status}</p>
                            <p className="text-xs text-gray-500">{new Date(report.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-4">📋</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                      <p className="text-gray-500">Reports will appear here once they are submitted.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "incidents" && (
            <div className="space-y-6 fade-in">
              <IncidentList incidents={incidents} onViewDetail={handleViewIncidentDetail} />
            </div>
          )}

          {activeTab === "report" && (
            <div className="space-y-6 fade-in">
              <IncidentForm onIncidentCreated={handleIncidentCreated} />
            </div>
          )}

          {activeTab === "map" && (
            <div className="space-y-6 fade-in">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Incident Map</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span>Critical</span>
                    <span className="w-3 h-3 bg-orange-500 rounded-full ml-4"></span>
                    <span>High</span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full ml-4"></span>
                    <span>Medium</span>
                    <span className="w-3 h-3 bg-green-500 rounded-full ml-4"></span>
                    <span>Low</span>
                  </div>
                </div>
                <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
                  <MapView />
                </div>
              </div>
            </div>
          )}

          {activeTab === "rewards" && (
            <div className="space-y-6 fade-in">
              <PointsSystem />
            </div>
          )}

          {activeTab === "incident-detail" && selectedIncidentId && (
            <IncidentDetailPage
              incidentId={selectedIncidentId}
              onBack={handleBackFromIncidentDetail}
              backLabel="Back to My Reports"
            />
          )}
        </div>
      </div>
    </div>
  )
}
