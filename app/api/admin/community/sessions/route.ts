import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function clean(value: unknown, max = 1000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const title = clean(body?.title, 160);
  const slug = clean(body?.slug, 160)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const summary = clean(body?.summary, 1000);
  const startsAt = clean(body?.startsAt, 60);
  const meetingUrl = clean(body?.meetingUrl, 1000);
  const status = body?.status === "OPEN" ? "OPEN" : "DRAFT";
  const capacity = Number.isFinite(body?.capacity) ? Number(body.capacity) : null;

  if (!title || !slug || !startsAt) {
    return NextResponse.json(
      { error: "Title, slug and date/time are required." },
      { status: 400 }
    );
  }

  const parsedDate = new Date(startsAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Invalid date/time." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("community_sessions")
    .insert({
      title,
      slug,
      summary: summary || null,
      starts_at: parsedDate.toISOString(),
      timezone: "Australia/Brisbane",
      capacity,
      meeting_url: meetingUrl || null,
      status,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
