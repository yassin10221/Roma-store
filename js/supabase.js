const SUPABASE_URL = "https://irlhnjjarcffpdzqpzaj.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlybGhuamphcmNmZnBkenFwemFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzA0NDcsImV4cCI6MjA5OTYwNjQ0N30.Hj7XgXomQ73Cgmaf-sEKQLZgKxOnEWtMYS5hG56ryBE";

window.supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log("Supabase Loaded", window.supabaseClient);