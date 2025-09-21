"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"
import { IncidentForm } from "./IncidentForm"
import { IncidentList } from "./IncidentList"
import { UserStats } from "./UserStats"
import { PointsSystem } from "../rewards/PointsSystem"

export const UserDashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [incidents, setIncidents] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const [incidentsRes, pointsRes] = await Promise.all([
        fetch(`${API_BASE}/incidents/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/users/points`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json()
        setIncidents(incidentsData)
      }

      if (pointsRes.ok) {
        const pointsData = await pointsRes.json()
        setUserStats(pointsData)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleIncidentCreated = (newIncident) => {
    setIncidents([newIncident, ...incidents])
    setActiveTab("incidents")
    fetchUserData() // Refresh stats
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "incidents", label: "My Incidents", icon: "📋" },
    { id: "report", label: "Report Incident", icon: "➕" },
    { id: "rewards", label: "Points & Rewards", icon: "🏆" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
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
              <span className="ml-3 text-sm text-muted-foreground">Incident Reporting</span>
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
                  <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
                  <p className="text-muted-foreground">Track your incident reports and community contributions</p>
                </div>

                <UserStats stats={userStats} incidentCount={incidents.length} />

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest incident reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {incidents.slice(0, 3).length > 0 ? (
                      <div className="space-y-4">
                        {incidents.slice(0, 3).map((incident) => (
                          <div
                            key={incident.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium">{incident.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {incident.location} • {new Date(incident.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                incident.status === "resolved"
                                  ? "bg-green-100 text-green-800"
                                  : incident.status === "in_progress"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {incident.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No incidents reported yet. Start by reporting your first incident!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "incidents" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">My Incidents</h2>
                  <p className="text-muted-foreground">View and track all your reported incidents</p>
                </div>
                <IncidentList incidents={incidents} />
              </div>
            )}

            {activeTab === "report" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Report New Incident</h2>
                  <p className="text-muted-foreground">Submit a detailed incident report to help your community</p>
                </div>
                <IncidentForm onIncidentCreated={handleIncidentCreated} />
              </div>
            )}

            {activeTab === "rewards" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Points & Rewards</h2>
                  <p className="text-muted-foreground">Earn points for reporting incidents and redeem rewards</p>
                </div>
                <PointsSystem />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
