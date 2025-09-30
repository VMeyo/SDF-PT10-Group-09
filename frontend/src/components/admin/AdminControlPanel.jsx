"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/Card"
import { UserManagement } from "./UserManagement"
import { ReportManagement } from "./ReportManagement"
import "../../styles/mobile-fixes.css"

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
      console.log("[v0] Fetching admin data...")
      console.log("[v0] API_BASE:", API_BASE)
      console.log("[v0] Token:", token ? "Present" : "Missing")

      const statsResponse = await fetch(`${API_BASE}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }).catch((err) => {
        console.error("[v0] Stats fetch error:", err)
        return { ok: false }
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log("[v0] Admin stats received:", statsData)
        setStats(statsData)
      }

      console.log("[v0] Fetching users from:", `${API_BASE}/users`)
      const usersResponse = await fetch(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Users response status:", usersResponse.status)
      const usersText = await usersResponse.text()
      console.log("[v0] Users raw response:", usersText)

      if (usersResponse.ok) {
        let usersData
        try {
          usersData = JSON.parse(usersText)
        } catch (e) {
          console.error("[v0] Failed to parse users JSON:", e)
          setUsers([])
          setLoading(false)
          return
        }

        let usersArray = []
        if (Array.isArray(usersData)) {
          usersArray = usersData
        } else if (usersData.users && Array.isArray(usersData.users)) {
          usersArray = usersData.users
        } else if (usersData.data && Array.isArray(usersData.data)) {
          usersArray = usersData.data
        }

        console.log("[v0] Users data received:", usersArray.length, "users")
        setUsers(usersArray)
        setStats((prev) => ({
          ...prev,
          totalUsers: usersArray.length,
        }))
      } else {
        console.error("[v0] Failed to fetch users. Status:", usersResponse.status, "Response:", usersText)
        setUsers([])
      }

      console.log("[v0] Fetching reports from:", `${API_BASE}/incidents`)
      const reportsResponse = await fetch(`${API_BASE}/incidents`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Reports response status:", reportsResponse.status)
      const reportsText = await reportsResponse.text()
      console.log("[v0] Reports raw response:", reportsText)

      if (reportsResponse.ok) {
        let reportsData
        try {
          reportsData = JSON.parse(reportsText)
        } catch (e) {
          console.error("[v0] Failed to parse reports JSON:", e)
          setLoading(false)
          return
        }

        let reportsArray = []
        if (Array.isArray(reportsData)) {
          reportsArray = reportsData
        } else if (reportsData.incidents && Array.isArray(reportsData.incidents)) {
          reportsArray = reportsData.incidents
        } else if (reportsData.data && Array.isArray(reportsData.data)) {
          reportsArray = reportsData.data
        }

        console.log("[v0] Reports data received:", reportsArray.length, "reports")
        setStats((prev) => ({
          ...prev,
          totalReports: reportsArray.length,
          activeReports: reportsArray.filter((r) => r.status !== "resolved" && r.status !== "rejected").length,
        }))
      } else {
        console.error("[v0] Failed to fetch reports. Status:", reportsResponse.status, "Response:", reportsText)
      }
    } catch (error) {
      console.error("[v0] Error fetching admin data:", error)
      console.error("[v0] Error stack:", error.stack)
      setStats({
        totalReports: 0,
        activeReports: 0,
        totalUsers: 0,
        avgResponse: "0min",
      })
      setUsers([])
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="animate-pulse p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-6 py-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <button
                className="back-to-dashboard-mobile"
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back()
                  } else if (window.location.pathname !== "/") {
                    window.location.href = "/"
                  } else {
                    window.location.reload()
                  }
                }}
              >
                <span className="mr-2">←</span>
                <span className="text-sm">Back to Dashboard</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
              Admin Control Panel
            </h1>
            <p className="text-gray-600 text-sm mt-1">Manage emergency reports, users, and system settings</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🔔</span>
              </div>
              <span className="text-sm font-medium text-red-700">Alerts</span>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{stats.activeReports}</span>
            </div>
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">System Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">Total Reports</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    {stats.totalReports}
                  </p>
                  <p className="text-xs text-red-500 mt-1">All time</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">⚠️</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Active Reports</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {stats.activeReports}
                  </p>
                  <p className="text-xs text-orange-500 mt-1">Need attention</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">📈</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stats.totalUsers}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">Registered</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">👥</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Avg Response</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {stats.avgResponse}
                  </p>
                  <p className="text-xs text-green-500 mt-1">Response time</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">📊</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-1 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-1 shadow-lg">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex-1 min-w-0 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-red-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Users" && <UserManagement />}
        {activeTab === "Reports" && <ReportManagement />}

        {activeTab === "Overview" && (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                System Overview
              </h3>
              <p className="text-gray-600">Dashboard overview with key metrics and recent activity.</p>
            </CardContent>
          </Card>
        )}

        {activeTab === "Settings" && (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                System Settings
              </h3>
              <p className="text-gray-600">Configure system preferences, notifications, and emergency protocols.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
