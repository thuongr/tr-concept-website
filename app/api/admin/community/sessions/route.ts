import { brisbaneDateTime, isHttpUrl } from "@/lib/validation";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

function clean(value: unknown, max = 1000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const access = await requireAdminApi();
  if (access.response) return access.response;
  const { supabase } = access;

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

  const parsedDate = brisbaneDateTime(startsAt);

  if (!parsedDate) {
    return NextResponse.json({ error: "Invalid date/time." }, { status: 400 });
  }

  if ((capacity !== null && (!Number.isInteger(capacity) || capacity < 1)) || (meetingUrl && !isHttpUrl(meetingUrl))) return NextResponse.json({error:"Enter a positive whole-number capacity and a valid meeting URL."},{status:400});

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
