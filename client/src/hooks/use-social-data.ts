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
        console.error(`❌ Error fetching data from ${tableName}:`, error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} rows from ${tableName}`);

      if (data && data.length > 0) {
        console.log("📋 Sample row columns:", Object.keys(data[0]));
        console.log("📄 First row data:", data[0]);
      } else {
        console.warn(`⚠️ NO DATA returned from table "${tableName}"!`);
        console.warn(`
 🔍 TROUBLESHOOTING STEPS:
1. ✅ Connection works (no error)
2. ❌ Table returned 0 rows

MOST LIKELY CAUSE: Row Level Security (RLS) is blocking access

 📝 TO FIX:
1. Go to: https://iabkwkrcxpixxijozrvx.supabase.co
2. Click "Authentication" → "Policies"
3. Find table "${tableName}"
4. Click "New Policy" → "Get started quickly"
5. Choose "Enable read access for all users"
6. Click "Review" then "Save policy"

 OR disable RLS entirely:
1. Go to Table Editor
2. Click on "${tableName}" table
3. Click the settings icon
4. Toggle "Enable Row Level Security" OFF
        `);
      }

      // Transform Supabase data to match SocialPost interface
      const transformed = (data || []).map((row: any, index: number) => {
        // Extract Date_From and Date_To
        const dateFromValue = row.Date_From || row.date_from || "";
        const dateToValue = row.Date_To || row.date_to || "";
        // Use Date_From as the primary date for backwards compatibility
        const dateValue = dateFromValue || dateToValue || row.date || row.Date || row.created_at || new Date().toISOString().split('T')[0];

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
          dateFrom: dateFromValue,
          dateTo: dateToValue,
        };
        return result;
      }) as SocialPost[];

      console.log(`Transformed ${transformed.length} rows`);
      return transformed;
    },
  });
}