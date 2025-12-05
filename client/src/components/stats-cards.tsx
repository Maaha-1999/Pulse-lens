import { SocialPost } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, MessageSquare, Globe } from "lucide-react";

interface StatsCardsProps {
  data: SocialPost[];
}

export default function StatsCards({ data }: StatsCardsProps) {
  const totalEngagements = data.reduce((sum, post) => sum + (post.engagements || 0), 0);
  const uniqueAccounts = new Set(data.map((p) => p.handle).filter(Boolean)).size;
  const platforms = new Set(data.map((p) => p.platform).filter(Boolean)).size;
  const avgEngagement = data.length > 0 ? Math.round(totalEngagements / data.length) : 0;

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
    {
      title: "Avg. Engagement",
      value: avgEngagement.toLocaleString(),
      change: "-2.3%",
      icon: MessageSquare,
      color: "text-pink-400",
    },
    {
      title: "Active Platforms",
      value: platforms.toString(),
      change: "0%",
      icon: Globe,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
