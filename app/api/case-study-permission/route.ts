import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email";

function clean(value: unknown, max = 1000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const name = clean(body?.name, 120);
  const email = clean(body?.email, 254).toLowerCase();
  const business = clean(body?.business, 200);
  const nameDisplay = clean(body?.nameDisplay, 30);
  const permissions =
    body?.permissions && typeof body.permissions === "object" ? body.permissions : {};
  const confirmation = body?.confirmation === true;

  if (!name || !email.includes("@") || !confirmation) {
    return NextResponse.json(
      { error: "Name, email and confirmation are required." },
      { status: 400 }
    );
  }

  if (!["FULL_NAME", "FIRST_NAME", "ANONYMOUS"].includes(nameDisplay)) {
    return NextResponse.json({ error: "Invalid name-display choice." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Permission recording is not configured yet." },
      { status: 503 }
    );
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
    return NextResponse.json({ error: "Could not save your details." }, { status: 500 });
  }

  const scope = {
    nameDisplay,
    testimonial: permissions.testimonial === true,
    photo: permissions.photo === true,
    businessName: permissions.businessName === true,
    businessLogo: permissions.businessLogo === true,
    website: permissions.website === true,
    social: permissions.social === true,
    teaching: permissions.teaching === true,
    advertising: permissions.advertising === true,
    videoAudio: permissions.videoAudio === true,
  };

  const consentTypes = [
    ["CASE_STUDY", scope.testimonial],
    ["TESTIMONIAL", scope.testimonial],
    ["PHOTO", scope.photo],
    ["BUSINESS_NAME", scope.businessName],
    ["BUSINESS_LOGO", scope.businessLogo],
    ["VIDEO_AUDIO", scope.videoAudio],
  ] as const;

  for (const [consentType, granted] of consentTypes) {
    if (!granted) continue;

    await supabase.from("consent_records").insert({
      contact_id: contact.id,
      consent_type: consentType,
      status: "GRANTED",
      scope_json: scope,
      consent_text_version: "case-study-v1",
      consent_text_snapshot:
        "Participant selected specific case-study/media permissions and confirmed the choices were theirs.",
      source: "WEBSITE_CASE_STUDY_PERMISSION",
      granted_at: new Date().toISOString(),
    });
  }

  const { data: submission } = await supabase
    .from("form_submissions")
    .insert({
      contact_id: contact.id,
      form_type: "CASE_STUDY_PERMISSION",
      source_page: "/case-study-permission",
      payload_json: { scope },
    })
    .select("id")
    .single();

  const mail = await sendTransactionalEmail({
    to: email,
    subject: "TRConcept — permission choices recorded",
    html: `<p>Hi ${name},</p><p>Your TRConcept case-study/media permission choices have been recorded.</p><p>If you want to ask about changing or withdrawing permission for future use, reply to this email or contact hello@trconcept.co.</p><p>Thương<br/>TRConcept</p>`,
  });

  await supabase.from("email_logs").insert({
    contact_id: contact.id,
    submission_id: submission?.id || null,
    email_type: "CASE_STUDY_PERMISSION_CONFIRMATION",
    recipient_email: email,
    provider: "RESEND",
    provider_message_id: mail.ok ? mail.id : null,
    status: mail.ok ? "SENT" : "FAILED",
    error_message: mail.ok ? null : mail.error,
    sent_at: mail.ok ? new Date().toISOString() : null,
  });

  return NextResponse.json({ ok: true, emailSent: mail.ok });
}
