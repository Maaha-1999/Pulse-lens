import { useState } from "react";
import Layout from "@/components/layout";
import StatsCards from "@/components/stats-cards";
import DataTable from "@/components/data-table";
import { topic1Data, topic2Data, topics } from "@/lib/mockData";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";

export default function Dashboard() {
  const [activeTopic, setActiveTopic] = useState(topics[0].id);
  
  const currentData = activeTopic === "topic1" ? topic1Data : topic2Data;
  const currentTopicName = topics.find(t => t.id === activeTopic)?.name;

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time narrative tracking for <span className="text-primary font-medium">{currentTopicName}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-secondary/30 border-border/50 hover:bg-secondary/50">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Topic Tabs */}
        <Tabs value={activeTopic} onValueChange={setActiveTopic} className="w-full">
          <TabsList className="bg-secondary/40 border border-border/50 p-1 h-auto">
            {topics.map((topic) => (
              <TabsTrigger 
                key={topic.id} 
                value={topic.id}
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none py-2 px-4 transition-all"
              >
                {topic.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Stats Overview */}
        <section>
           <StatsCards data={currentData} />
        </section>

        {/* Main Data Table */}
        <section className="glass-panel rounded-xl p-6 border-border/50">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Detailed Narratives</h2>
            <p className="text-sm text-muted-foreground">Filter and analyze individual account performance.</p>
          </div>
          <DataTable data={currentData} />
        </section>

      </div>
    </Layout>
  );
}
