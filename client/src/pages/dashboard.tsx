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
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  
  const { data: rawData = [], isLoading, error } = useSocialData(activeTopic);
  const currentTopicName = topics.find(t => t.id === activeTopic)?.name;

  // Handlers to ensure `dateFrom` <= `dateTo`. If user selects inverted range, swap values.
  const handleSelectFrom = (d?: Date | undefined) => {
    if (!d) {
      setDateFrom(undefined);
      return;
    }
    if (dateTo && d > dateTo) {
      // swap
      setDateFrom(dateTo);
      setDateTo(d);
      return;
    }
    setDateFrom(d);
  };

  const handleSelectTo = (d?: Date | undefined) => {
    if (!d) {
      setDateTo(undefined);
      return;
    }
    if (dateFrom && d < dateFrom) {
      // swap
      setDateTo(dateFrom);
      setDateFrom(d);
      return;
    }
    setDateTo(d);
  };

  // Filter data based on Date Range (for Stats)
  const dateFilteredData = useMemo(() => {
    console.log(`Raw data count: ${rawData.length}`);

    if (!dateFrom && !dateTo) {
      console.log("No date range selected, showing all data");
      return rawData;
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const fromYMD = dateFrom ? toYMD(dateFrom) : undefined;
    const toYMDStr = dateTo ? toYMD(dateTo) : undefined;

    console.log(`Filtering for range: ${fromYMD || "(none)"} -> ${toYMDStr || "(none)"}`);

    const filtered = rawData.filter((post) => {
      // Parse post dateFrom/dateTo (fall back to post.date) into local YMD string
      const rawFrom = post.dateFrom || post.date || "";
      const rawTo = post.dateTo || rawFrom;

      const parseToLocalYMD = (s: string) => {
        if (!s) return "";
        const str = String(s).trim();
        // If already normalized YYYY-MM-DD from the data layer, return directly
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
        const d = new Date(str);
        if (Number.isNaN(d.getTime())) return "";
        // Use UTC getters to avoid local timezone shifting the date
        const y = d.getUTCFullYear();
        const m = pad(d.getUTCMonth() + 1);
        const day = pad(d.getUTCDate());
        return `${y}-${m}-${day}`;
      };

      const postFrom = parseToLocalYMD(rawFrom);
      const postTo = parseToLocalYMD(rawTo) || postFrom;

      // If both from and to are selected, check for any overlap
      if (fromYMD && toYMDStr) {
        return postFrom <= toYMDStr && postTo >= fromYMD;
      }

      // If only from is selected, check whether the post covers that day
      if (fromYMD && !toYMDStr) {
        return postFrom <= fromYMD && postTo >= fromYMD;
      }

      // If only to is selected, check whether the post covers that day
      if (!fromYMD && toYMDStr) {
        return postFrom <= toYMDStr && postTo >= toYMDStr;
      }

      return true;
    });

    console.log(`Filtered data count: ${filtered.length}`);
    return filtered;
  }, [rawData, dateFrom, dateTo]);

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
    const headers = ["ID", "Account Name", "Handle", "Platform", "Location", "Geo Coordinates", "Engagements", "Narrative", "Date From", "Date To"];
    
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
        row.dateFrom || "",
        row.dateTo || ""
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
                          "w-[180px] justify-start text-left font-normal bg-secondary/30 border-border/50 hover:bg-secondary/50",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? `From: ${format(dateFrom, "PPP")}` : <span>Date From</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={handleSelectFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {dateFrom && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setDateFrom(undefined)}
                      className="h-9 w-9 hover:bg-secondary/50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[180px] justify-start text-left font-normal bg-secondary/30 border-border/50 hover:bg-secondary/50",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? `To: ${format(dateTo, "PPP")}` : <span>Date To</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={handleSelectTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {dateTo && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setDateTo(undefined)}
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
            {/* Stats Overview - Only show when a date/from-to is selected */}
            {(dateFrom || dateTo) && (
              <section>
                <StatsCards data={dateFilteredData} />
              </section>
            )}

            {/* Main Data Table - Uses data filtered by DATE and TEXT */}
            <section className="glass-panel rounded-xl p-6 border-border/50">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Detailed Narratives</h2>
                <p className="text-sm text-muted-foreground">
                  {rawData.length === 0 ? (
                    "No data available. Check your Supabase connection and table setup."
                  ) : (dateFrom || dateTo) ? (
                    dateFrom && dateTo ?
                      `Showing ${fullyFilteredData.length} narratives for ${format(dateFrom, "PPP")} - ${format(dateTo, "PPP")}` :
                      dateFrom ? `Showing ${fullyFilteredData.length} narratives from ${format(dateFrom, "PPP")}` :
                      `Showing ${fullyFilteredData.length} narratives up to ${format(dateTo!, "PPP")}`
                  ) : (
                    `Showing all ${fullyFilteredData.length} narratives. Select a date range to filter.`
                  )}
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
