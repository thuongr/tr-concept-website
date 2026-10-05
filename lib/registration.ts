import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email";
import { escapeHtml, isValidEmail } from "@/lib/validation";
import { sanitizeAttribution } from "@/lib/attribution";

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function registerParticipation(request: Request, kind: "COURSE" | "COMMUNITY") {
  const body = await request.json().catch(() => null);
  const name = clean(body?.name, 120), email = clean(body?.email, 254).toLowerCase();
  const target = clean(kind === "COURSE" ? body?.courseSlug : body?.sessionId, 100);
  const details = {
    phone: clean(body?.phone, 40), country: clean(body?.country, 80),
    stateRegion: clean(body?.stateRegion, 120), business: clean(body?.business, 200),
  };
  if (!target || !name || !isValidEmail(email) ||
    (kind === "COURSE" && (!details.phone || !details.country || !details.stateRegion))) {
    return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });
  }
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Registration is not configured yet." }, { status: 503 });

  const { data, error } = await supabase.rpc("register_participation_v1", {
    p_kind: kind, p_target: target, p_name: name, p_email: email, p_details: details,
    p_marketing: body?.marketingConsent === true, p_attribution: sanitizeAttribution(body?.attribution),
  });
  if (error || !data) {
    const unavailable = error?.code === "23514";
    const invalid = ["22023", "22P02"].includes(error?.code || "");
    return NextResponse.json({ error: unavailable ? "This course or session is not currently available. Please contact hello@trconcept.co."
      : invalid ? "Please check your registration details." : "Could not save your registration. Please try again." },
    { status: unavailable ? 409 : invalid ? 400 : 500 });
  }
  if (data.already_registered) return NextResponse.json({ ok: true, alreadyRegistered: true });

  // The QUEUED log is committed with the registration. A crash remains visible to admin.
  const title = String(data.title), safeTitle = escapeHtml(title);
  const when = kind === "COMMUNITY" ? new Date(data.starts_at).toLocaleString("en-AU", {
    dateStyle: "full", timeStyle: "short", timeZone: "Australia/Brisbane",
  }) : "";
  const mail = await sendTransactionalEmail({
    to: email,
    subject: kind === "COURSE" ? `TRConcept — registration received for ${title.replace(/[\r\n]+/g, " ")}`
      : `TRConcept session confirmed — ${title.replace(/[\r\n]+/g, " ")}`,
    html: `<p>Hi ${escapeHtml(name)},</p>` + (kind === "COURSE"
      ? `<p>We’ve received your registration for <strong>${safeTitle}</strong>.</p><p>TRConcept classes are intentionally small. Cohort and session details are arranged directly once your place is confirmed.</p>`
      : `<p>Your seat is reserved for <strong>${safeTitle}</strong>.</p><p>${escapeHtml(when)}</p><p>Zoom/session access details will be sent before the session.</p>`)
      + `<p>Thương<br/>TRConcept</p>`,
  });
  const { error: logError } = await supabase.from("email_logs").update({
    provider_message_id: mail.ok ? mail.id : null, status: mail.ok ? "SENT" : "FAILED",
    error_message: mail.ok ? null : mail.error, sent_at: mail.ok ? new Date().toISOString() : null,
  }).eq("id", data.email_log_id);
  if (logError) console.error("Registration email log update failed", { code: logError.code });
  return NextResponse.json({ ok: true, status: data.status, emailSent: mail.ok });
}
