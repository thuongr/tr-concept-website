import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email";
import { escapeHtml, isValidEmail } from "@/lib/validation";

function clean(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const sessionId = clean(body?.sessionId, 100);
  const name = clean(body?.name, 120);
  const email = clean(body?.email, 254).toLowerCase();
  const business = clean(body?.business, 200);
  const marketingConsent = body?.marketingConsent === true;

  if (!sessionId || !name || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please complete the required fields." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Registration is not configured yet." },
      { status: 503 }
    );
  }

  const { data: session } = await supabase
    .from("community_sessions")
    .select("id,title,starts_at,status,capacity")
    .eq("id", sessionId)
    .single();

  if (!session || session.status !== "OPEN") {
    return NextResponse.json(
      { error: "This session is not currently open for registration." },
      { status: 409 }
    );
  }

  if (session.capacity) {
    const { count } = await supabase
      .from("community_registrations")
      .select("*", { count: "exact", head: true })
      .eq("community_session_id", sessionId)
      .eq("status", "REGISTERED");

    if ((count || 0) >= session.capacity) {
      return NextResponse.json(
        { error: "This session is currently full." },
        { status: 409 }
      );
    }
  }

  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .upsert(
      { name, email, business_name: business || null },
      { onConflict: "email" }
    )
    .select("id")
    .single();

  if (contactError || !contact) {
    return NextResponse.json(
      { error: "Could not save your registration." },
      { status: 500 }
    );
  }

  const { error: registrationError } = await supabase
    .from("community_registrations")
    .upsert(
      {
        community_session_id: sessionId,
        contact_id: contact.id,
        status: "REGISTERED",
        marketing_consent: marketingConsent,
      },
      { onConflict: "community_session_id,contact_id" }
    );

  if (registrationError) {
    return NextResponse.json(
      { error: "Could not save your registration." },
      { status: 500 }
    );
  }

  const { data: submission } = await supabase
    .from("form_submissions")
    .insert({
      contact_id: contact.id,
      form_type: "COMMUNITY_SESSION_REGISTRATION",
      source_page: "/community",
      payload_json: { sessionId, marketingConsent },
    })
    .select("id")
    .single();

  if (marketingConsent) {
    await supabase.from("consent_records").insert({
      contact_id: contact.id,
      consent_type: "MARKETING_EMAIL",
      status: "GRANTED",
      scope_json: { source: "community_session_registration", sessionId },
      consent_text_version: "community-v1",
      consent_text_snapshot:
        "Yes, I’d also like practical AI updates, future sessions and course information.",
      source: "WEBSITE",
      granted_at: new Date().toISOString(),
    });
  }

  const when = new Date(session.starts_at).toLocaleString("en-AU", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Australia/Brisbane",
  });

  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(session.title);
  const safeWhen = escapeHtml(when);

  const mail = await sendTransactionalEmail({
    to: email,
    subject: `TRConcept session confirmed — ${session.title.replace(/[\r\n]+/g, " ")}`,
    html: `<p>Hi ${safeName},</p><p>Your seat is reserved for <strong>${safeTitle}</strong>.</p><p>${safeWhen}</p><p>Zoom/session access details will be sent before the session.</p><p>Thương<br/>TRConcept</p>`,
  });

  await supabase.from("email_logs").insert({
    contact_id: contact.id,
    submission_id: submission?.id || null,
    email_type: "COMMUNITY_SESSION_CONFIRMATION",
    recipient_email: email,
    provider: "RESEND",
    provider_message_id: mail.ok ? mail.id : null,
    status: mail.ok ? "SENT" : "FAILED",
    error_message: mail.ok ? null : mail.error,
    sent_at: mail.ok ? new Date().toISOString() : null,
  });

  return NextResponse.json({ ok: true, emailSent: mail.ok });
}
