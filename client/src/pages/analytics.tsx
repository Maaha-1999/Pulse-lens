import { useMemo } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from "recharts";
import { useSocialData } from "@/hooks/use-social-data";
import { Loader2 } from "lucide-react";
import { topics } from "@/lib/mockData";

const AUTHOR_COLORS = ["#22d3ee", "#818cf8", "#a78bfa", "#c084fc", "#e879f9"];

export default function Analytics() {
  // Fetch data from both tables
  const { data: fmData = [], isLoading: fmLoading } = useSocialData("topic1");
  const { data: ptiData = [], isLoading: ptiLoading } = useSocialData("topic2");

  const isLoading = fmLoading || ptiLoading;
  const allData = [...fmData, ...ptiData];

  // Calculate engagement trends for last 7 days of available data
  const engagementTrends = useMemo(() => {
    if (allData.length === 0) return [];

    console.log("📊 Total posts for analytics:", allData.length);

    // Get all unique dates from the data
    const allDates = new Set<string>();
    allData.forEach(post => {
      const dateFrom = post.dateFrom || post.date || "";
      const dateTo = post.dateTo || dateFrom;
      
      if (dateFrom) allDates.add(dateFrom);
      if (dateTo && dateTo !== dateFrom) allDates.add(dateTo);
    });

    // Convert to array and sort (most recent first)
    const sortedDates = Array.from(allDates).sort((a, b) => b.localeCompare(a));
    
    console.log("📅 Available dates:", sortedDates.slice(0, 10));

    if (sortedDates.length === 0) return [];

    // Get the last 7 unique dates from the data
    const last7Dates = sortedDates.slice(0, 7).reverse(); // Reverse to show oldest to newest

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const trends = last7Dates.map(dateStr => {
      const date = new Date(dateStr + "T00:00:00");
      const dayName = dayNames[date.getDay()];
      
      // Sum engagements for posts that match this exact date
      const postsOnThisDay = allData.filter(post => {
        const postFrom = post.dateFrom || post.date || "";
        const postTo = post.dateTo || postFrom;
        
        // Check if this date falls within the post's date range
        return postFrom <= dateStr && postTo >= dateStr;
      });

      const totalEngagement = postsOnThisDay.reduce((sum, post) => sum + (post.engagements || 0), 0);

      console.log(`📅 ${dayName} (${dateStr}): ${postsOnThisDay.length} posts, ${totalEngagement} engagements`);

      return {
        name: dayName,
        engagement: totalEngagement,
        date: dateStr
      };
    });

    console.log("📈 Engagement trends:", trends);
    return trends;
  }, [allData]);

  // Calculate top 5 most common authors
  const topAuthors = useMemo(() => {
    if (allData.length === 0) return [];

    // Count posts by each author
    const authorCounts = new Map<string, number>();
    
    allData.forEach(post => {
      const author = post.handle || post.accountName || "Unknown";
      authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
    });

    // Convert to array and sort by count
    const sortedAuthors = Array.from(authorCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return sortedAuthors;
  }, [allData]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Analytics Overview
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Deep dive into engagement metrics and platform performance.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-lg md:text-xl">
                Engagement Trends (Recent Activity)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px]">
              {engagementTrends.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No data available for the last 7 days
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementTrends}>
                    <defs>
                      <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#1e293b",
                      }}
                      itemStyle={{ color: "#e2e8f0" }}
                      formatter={(value: number) => [
                        value.toLocaleString(),
                        "Engagements",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="engagement"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEngagement)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-lg md:text-xl">
                Top Most Common Authors
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px]">
              {topAuthors.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No author data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topAuthors}
                    layout="vertical"
                    margin={{ left: 60, right: 10, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#e2e8f0"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#1e293b",
                      }}
                      itemStyle={{ color: "#e2e8f0" }}
                      formatter={(value: number) => [value, "Posts"]}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                      {topAuthors.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={AUTHOR_COLORS[index % AUTHOR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}