import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Authentication alone is insufficient: membership must exist in this project's database. */
export async function requireAdminApi() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { response: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user) return { response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  const { data: allowed, error } = await supabase.rpc("is_admin");
  if (error) return { response: NextResponse.json({ error: "Admin access could not be verified." }, { status: 503 }) };
  if (allowed !== true) return { response: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  return { supabase, user: data.user };
}
