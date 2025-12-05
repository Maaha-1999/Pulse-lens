
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SocialPost } from "@/lib/mockData";

// Map topic IDs to actual Supabase table names
const TABLE_MAPPING: Record<string, string> = {
  "topic1": "FM", 
  "topic2": "PTI"   
};

export function useSocialData(topicId: string) {
  return useQuery({
    queryKey: ["social-data", topicId],
    queryFn: async () => {
      const tableName = TABLE_MAPPING[topicId];
      if (!tableName) return [];

      const { data, error } = await supabase
        .from(tableName)
        .select("*");

      if (error) {
        console.error(`Error fetching data from ${tableName}:`, error);
        throw error;
      }

      // Transform Supabase data to match SocialPost interface
      return (data || []).map((row: any) => ({
        id: row.id || row.ID,
        accountName: row.account || row.Account || row.account_name || row.Account_Name || "",
        handle: row.handle || row.Handle || row.account || row.Account || "",
        platform: row.platform || row.Platform || "unknown",
        location: row.location || row.Location || "",
        engagements: row.engagement || row.Engagement || row.engagements || row.Engagements || 0,
        narrative: row.narrative || row.Narrative || "",
        geoCoordinates: row.geo_coordinates || row.Geo_Coordinates || "",
        date: row.date || row.Date || new Date().toISOString(),
      })) as SocialPost[];
    },
  });
}
