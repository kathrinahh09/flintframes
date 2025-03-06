import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pukmiyeyaiphhpzlhefe.supabase.co";  // Replace with your actual Supabase project URL
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1a21peWV5YWlwaGhwemxoZWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzkxMjMsImV4cCI6MjA1NjQxNTEyM30.gmoeJsHsp2qyDgsTuNhQRTBT5yrNgnKlseIQQg3yLvY";  // Replace with your actual Supabase API key

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);