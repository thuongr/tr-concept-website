import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const { data: allowed, error: accessError } = await supabase.rpc("is_admin");
  if (accessError || allowed !== true) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Admin access could not be verified for this account." }, { status: accessError ? 503 : 403 });
  }

  return NextResponse.json({ ok: true });
}
