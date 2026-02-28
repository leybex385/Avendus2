/**
 * Supabase Client Initialization
 * Loaded via <script src="js/supabase.js"></script>
 */
const SUPABASE_URL = "https://gipxccfydceahzmqdoks.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcHhjY2Z5ZGNlYWh6bXFkb2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjI2NDQsImV4cCI6MjA4NjAzODY0NH0.evPHM1GdBOufR2v2KYARiG8r81McUtUAPNVovn6P6-s";

// Use the global 'supabase' object provided by the CDN script
if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase Client Initialized via js/supabase.js");
} else {
    console.error("Supabase SDK (CDN) must be loaded before js/supabase.js");
}
