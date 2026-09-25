import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function clean(value: unknown, max = 5000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => null);

  const type = ["STUDENT", "COMMUNITY", "CLIENT"].includes(body?.type)
    ? body.type
    : "STUDENT";
  const title = clean(body?.title, 240);
  const slug = clean(body?.slug, 180)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!title || !slug) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("case_studies")
    .insert({
      type,
      title,
      slug,
      subject_name: clean(body?.subjectName, 200) || null,
      business_name: clean(body?.businessName, 200) || null,
      challenge: clean(body?.challenge) || null,
      diagnosis: clean(body?.diagnosis) || null,
      approach: clean(body?.approach) || null,
      outcome: clean(body?.outcome) || null,
      quote: clean(body?.quote, 2000) || null,
      permission_status: "NOT_REQUESTED",
      status: "DRAFT",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, id: data.id });
}
