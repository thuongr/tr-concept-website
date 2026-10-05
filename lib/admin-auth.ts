import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { supabase: null, user: null, setupRequired: true as const };
  }

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: allowed, error } = await supabase.rpc("is_admin");
  if (error || allowed !== true) redirect("/admin/access-denied");

  return { supabase, user: data.user, setupRequired: false as const };
}
