import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { isUuid } from "@/lib/validation";
export async function POST(request: Request) {
  const access = await requireAdminApi();
  if (access.response) return access.response;
  const body = await request.json().catch(() => null);
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  if (!isUuid(body?.contactId) || !reason || reason.length > 500) return NextResponse.json({ error: "Contact and withdrawal evidence are required." }, { status: 400 });
  const { error } = await access.supabase.from("consent_records").insert({
    contact_id: body.contactId, consent_type: "MARKETING_EMAIL", status: "WITHDRAWN",
    consent_text_version: "admin-withdrawal-v1", consent_text_snapshot: reason,
    scope_json: { recorded_by: access.user.id }, source: "ADMIN", withdrawn_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: "Could not record withdrawal." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
