"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/Card"

export const AdminControlPanel = () => {
  const [activeTab, setActiveTab] = useState("Overview")
  const [stats, setStats] = useState({
    totalReports: 0,
    activeReports: 0,
    totalUsers: 0,
    avgResponse: "0min",
  })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  const tabs = ["Overview", "Reports", "Users", "Settings"]

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const statsResponse = await fetch(`${API_BASE}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      const usersResponse = await fetch(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getUserAvatar = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U"
  }

  const getUserAvatarColor = (index) => {
    const colors = ["bg-purple-500", "bg-blue-500", "bg-red-500", "bg-orange-500", "bg-green-500", "bg-indigo-500"]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="animate-pulse p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <button className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                <span className="mr-2">←</span>
                <span className="text-sm">Back to Dashboard</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Control Panel</h1>
            <p className="text-gray-600 text-sm">Manage emergency reports, users, and system settings</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🔔</span>
              </div>
              <span className="text-sm font-medium">Alerts</span>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">1</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-red-50 border-red-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">Total Reports</p>
                  <p className="text-2xl font-bold text-red-700">{stats.totalReports}</p>
                  <p className="text-xs text-red-500">+12% this week</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600">⚠️</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Active Reports</p>
                  <p className="text-2xl font-bold text-orange-700">{stats.activeReports}</p>
                  <p className="text-xs text-orange-500">Need attention</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600">📈</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalUsers}</p>
                  <p className="text-xs text-blue-500">+3% this month</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600">👥</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Avg Response</p>
                  <p className="text-2xl font-bold text-green-700">{stats.avgResponse}</p>
                  <p className="text-xs text-green-500">% Improving</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600">📊</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex space-x-0 mb-6 bg-white rounded-lg border border-gray-200 p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab ? "bg-blue-500 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Users" && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                  + Add Admin User
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">All Users</h4>
              </div>

              <div className="space-y-3">
                {users.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 ${getUserAvatarColor(index)} rounded-full flex items-center justify-center text-white font-medium text-sm`}
                      >
                        {getUserAvatar(user.name)}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{user.name}</h5>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{user.email}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {user.role === "admin" ? "Emergency Admin" : "Citizen Reporter"}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">active</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{user.incident_count || 0} reports submitted</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <span>✉️</span>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <span>📞</span>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <span>✏️</span>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <span>🗑️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Overview" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">System Overview</h3>
            <p className="text-gray-600">Dashboard overview with key metrics and recent activity.</p>
          </div>
        )}

        {activeTab === "Reports" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Reports Management</h3>
            <p className="text-gray-600">Manage and review all incident reports in the system.</p>
          </div>
        )}

        {activeTab === "Settings" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">System Settings</h3>
            <p className="text-gray-600">Configure system preferences, notifications, and emergency protocols.</p>
          </div>
        )}
      </div>
    </div>
  )
}
