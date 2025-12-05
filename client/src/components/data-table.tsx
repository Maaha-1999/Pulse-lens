import { useState, useMemo } from "react";
import { SocialPost } from "@/lib/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Twitter, Facebook, Instagram, Linkedin, MapPin, Calendar as CalendarIcon, Globe, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DataTableProps {
  data: SocialPost[];
}

export default function DataTable({ data }: DataTableProps) {
  const [filter, setFilter] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [visibleColumns, setVisibleColumns] = useState({
    accountName: true,
    handle: true,
    platform: true,
    location: true,
    geoCoordinates: true,
    engagements: true,
    narrative: true,
    date: true,
  });

  const filteredData = useMemo(() => {
    const lowerFilter = filter.toLowerCase();
    return data.filter((post) => {
      const matchesText = 
        post.accountName.toLowerCase().includes(lowerFilter) ||
        post.handle.toLowerCase().includes(lowerFilter) ||
        post.narrative.toLowerCase().includes(lowerFilter);
      
      const matchesDate = date 
        ? post.date === format(date, "yyyy-MM-dd")
        : true;
        
      return matchesText && matchesDate;
    });
  }, [data, filter, date]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Twitter": return <Twitter className="w-4 h-4 text-sky-400" />;
      case "Facebook": return <Facebook className="w-4 h-4 text-blue-500" />;
      case "Instagram": return <Instagram className="w-4 h-4 text-pink-500" />;
      case "LinkedIn": return <Linkedin className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter accounts, handles, narratives..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 bg-secondary/30 border-border/50 focus:border-primary/50 transition-colors"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal bg-secondary/30 border-border/50",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto h-9 bg-secondary/30 border-border/50">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-secondary/90 backdrop-blur-xl border-border/50">
            {Object.keys(visibleColumns).map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                className="capitalize"
                checked={visibleColumns[key as keyof typeof visibleColumns]}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, [key]: checked }))
                }
              >
                {key.replace(/([A-Z])/g, " $1").trim()}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border border-border/50 bg-secondary/20 overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/40">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[100px]">ID</TableHead>
              {visibleColumns.accountName && <TableHead>Account</TableHead>}
              {visibleColumns.handle && <TableHead>Handle</TableHead>}
              {visibleColumns.platform && <TableHead>Platform</TableHead>}
              {visibleColumns.location && <TableHead>Location</TableHead>}
              {visibleColumns.geoCoordinates && <TableHead>Geo Coords</TableHead>}
              {visibleColumns.engagements && <TableHead className="text-right">Engagements</TableHead>}
              {visibleColumns.narrative && <TableHead className="w-[300px]">Narrative</TableHead>}
              {visibleColumns.date && <TableHead className="text-right">Date</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
               <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((post) => (
                <TableRow key={post.id} className="hover:bg-white/5 border-border/50 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">{post.id}</TableCell>
                  
                  {visibleColumns.accountName && (
                    <TableCell className="font-medium text-foreground">{post.accountName}</TableCell>
                  )}
                  
                  {visibleColumns.handle && (
                    <TableCell className="text-muted-foreground font-mono text-xs">{post.handle}</TableCell>
                  )}
                  
                  {visibleColumns.platform && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(post.platform)}
                        <span className="text-xs">{post.platform}</span>
                      </div>
                    </TableCell>
                  )}
                  
                  {visibleColumns.location && (
                    <TableCell>
                       <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs truncate max-w-[100px]">{post.location}</span>
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.geoCoordinates && (
                    <TableCell>
                       <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Globe className="w-3 h-3" />
                        <span className="text-xs font-mono">{post.geoCoordinates}</span>
                      </div>
                    </TableCell>
                  )}
                  
                  {visibleColumns.engagements && (
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20 font-mono">
                        {post.engagements.toLocaleString()}
                      </Badge>
                    </TableCell>
                  )}
                  
                  {visibleColumns.narrative && (
                    <TableCell>
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-[300px]">
                        {post.narrative}
                      </p>
                    </TableCell>
                  )}
                  
                  {visibleColumns.date && (
                    <TableCell className="text-right text-xs text-muted-foreground font-mono">
                      {post.date}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
