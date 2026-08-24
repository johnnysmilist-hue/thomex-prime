import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

// Lazily creates a Supabase client using the service role key (bypasses RLS) for
// server-only routes. Falls back to the public key if no service role key is set,
// so it still works during initial setup — but the service role key is strongly
// recommended for anything that writes to protected tables like orders.
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured on the server.");
  }

  cached = createClient(url, key);
  return cached;
}
