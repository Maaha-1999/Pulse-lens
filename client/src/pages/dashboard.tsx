import { useState, useMemo } from "react";
import { format } from "date-fns";
import Layout from "@/components/layout";
import StatsCards from "@/components/stats-cards";
import DataTable from "@/components/data-table";
import { topics } from "@/lib/mockData";
import { useSocialData } from "@/hooks/use-social-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Calendar as CalendarIcon, X, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [activeTopic, setActiveTopic] = useState(topics[0].id);
  const [filter, setFilter] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const { data: rawData = [], isLoading, error } = useSocialData(activeTopic);
  const currentTopicName = topics.find(t => t.id === activeTopic)?.name;

  // Filter data based on Date ONLY (for Stats)
  const dateFilteredData = useMemo(() => {
    return rawData.filter((post) => {
      if (!date) return true;
      return post.date === format(date, "yyyy-MM-dd");
    });
  }, [rawData, date]);

  // Filter data based on Date AND Text Search (for Table & Export)
  const fullyFilteredData = useMemo(() => {
    const lowerFilter = filter.toLowerCase();
    return dateFilteredData.filter((post) => 
      (post.accountName || "").toLowerCase().includes(lowerFilter) ||
      (post.handle || "").toLowerCase().includes(lowerFilter) ||
      (post.narrative || "").toLowerCase().includes(lowerFilter)
    );
  }, [dateFilteredData, filter]);

  const handleExport = () => {
    // Define CSV headers
    const headers = ["ID", "Account Name", "Handle", "Platform", "Location", "Geo Coordinates", "Engagements", "Narrative", "Date"];
    
    // Convert data to CSV format
    const csvContent = [
      headers.join(","),
      ...fullyFilteredData.map(row => [
        row.id,
        `"${(row.accountName || "").replace(/"/g, '""')}"`,
        row.handle || "",
        row.platform || "",
        `"${(row.location || "").replace(/"/g, '""')}"`,
        `"${row.geoCoordinates || ""}"`,
        row.engagements || 0,
        `"${(row.narrative || "").replace(/"/g, '""')}"`,
        row.date || ""
      ].join(","))
    ].join("\n");

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PulseLens_Report_${currentTopicName}_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal bg-secondary/30 border-border/50 hover:bg-secondary/50",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              {date && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setDate(undefined)}
                  className="h-9 w-9 hover:bg-secondary/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Button 
              onClick={handleExport}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              disabled={isLoading || rawData.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Topic Tabs */}
        <Tabs value={activeTopic} onValueChange={(val) => {
          setActiveTopic(val);
        }} className="w-full">
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

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="glass-panel rounded-xl p-6 border-destructive/50 text-center">
            <p className="text-destructive mb-2">Failed to load data from Supabase.</p>
            <p className="text-sm text-muted-foreground">Please check your connection and try again.</p>
          </div>
        ) : (
          <>
            {/* Stats Overview - Only show when date is selected */}
            {date && (
              <section>
                <StatsCards data={dateFilteredData} />
              </section>
            )}

            {/* Main Data Table - Uses data filtered by DATE and TEXT */}
            <section className="glass-panel rounded-xl p-6 border-border/50">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Detailed Narratives</h2>
                <p className="text-sm text-muted-foreground">
                  {date ? "Filter and analyze individual account performance." : "Select a date to view narratives."}
                </p>
              </div>
              <DataTable 
                data={fullyFilteredData} 
                filter={filter}
                setFilter={setFilter}
              />
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
