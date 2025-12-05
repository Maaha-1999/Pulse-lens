import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SocialPost } from "@/lib/mockData";

// Map Supabase table names to topic IDs
// We are guessing the table names based on the topics. 
// In a real app, these would be dynamic or strictly defined.
const TABLE_MAPPING: Record<string, string> = {
  "topic1": "Sustainability",
  "topic2": "AI Technology"
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
        // Fallback to empty array or handle error appropriately
        throw error;
      }

      // Transform Supabase data to match SocialPost interface
      // Assuming Supabase columns are snake_case as per user description (mostly)
      return (data || []).map((row: any) => ({
        id: row.ID || row.id,
        accountName: row.Account_Name || row.account_name,
        handle: row.Handle || row.handle,
        platform: row.Platform || row.platform,
        location: row.Location || row.location,
        engagements: row.Engagements || row.engagements,
        narrative: row.Narrative || row.narrative,
        geoCoordinates: row.Geo_Coordinates || row.geo_coordinates,
        date: row.Date || row.date,
      })) as SocialPost[];
    },
  });
}
