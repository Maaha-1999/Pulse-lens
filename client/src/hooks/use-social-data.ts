
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
      if (!tableName) {
        console.log("No table mapping found for:", topicId);
        return [];
      }

      console.log(`Fetching data from table: ${tableName}`);
      const { data, error } = await supabase
        .from(tableName)
        .select("*");

      if (error) {
        console.error(`Error fetching data from ${tableName}:`, error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} rows from ${tableName}`);
      if (data && data.length > 0) {
        console.log("Sample row columns:", Object.keys(data[0]));
      }

      // Transform Supabase data to match SocialPost interface
      const transformed = (data || []).map((row: any, index: number) => {
        // Use Date_From as the primary date, fallback to Date_To or current date
        const dateValue = row.Date_From || row.date_from || row.Date_To || row.date_to || row.date || row.Date || row.created_at || new Date().toISOString().split('T')[0];
        
        const result = {
          id: row.id || row.ID || `${tableName}-${index}`,
          accountName: row.account || row.Account || row.account_name || row.Account_Name || `Account ${index}`,
          handle: row.handle || row.Handle || row.account || row.Account || `@user${index}`,
          platform: (row.platform || row.Platform || "Twitter") as any,
          location: row.location || row.Location || "Unknown",
          engagements: parseInt(row.engagement || row.Engagement || row.engagements || row.Engagements || 0),
          narrative: row.narrative || row.Narrative || row.message || row.Message || "",
          geoCoordinates: row.geo_coordinates || row.Geo_Coordinates || row.coordinates || "",
          date: dateValue,
        };
        return result;
      }) as SocialPost[];

      console.log(`Transformed ${transformed.length} rows`);
      return transformed;
    },
  });
}
