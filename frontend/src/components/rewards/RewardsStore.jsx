"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"

export const RewardsStore = ({ userPoints, onPointsUpdate }) => {
  const [redeeming, setRedeeming] = useState(null)
  const [redeemSuccess, setRedeemSuccess] = useState("")
  const [redeemError, setRedeemError] = useState("")

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  const rewards = [
    {
      id: 1,
      title: "Coffee Voucher",
      description: "Enjoy a free coffee at participating cafes",
      points: 100,
      icon: "☕",
      category: "Food & Drink",
      available: true,
    },
    {
      id: 2,
      title: "Mobile Data Bundle",
      description: "1GB mobile data for your phone",
      points: 150,
      icon: "📱",
      category: "Technology",
      available: true,
    },
    {
      id: 3,
      title: "Public Transport Pass",
      description: "Free day pass for public transportation",
      points: 200,
      icon: "🚌",
      category: "Transportation",
      available: true,
    },
    {
      id: 4,
      title: "Movie Ticket",
      description: "Free movie ticket at participating cinemas",
      points: 250,
      icon: "🎬",
      category: "Entertainment",
      available: true,
    },
    {
      id: 5,
      title: "Restaurant Meal",
      description: "Free meal at partner restaurants",
      points: 300,
      icon: "🍽️",
      category: "Food & Drink",
      available: true,
    },
    {
      id: 6,
      title: "Gym Day Pass",
      description: "One day access to partner fitness centers",
      points: 180,
      icon: "💪",
      category: "Health & Fitness",
      available: true,
    },
    {
      id: 7,
      title: "Book Store Voucher",
      description: "Discount voucher for books and stationery",
      points: 120,
      icon: "📚",
      category: "Education",
      available: true,
    },
    {
      id: 8,
      title: "Charity Donation",
      description: "Donate points to local community projects",
      points: 50,
      icon: "❤️",
      category: "Community",
      available: true,
    },
  ]

  const handleRedeem = async (reward) => {
    if ((userPoints?.available_points || 0) < reward.points) {
      setRedeemError("Insufficient points to redeem this reward")
      setTimeout(() => setRedeemError(""), 3000)
      return
    }

    setRedeeming(reward.id)
    setRedeemError("")
    setRedeemSuccess("")

    try {
      const response = await fetch(`${API_BASE}/users/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reward_id: reward.id,
          points: reward.points,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setRedeemSuccess(`Successfully redeemed ${reward.title}! Check your email for details.`)
        onPointsUpdate() // Refresh user points
        setTimeout(() => setRedeemSuccess(""), 5000)
      } else {
        setRedeemError(data.message || "Failed to redeem reward")
        setTimeout(() => setRedeemError(""), 3000)
      }
    } catch (error) {
      setRedeemError("Network error. Please try again.")
      setTimeout(() => setRedeemError(""), 3000)
    } finally {
      setRedeeming(null)
    }
  }

  const canAfford = (points) => (userPoints?.available_points || 0) >= points

  const categories = [...new Set(rewards.map((r) => r.category))]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rewards Store</CardTitle>
          <CardDescription>Redeem your points for exciting rewards and community benefits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg mb-6">
            <div>
              <h3 className="font-semibold">Available Balance</h3>
              <p className="text-sm text-muted-foreground">Points ready to redeem</p>
            </div>
            <div className="text-2xl font-bold text-primary">{userPoints?.available_points || 0}</div>
          </div>

          {redeemSuccess && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md mb-4">
              {redeemSuccess}
            </div>
          )}

          {redeemError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md mb-4">
              {redeemError}
            </div>
          )}
        </CardContent>
      </Card>

      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards
                .filter((reward) => reward.category === category)
                .map((reward) => (
                  <div
                    key={reward.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      canAfford(reward.points) ? "border-border hover:bg-accent/50" : "border-muted bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{reward.icon}</div>
                      <div
                        className={`text-lg font-bold ${canAfford(reward.points) ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {reward.points} pts
                      </div>
                    </div>

                    <h3 className={`font-semibold mb-2 ${canAfford(reward.points) ? "" : "text-muted-foreground"}`}>
                      {reward.title}
                    </h3>
                    <p
                      className={`text-sm mb-4 ${canAfford(reward.points) ? "text-muted-foreground" : "text-muted-foreground/70"}`}
                    >
                      {reward.description}
                    </p>

                    <Button
                      variant={canAfford(reward.points) ? "default" : "secondary"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford(reward.points) || redeeming === reward.id}
                    >
                      {redeeming === reward.id
                        ? "Redeeming..."
                        : canAfford(reward.points)
                          ? "Redeem Now"
                          : "Insufficient Points"}
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>How Redemption Works</CardTitle>
          <CardDescription>Everything you need to know about redeeming rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Choose Your Reward</h4>
                  <p className="text-sm text-muted-foreground">Browse available rewards and select what you want</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Confirm Redemption</h4>
                  <p className="text-sm text-muted-foreground">Points will be deducted from your available balance</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Receive Instructions</h4>
                  <p className="text-sm text-muted-foreground">Get redemption details via email or SMS</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Enjoy Your Reward</h4>
                  <p className="text-sm text-muted-foreground">Present your code at participating locations</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
