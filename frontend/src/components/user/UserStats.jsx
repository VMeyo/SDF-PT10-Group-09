import { Card, CardContent } from "../ui/Card"

export const UserStats = ({ stats, incidentCount }) => {
  const statCards = [
    {
      title: "Total Reports",
      value: incidentCount || 0,
      icon: "📋",
      description: "Incidents reported",
    },
    {
      title: "Points Earned",
      value: stats?.points || 0,
      icon: "🏆",
      description: "Community contribution points",
    },
    {
      title: "Community Rank",
      value: stats?.rank || "N/A",
      icon: "🎯",
      description: "Your position on leaderboard",
    },
    {
      title: "Response Rate",
      value: stats?.response_rate || "0%",
      icon: "⚡",
      description: "Average response time",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
