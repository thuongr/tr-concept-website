import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email";

function clean(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const courseSlug = clean(body?.courseSlug, 100);
  const name = clean(body?.name, 120);
  const email = clean(body?.email, 254).toLowerCase();
  const business = clean(body?.business, 200);
  const marketingConsent = body?.marketingConsent === true;

  if (!courseSlug || !name || !email.includes("@")) {
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

  const { data: offer } = await supabase
    .from("offers")
    .select("id,name,price_amount")
    .eq("slug", courseSlug)
    .eq("status", "ACTIVE")
    .single();

  if (!offer) {
    return NextResponse.json(
      { error: "This course is not currently available." },
      { status: 409 }
    );
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id,registration_status")
    .eq("offer_id", offer.id)
    .single();

  if (!course || !["OPEN", "WAITLIST"].includes(course.registration_status)) {
    return NextResponse.json(
      { error: "This course is not currently accepting registrations." },
      { status: 409 }
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
    return NextResponse.json(
      { error: "Could not save your registration." },
      { status: 500 }
    );
  }

  const enrolmentStatus =
    course.registration_status === "WAITLIST" ? "WAITLIST" : "NEW";

  const { error: enrolmentError } = await supabase
    .from("enrolments")
    .upsert(
      {
        contact_id: contact.id,
        course_id: course.id,
        status: enrolmentStatus,
        payment_status: "PENDING",
        amount: offer.price_amount,
      },
      { onConflict: "contact_id,course_id" }
    );

  if (enrolmentError) {
    return NextResponse.json(
      { error: "Could not save your registration." },
      { status: 500 }
    );
  }

  const { data: submission } = await supabase
    .from("form_submissions")
    .insert({
      contact_id: contact.id,
      form_type:
        courseSlug === "ai-for-real-work"
          ? "LEVEL_1_REGISTRATION"
          : "LEVEL_2_REGISTRATION",
      source_page:
        courseSlug === "ai-for-real-work"
          ? "/learn/level-1"
          : "/learn/level-2",
      payload_json: { courseSlug, marketingConsent },
    })
    .select("id")
    .single();

  if (marketingConsent) {
    await supabase.from("consent_records").insert({
      contact_id: contact.id,
      consent_type: "MARKETING_EMAIL",
      status: "GRANTED",
      scope_json: { source: "course_registration", courseSlug },
      consent_text_version: "course-v1",
      consent_text_snapshot:
        "I’d also like practical AI updates, community sessions and course information.",
      source: "WEBSITE",
      granted_at: new Date().toISOString(),
    });
  }

  const mail = await sendTransactionalEmail({
    to: email,
    subject: `TRConcept — registration received for ${offer.name}`,
    html: `<p>Hi ${name},</p><p>We’ve received your registration for <strong>${offer.name}</strong>.</p><p>TRConcept classes are intentionally small. Cohort and session details are arranged directly once your place is confirmed.</p><p>Thương<br/>TRConcept</p>`,
  });

  await supabase.from("email_logs").insert({
    contact_id: contact.id,
    submission_id: submission?.id || null,
    email_type: "COURSE_REGISTRATION_ACKNOWLEDGEMENT",
    recipient_email: email,
    provider: "RESEND",
    provider_message_id: mail.ok ? mail.id : null,
    status: mail.ok ? "SENT" : "FAILED",
    error_message: mail.ok ? null : mail.error,
    sent_at: mail.ok ? new Date().toISOString() : null,
  });

  return NextResponse.json({
    ok: true,
    status: enrolmentStatus,
    emailSent: mail.ok,
  });
}
