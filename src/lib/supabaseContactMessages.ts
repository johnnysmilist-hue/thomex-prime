import { supabase } from "@/lib/supabaseClient";

export async function submitContactMessage(data: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  return supabase.from("contact_messages").insert(data);
}
