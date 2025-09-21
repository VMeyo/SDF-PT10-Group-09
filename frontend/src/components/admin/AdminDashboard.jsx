"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"
import { AdminIncidents } from "./AdminIncidents"
import { UserManagement } from "./UserManagement"
import { SystemAnalytics } from "./SystemAnalytics"

export const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      const [incidentsRes, leaderboardRes] = await Promise.all([
        fetch(`${API_BASE}/admin/incidents`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/users/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const incidents = incidentsRes.ok ? await incidentsRes.json() : []
      const leaderboard = leaderboardRes.ok ? await leaderboardRes.json() : []

      setStats({
        totalIncidents: incidents.length,
        pendingIncidents: incidents.filter((i) => i.status === "pending").length,
        resolvedIncidents: incidents.filter((i) => i.status === "resolved").length,
        highPriorityIncidents: incidents.filter((i) => i.severity === "high").length,
        totalUsers: leaderboard.length,
        incidents,
        leaderboard,
      })
    } catch (error) {
      console.error("Error fetching admin stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "incidents", label: "All Incidents", icon: "🚨" },
    { id: "users", label: "User Management", icon: "👥" },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Ajali</h1>
              <span className="ml-3 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">Admin</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
              <Button variant="outline" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Admin Overview</h2>
                  <p className="text-muted-foreground">System-wide statistics and recent activity</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Incidents</p>
                          <p className="text-2xl font-bold">{stats?.totalIncidents || 0}</p>
                        </div>
                        <div className="text-2xl">🚨</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                          <p className="text-2xl font-bold text-yellow-600">{stats?.pendingIncidents || 0}</p>
                        </div>
                        <div className="text-2xl">⏳</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                          <p className="text-2xl font-bold text-green-600">{stats?.resolvedIncidents || 0}</p>
                        </div>
                        <div className="text-2xl">✅</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                          <p className="text-2xl font-bold text-red-600">{stats?.highPriorityIncidents || 0}</p>
                        </div>
                        <div className="text-2xl">🔥</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent High Priority Incidents */}
                <Card>
                  <CardHeader>
                    <CardTitle>High Priority Incidents</CardTitle>
                    <CardDescription>Incidents requiring immediate attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats?.incidents?.filter((incident) => incident.severity === "high").slice(0, 5).length > 0 ? (
                      <div className="space-y-4">
                        {stats.incidents
                          .filter((incident) => incident.severity === "high")
                          .slice(0, 5)
                          .map((incident) => (
                            <div
                              key={incident.id}
                              className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg"
                            >
                              <div>
                                <h4 className="font-medium text-red-900">{incident.title}</h4>
                                <p className="text-sm text-red-700">
                                  {incident.location} • {new Date(incident.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveTab("incidents")}
                                className="border-red-300 text-red-700 hover:bg-red-100"
                              >
                                Review
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No high priority incidents at the moment</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "incidents" && <AdminIncidents onStatsUpdate={fetchAdminStats} />}

            {activeTab === "users" && <UserManagement />}

            {activeTab === "analytics" && <SystemAnalytics stats={stats} />}
          </div>
        </div>
      </div>
    </div>
  )
}
