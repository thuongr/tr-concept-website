import type { SupabaseClient } from "@supabase/supabase-js";

/** Public forms may resolve an identity, never overwrite an existing person's profile. */
export async function findOrCreateContact(supabase: SupabaseClient, input: { name: string; email: string; business_name: string | null }) {
  const created = await supabase.from("contacts").upsert(input, { onConflict: "email", ignoreDuplicates: true }).select("id").maybeSingle();
  if (created.error || created.data) return created;
  return supabase.from("contacts").select("id").eq("email", input.email).single();
}
