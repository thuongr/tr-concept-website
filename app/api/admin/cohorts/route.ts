import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function clean(value: unknown, max = 1000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => null);

  const courseId = clean(body?.courseId, 100);
  const name = clean(body?.name, 120);
  const groupType = clean(body?.groupType, 30);
  const groupLink = clean(body?.groupLink, 1000);
  const notes = clean(body?.notes, 3000);
  const capacity = Math.max(1, Number(body?.capacity) || 5);

  if (!courseId || !name) {
    return NextResponse.json({ error: "Course and cohort name are required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("cohorts")
    .insert({
      course_id: courseId,
      name,
      status: "FORMING",
      capacity,
      internal_group_type: groupType || null,
      internal_group_link: groupLink || null,
      internal_notes: notes || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
