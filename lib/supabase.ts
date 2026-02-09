import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://leokzydsomuykivaoqvn.supabase.co"
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlb2t6eWRzb211eWtpdmFvcXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NTE5NDIsImV4cCI6MjA4NTUyNzk0Mn0.CChYUO1oTc6bN_IdtVUg8ehsJXjuHm7qJ5upYx1oRJM"

// Singleton pattern para garantir uma única instância do cliente
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
    if (!supabaseClient) {
        supabaseClient = createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
    }
    return supabaseClient
}

