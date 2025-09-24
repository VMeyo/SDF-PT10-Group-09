"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { EmergencyDashboard } from "./EmergencyDashboard"
import { ReportsPage } from "../reports/ReportsPage"
import { MapView } from "../map/MapView"
import { AdminControlPanel } from "./AdminControlPanel"

export const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [userData, setUserData] = useState(null)

  const adminTabs = [
    { id: "dashboard", label: "Dashboard", icon: "🏠", description: "Emergency reports overview" },
    { id: "reports", label: "My Reports", icon: "📋", description: "View and manage your reports" },
    { id: "map", label: "Map View", icon: "🗺️", description: "Location-based incidents" },
    { id: "admin", label: "Admin Panel", icon: "⚙️", description: "System management" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
          {adminTabs.map((tab) => (
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

        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <button
            onClick={() => setActiveTab("report")}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            + Report Accident
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className="w-full mt-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <span className="mr-2">👁️</span>
            View Map
          </button>
        </div>

        <div className="p-4 border-t border-gray-200">
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

        <div className="p-4 border-t border-gray-200">
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
              <p className="text-xs text-gray-500">{user?.role || "Emergency Admin"}</p>
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

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span className="mr-2">←</span>
                  <span className="text-sm">Back to Dashboard</span>
                </button>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {activeTab === "dashboard" && "Emergency Dashboard"}
                {activeTab === "reports" && "My Reports"}
                {activeTab === "map" && "Accident Map"}
                {activeTab === "admin" && "Admin Control Panel"}
              </h1>
              <p className="text-gray-600">
                {activeTab === "dashboard" && "Real-time accident reports and emergency response"}
                {activeTab === "reports" && "Manage your accident reports and track their status"}
                {activeTab === "map" && "Real-time accident locations and emergency response"}
                {activeTab === "admin" && "Manage emergency reports, users, and system settings"}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {activeTab === "dashboard" && (
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
                  <span>📍</span>
                  <span>View Map</span>
                </button>
              )}
              {activeTab === "admin" && (
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                  + Add Admin User
                </button>
              )}
              <div className="flex items-center space-x-2">
                <span className="text-gray-700">🔔</span>
                <span className="text-sm font-medium text-gray-700">Alerts</span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">1</span>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">System Active</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8">
          {activeTab === "dashboard" && <EmergencyDashboard />}
          {activeTab === "reports" && <ReportsPage />}
          {activeTab === "map" && <MapView />}
          {activeTab === "admin" && <AdminControlPanel />}
        </div>
      </div>
    </div>
  )
}
