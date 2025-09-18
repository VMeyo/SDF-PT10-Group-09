"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"

export const Leaderboard = () => {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("all")

  const API_BASE = "https://ajali-copy-backend.onrender.com/api/v1"
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/leaderboard?timeframe=${timeframe}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data)
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return "🏅"
    }
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-200"
      case 3:
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Community Leaderboard</CardTitle>
              <CardDescription>Top contributors to the Ajali community</CardDescription>
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {leaderboard.length > 0 ? (
            <div className="space-y-4">
              {leaderboard.slice(0, 10).map((userEntry, index) => {
                const rank = index + 1
                const isCurrentUser = userEntry.id === user?.id

                return (
                  <div
                    key={userEntry.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      isCurrentUser ? "bg-primary/5 border-primary/20" : "border-border hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border ${getRankColor(rank)}`}
                      >
                        <span className="text-lg">{getRankIcon(rank)}</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-medium">
                          {userEntry.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className={`font-semibold ${isCurrentUser ? "text-primary" : ""}`}>{userEntry.name}</h3>
                            {isCurrentUser && (
                              <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                                You
                              </span>
                            )}
                            {userEntry.role === "admin" && (
                              <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>📋 {userEntry.incident_count || 0} reports</span>
                            <span>📅 Joined {new Date(userEntry.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{userEntry.points || 0}</div>
                      <div className="text-sm text-muted-foreground">points</div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
              <p className="text-muted-foreground">Be the first to earn points and claim the top spot!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User's Current Position */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Your Position</CardTitle>
            <CardDescription>See how you rank among all community members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">Your current ranking</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">#{leaderboard.findIndex((u) => u.id === user.id) + 1 || "N/A"}</div>
                <div className="text-sm text-muted-foreground">rank</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
