// ── SUPABASE CLIENT ─────────────────────────────────────
const SUPABASE_URL = 'https://yflrorrqgmoveleiucbg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmbHJvcnJxZ21vdmVsZWl1Y2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDM1MzYsImV4cCI6MjA5NTg3OTUzNn0.FFJ8SGmH6b1lusN0PR3CPNCBSmEuUcccPSsLm1FubBM';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);