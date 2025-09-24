"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"
import { Input } from "../ui/Input"

export const StatusManagement = () => {
  const [statusWorkflows, setStatusWorkflows] = useState([])
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [statusHistory, setStatusHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatusNote, setNewStatusNote] = useState("")
  const [assignedUser, setAssignedUser] = useState("")
  const [priority, setPriority] = useState("medium")
  const [estimatedResolution, setEstimatedResolution] = useState("")

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  const statusOptions = [
    { value: "pending", label: "Pending Review", color: "bg-yellow-500", description: "Awaiting initial review" },
    { value: "in_progress", label: "In Progress", color: "bg-blue-500", description: "Currently being investigated" },
    {
      value: "investigating",
      label: "Investigating",
      color: "bg-purple-500",
      description: "Under detailed investigation",
    },
    { value: "escalated", label: "Escalated", color: "bg-orange-500", description: "Escalated to higher authority" },
    { value: "resolved", label: "Resolved", color: "bg-green-500", description: "Issue has been resolved" },
    { value: "rejected", label: "Rejected", color: "bg-red-500", description: "Report rejected or invalid" },
    { value: "closed", label: "Closed", color: "bg-gray-500", description: "Case closed" },
  ]

  const priorityOptions = [
    { value: "low", label: "Low Priority", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Medium Priority", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High Priority", color: "bg-orange-100 text-orange-800" },
    { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" },
  ]

  useEffect(() => {
    fetchReports()
    fetchStatusWorkflows()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data)
      } else {
        // Mock data for development
        const mockReports = [
          {
            id: 1,
            title: "Road Accident on Main Street",
            status: "pending",
            priority: "high",
            assignedTo: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            reporter_name: "John Doe",
            location: "Main Street & 5th Avenue",
            estimatedResolution: null,
          },
          {
            id: 2,
            title: "Building Fire Downtown",
            status: "in_progress",
            priority: "critical",
            assignedTo: "admin@example.com",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 3600000).toISOString(),
            reporter_name: "Jane Smith",
            location: "Downtown District",
            estimatedResolution: "2024-01-15T10:00:00Z",
          },
        ]
        setReports(mockReports)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatusWorkflows = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/status-workflows`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setStatusWorkflows(data)
      }
    } catch (error) {
      console.error("Error fetching status workflows:", error)
    }
  }

  const fetchStatusHistory = async (reportId) => {
    try {
      const response = await fetch(`${API_BASE}/admin/reports/${reportId}/status-history`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setStatusHistory(data)
      } else {
        // Mock status history
        const mockHistory = [
          {
            id: 1,
            status: "pending",
            notes: "Report submitted by user",
            changedBy: "System",
            changedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 2,
            status: "in_progress",
            notes: "Started investigation",
            changedBy: "admin@example.com",
            changedAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ]
        setStatusHistory(mockHistory)
      }
    } catch (error) {
      console.error("Error fetching status history:", error)
    }
  }

  const updateReportStatus = async (reportId, newStatus, notes, assignedTo, priority, estimatedResolution) => {
    setUpdating(true)
    try {
      const response = await fetch(`${API_BASE}/admin/reports/${reportId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes,
          assignedTo,
          priority,
          estimatedResolution,
        }),
      })

      if (response.ok) {
        setReports(
          reports.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status: newStatus,
                  assignedTo,
                  priority,
                  estimatedResolution,
                  updated_at: new Date().toISOString(),
                }
              : report,
          ),
        )

        // Refresh status history
        if (selectedReport && selectedReport.id === reportId) {
          fetchStatusHistory(reportId)
        }

        // Clear form
        setNewStatusNote("")
        setAssignedUser("")
        setPriority("medium")
        setEstimatedResolution("")
      }
    } catch (error) {
      console.error("Error updating report status:", error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status)
    return statusOption ? statusOption.color : "bg-gray-500"
  }

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status)
    return statusOption ? statusOption.label : status
  }

  const getPriorityColor = (priority) => {
    const priorityOption = priorityOptions.find((opt) => opt.value === priority)
    return priorityOption ? priorityOption.color : "bg-gray-100 text-gray-800"
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Less than an hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`
    return `${Math.floor(diffInHours / 168)} weeks ago`
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading status management...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Status Management</h2>
        <p className="text-muted-foreground">Track and manage report status workflows</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-4">
        {statusOptions.slice(0, 4).map((status) => {
          const count = reports.filter((r) => r.status === status.value).length
          return (
            <Card key={status.value}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-600">{status.label}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${status.color}`}></div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Reports by Status</CardTitle>
            <CardDescription>Click on a report to manage its status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report)
                    fetchStatusHistory(report.id)
                  }}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedReport?.id === report.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{report.title}</h4>
                    <div className="flex space-x-1">
                      <span className={`px-2 py-1 text-xs text-white rounded-full ${getStatusColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>Reporter: {report.reporter_name}</div>
                    <div>Location: {report.location}</div>
                    <div>Updated: {getTimeAgo(report.updated_at)}</div>
                    {report.assignedTo && <div>Assigned to: {report.assignedTo}</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Management Panel */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedReport ? `Manage Status - ${selectedReport.title}` : "Select a Report"}</CardTitle>
            <CardDescription>
              {selectedReport ? "Update status, priority, and assignment" : "Choose a report to manage its status"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedReport ? (
              <div className="space-y-4">
                {/* Current Status */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Status</span>
                    <span
                      className={`px-2 py-1 text-xs text-white rounded-full ${getStatusColor(selectedReport.status)}`}
                    >
                      {getStatusLabel(selectedReport.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">Last updated: {getTimeAgo(selectedReport.updated_at)}</div>
                </div>

                {/* Status Update Form */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">New Status</label>
                    <select
                      value={selectedReport.status}
                      onChange={(e) => setSelectedReport({ ...selectedReport, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Assign To</label>
                    <Input
                      placeholder="Enter email address"
                      value={assignedUser}
                      onChange={(e) => setAssignedUser(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Resolution</label>
                    <Input
                      type="datetime-local"
                      value={estimatedResolution}
                      onChange={(e) => setEstimatedResolution(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Status Notes</label>
                    <textarea
                      placeholder="Add notes about this status change..."
                      value={newStatusNote}
                      onChange={(e) => setNewStatusNote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={() =>
                      updateReportStatus(
                        selectedReport.id,
                        selectedReport.status,
                        newStatusNote,
                        assignedUser,
                        priority,
                        estimatedResolution,
                      )
                    }
                    disabled={updating}
                    className="w-full"
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </Button>
                </div>

                {/* Status History */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Status History</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {statusHistory.map((entry) => (
                      <div key={entry.id} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`px-2 py-1 text-xs text-white rounded ${getStatusColor(entry.status)}`}>
                            {getStatusLabel(entry.status)}
                          </span>
                          <span className="text-xs text-gray-500">{getTimeAgo(entry.changedAt)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>Changed by: {entry.changedBy}</div>
                          {entry.notes && <div>Notes: {entry.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-gray-500">Select a report from the list to manage its status</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Workflow Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Status Workflow Configuration</CardTitle>
          <CardDescription>Configure status transitions and automation rules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Available Status Options</h4>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <div key={status.value} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                      <span className="font-medium">{status.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{status.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Automation Rules</h4>
              <div className="space-y-2">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">Auto-escalate Critical Reports</div>
                  <div className="text-xs text-gray-600">
                    Automatically escalate reports marked as critical after 2 hours
                  </div>
                  <div className="mt-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Enabled</span>
                    </label>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">Auto-close Resolved Reports</div>
                  <div className="text-xs text-gray-600">
                    Automatically close reports after 7 days in resolved status
                  </div>
                  <div className="mt-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Enabled</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
