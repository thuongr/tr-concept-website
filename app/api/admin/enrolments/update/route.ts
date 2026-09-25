import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedStatuses = new Set([
  "NEW",
  "CONFIRMED",
  "WAITLIST",
  "ASSIGNED",
  "COMPLETED",
  "CANCELLED",
]);

const allowedPaymentStatuses = new Set([
  "NOT_REQUIRED",
  "PENDING",
  "PAID",
  "REFUNDED",
  "PARTIAL",
]);

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => null);

  const enrolmentId = typeof body?.enrolmentId === "string" ? body.enrolmentId : "";
  const status = typeof body?.status === "string" ? body.status : "";
  const paymentStatus =
    typeof body?.paymentStatus === "string" ? body.paymentStatus : "";
  const cohortId =
    typeof body?.cohortId === "string" && body.cohortId ? body.cohortId : null;

  if (
    !enrolmentId ||
    !allowedStatuses.has(status) ||
    !allowedPaymentStatuses.has(paymentStatus)
  ) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const { data: enrolment } = await supabase
    .from("enrolments")
    .select("course_id")
    .eq("id", enrolmentId)
    .single();

  if (!enrolment) {
    return NextResponse.json({ error: "Enrolment not found." }, { status: 404 });
  }

  if (cohortId) {
    const { data: cohort } = await supabase
      .from("cohorts")
      .select("course_id")
      .eq("id", cohortId)
      .single();

    if (!cohort || cohort.course_id !== enrolment.course_id) {
      return NextResponse.json(
        { error: "The selected cohort belongs to a different course." },
        { status: 400 }
      );
    }
  }

  const { error } = await supabase
    .from("enrolments")
    .update({
      status: cohortId && status === "NEW" ? "ASSIGNED" : status,
      payment_status: paymentStatus,
      cohort_id: cohortId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", enrolmentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
