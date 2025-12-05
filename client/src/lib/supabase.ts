import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iabkwkrcxpixxijozrvx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYmt3a3JjeHBpeHhpam96cnZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTU0MTMsImV4cCI6MjA4MDM5MTQxM30.zJa98lwxZLIDRfyetUepEXuOMWYW4OB3USv5B5ZI8ng";

export const supabase = createClient(supabaseUrl, supabaseKey);
