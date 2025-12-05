import { SocialPost } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users } from "lucide-react";

interface StatsCardsProps {
  data: SocialPost[];
}

export default function StatsCards({ data }: StatsCardsProps) {
  const totalEngagements = data.reduce((sum, post) => sum + (post.engagements || 0), 0);
  const uniqueAccounts = new Set(data.map((p) => p.handle).filter(Boolean)).size;

  const stats = [
    {
      title: "Total Engagements",
      value: totalEngagements.toLocaleString(),
      change: "+12.5%",
      icon: TrendingUp,
      color: "text-cyan-400",
    },
    {
      title: "Active Accounts",
      value: uniqueAccounts.toString(),
      change: "+4.1%",
      icon: Users,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {stats.map((stat) => (
        <Card key={stat.title} className="glass-card border-border/50 bg-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={stat.change.startsWith("+") ? "text-emerald-400" : "text-rose-400"}>
                {stat.change}
              </span>{" "}
              from yesterday
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
