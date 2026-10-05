import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { isUuid } from "@/lib/validation";
const statuses = new Set(["NEW", "ENGAGED", "INTERESTED", "FOLLOW_UP", "NOT_NOW"]);
export async function POST(request: Request) {
  const access = await requireAdminApi();
  if (access.response) return access.response;
  const body = await request.json().catch(() => null);
  const followUpOn = typeof body?.followUpOn === "string" && body.followUpOn ? body.followUpOn : null;
  if (!isUuid(body?.contactId) || !statuses.has(body?.relationshipStatus) || typeof body?.expectedUpdatedAt !== "string" ||
    typeof body?.nextAction !== "string" || body.nextAction.length > 1000 ||
    (followUpOn && (!/^\d{4}-\d{2}-\d{2}$/.test(followUpOn) || !Number.isFinite(Date.parse(followUpOn)) || new Date(followUpOn).toISOString().slice(0,10) !== followUpOn))) {
    return NextResponse.json({ error: "Invalid follow-up details." }, { status: 400 });
  }
  const { data, error } = await access.supabase.from("contacts").update({
    relationship_status: body.relationshipStatus, next_action: body.nextAction.trim() || null,
    follow_up_on: followUpOn, updated_at: new Date().toISOString(),
  }).eq("id", body.contactId).eq("updated_at", body.expectedUpdatedAt).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "Could not save follow-up." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "This record changed or no longer exists. Refresh before saving." }, { status: 409 });
  return NextResponse.json({ ok: true });
}
