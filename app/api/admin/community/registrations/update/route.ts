import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowed = new Set(["REGISTERED", "ATTENDED", "NO_SHOW", "CANCELLED"]);

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const registrationId =
    typeof body?.registrationId === "string" ? body.registrationId : "";
  const status = typeof body?.status === "string" ? body.status : "";

  if (!registrationId || !allowed.has(status)) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const { error } = await supabase
    .from("community_registrations")
    .update({
      status,
      attended_at: status === "ATTENDED" ? new Date().toISOString() : null,
    })
    .eq("id", registrationId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
