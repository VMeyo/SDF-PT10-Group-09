"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"
import { Leaderboard } from "./Leaderboard"
import { RewardsStore } from "./RewardsStore"

export const PointsSystem = () => {
  const { user } = useAuth()
  const [userPoints, setUserPoints] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)

const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchUserPoints()
  }, [])

  const fetchUserPoints = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/points/`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUserPoints(data)
      }
    } catch (error) {
      console.error("Error fetching user points:", error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
    { id: "rewards", label: "Rewards Store", icon: "🎁" },
  ]

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading points system...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Points & Rewards</h2>
        <p className="text-muted-foreground">Earn points for community contributions and redeem exciting rewards</p>
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your Points</p>
                <p className="text-3xl font-bold text-primary">{userPoints?.points || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total earned</p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your Rank</p>
                <p className="text-3xl font-bold">{userPoints?.rank || "N/A"}</p>
                <p className="text-xs text-muted-foreground mt-1">Community ranking</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                <p className="text-3xl font-bold text-green-600">{userPoints?.available_points || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Ready to redeem</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How to Earn Points</CardTitle>
              <CardDescription>Contribute to your community and earn rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      📝
                    </div>
                    <div>
                      <h4 className="font-medium">Report Incident</h4>
                      <p className="text-sm text-muted-foreground">+10 points per report</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      ✅
                    </div>
                    <div>
                      <h4 className="font-medium">Incident Resolved</h4>
                      <p className="text-sm text-muted-foreground">+25 points when resolved</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                      💬
                    </div>
                    <div>
                      <h4 className="font-medium">Add Comment</h4>
                      <p className="text-sm text-muted-foreground">+5 points per helpful comment</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                      📸
                    </div>
                    <div>
                      <h4 className="font-medium">Upload Evidence</h4>
                      <p className="text-sm text-muted-foreground">+15 points per media upload</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                      🚨
                    </div>
                    <div>
                      <h4 className="font-medium">High Priority Report</h4>
                      <p className="text-sm text-muted-foreground">+50 points for urgent incidents</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                    <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                      🎖️
                    </div>
                    <div>
                      <h4 className="font-medium">Weekly Bonus</h4>
                      <p className="text-sm text-muted-foreground">+100 points for active users</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest point-earning activities</CardDescription>
            </CardHeader>
            <CardContent>
              {userPoints?.recent_activities?.length > 0 ? (
                <div className="space-y-3">
                  {userPoints.recent_activities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm">
                          +
                        </div>
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">{activity.date}</p>
                        </div>
                      </div>
                      <span className="font-medium text-primary">+{activity.points}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📈</div>
                  <p className="text-muted-foreground">Start reporting incidents to earn your first points!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "leaderboard" && <Leaderboard />}

      {activeTab === "rewards" && <RewardsStore userPoints={userPoints} onPointsUpdate={fetchUserPoints} />}
    </div>
  )
}
