"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/Card"
import { UserManagement } from "./UserManagement"
import { ReportManagement } from "./ReportManagement"
<<<<<<< HEAD
import { StatusManagement } from "./StatusManagement"
import { RoleManagement } from "./RoleManagement"
=======
import "../../styles/mobile-fixes.css"
>>>>>>> feature/frontend-ui

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

<<<<<<< HEAD
  const tabs = ["Overview", "Reports", "Users", "Status", "Roles", "Settings"]
=======
  const tabs = ["Overview", "Reports", "Users", "Settings"]
>>>>>>> feature/frontend-ui

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
<<<<<<< HEAD
=======
      } else {
        setStats({
          totalReports: 0,
          activeReports: 0,
          totalUsers: 0,
          avgResponse: "0min",
        })
>>>>>>> feature/frontend-ui
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
<<<<<<< HEAD
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
=======
        setStats((prev) => ({
          ...prev,
          totalUsers: usersData.length,
        }))
      } else {
        setUsers([])
      }

      const reportsResponse = await fetch(`${API_BASE}/incidents`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setStats((prev) => ({
          ...prev,
          totalReports: reportsData.length,
          activeReports: reportsData.filter((r) => r.status !== "resolved" && r.status !== "rejected").length,
        }))
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
      setStats({
        totalReports: 0,
        activeReports: 0,
        totalUsers: 0,
        avgResponse: "0min",
      })
      setUsers([])
>>>>>>> feature/frontend-ui
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
<<<<<<< HEAD
      <div className="bg-gray-50 min-h-screen">
        <div className="animate-pulse p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
=======
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="animate-pulse p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
>>>>>>> feature/frontend-ui
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
<<<<<<< HEAD
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <button className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
=======
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
>>>>>>> feature/frontend-ui
                <span className="mr-2">←</span>
                <span className="text-sm">Back to Dashboard</span>
              </button>
            </div>
<<<<<<< HEAD
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
=======
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
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">1</span>
            </div>
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">System Active</span>
>>>>>>> feature/frontend-ui
            </div>
          </div>
        </div>
      </div>

<<<<<<< HEAD
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
=======
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
                  <p className="text-xs text-red-500 mt-1">+12% this week</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">⚠️</span>
>>>>>>> feature/frontend-ui
                </div>
              </div>
            </CardContent>
          </Card>

<<<<<<< HEAD
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
=======
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
>>>>>>> feature/frontend-ui
                </div>
              </div>
            </CardContent>
          </Card>

<<<<<<< HEAD
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
=======
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stats.totalUsers}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">+3% this month</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">👥</span>
>>>>>>> feature/frontend-ui
                </div>
              </div>
            </CardContent>
          </Card>

<<<<<<< HEAD
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
=======
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Avg Response</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {stats.avgResponse}
                  </p>
                  <p className="text-xs text-green-500 mt-1">Improving</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">📊</span>
>>>>>>> feature/frontend-ui
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

<<<<<<< HEAD
        <div className="flex space-x-0 mb-6 bg-white rounded-lg border border-gray-200 p-1">
=======
        <div className="flex flex-wrap gap-1 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-1 shadow-lg">
>>>>>>> feature/frontend-ui
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
<<<<<<< HEAD
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab ? "bg-blue-500 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
=======
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex-1 min-w-0 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-red-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/80"
>>>>>>> feature/frontend-ui
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Users" && <UserManagement />}
        {activeTab === "Reports" && <ReportManagement />}
<<<<<<< HEAD
        {activeTab === "Status" && <StatusManagement />}
        {activeTab === "Roles" && <RoleManagement />}

        {activeTab === "Overview" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">System Overview</h3>
            <p className="text-gray-600">Dashboard overview with key metrics and recent activity.</p>
          </div>
        )}

        {activeTab === "Settings" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">System Settings</h3>
            <p className="text-gray-600">Configure system preferences, notifications, and emergency protocols.</p>
          </div>
=======

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
>>>>>>> feature/frontend-ui
        )}
      </div>
    </div>
  )
}
