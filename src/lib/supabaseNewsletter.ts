import { supabase } from "@/lib/supabaseClient";

export async function subscribeToNewsletter(email: string) {
  return supabase.from("newsletter_subscribers").insert({ email });
}
