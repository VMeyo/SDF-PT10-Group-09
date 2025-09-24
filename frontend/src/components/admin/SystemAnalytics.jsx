"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"

export const SystemAnalytics = ({ stats }) => {
  const getIncidentsByCategory = () => {
    if (!stats?.incidents) return []

    const categories = {}
    stats.incidents.forEach((incident) => {
      categories[incident.category] = (categories[incident.category] || 0) + 1
    })

    return Object.entries(categories).map(([category, count]) => ({
      category,
      count,
      percentage: ((count / stats.incidents.length) * 100).toFixed(1),
    }))
  }

  const getIncidentsBySeverity = () => {
    if (!stats?.incidents) return []

    const severities = { high: 0, medium: 0, low: 0 }
    stats.incidents.forEach((incident) => {
      severities[incident.severity] = (severities[incident.severity] || 0) + 1
    })

    return Object.entries(severities).map(([severity, count]) => ({
      severity,
      count,
      percentage: ((count / stats.incidents.length) * 100).toFixed(1),
    }))
  }

  const getRecentActivity = () => {
    if (!stats?.incidents) return []

    return stats.incidents
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
      .map((incident) => ({
        ...incident,
        timeAgo: getTimeAgo(new Date(incident.created_at)),
      }))
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Less than an hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`
    return `${Math.floor(diffInHours / 168)} weeks ago`
  }

  const categoryData = getIncidentsByCategory()
  const severityData = getIncidentsBySeverity()
  const recentActivity = getRecentActivity()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">System Analytics</h2>
        <p className="text-muted-foreground">Detailed insights and platform statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Category</CardTitle>
            <CardDescription>Distribution of incident types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                    <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incidents by Severity */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Severity</CardTitle>
            <CardDescription>Priority level distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {severityData.map((item) => (
                <div key={item.severity} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        item.severity === "high"
                          ? "bg-red-500"
                          : item.severity === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    ></div>
                    <span className="text-sm font-medium capitalize">{item.severity}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                    <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest incident reports and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{incident.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {incident.location} • {incident.category} • {incident.timeAgo}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      incident.severity === "high"
                        ? "bg-red-100 text-red-800"
                        : incident.severity === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {incident.severity}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      incident.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : incident.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {incident.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Contributors */}
      {stats?.leaderboard && (
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Users with the most community points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.leaderboard.slice(0, 10).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.incident_count || 0} reports</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{user.points || 0} pts</p>
                    {user.role === "admin" && <span className="text-xs text-primary">Admin</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
