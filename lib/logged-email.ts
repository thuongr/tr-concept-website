import type { SupabaseClient } from "@supabase/supabase-js";
import { emailProvider, sendTransactionalEmail } from "@/lib/email";

/** Business writes precede this call. Never send without a durable attempt record. */
export async function sendLoggedEmail(db: SupabaseClient, input: {
  contactId: string; submissionId: string; emailType: string;
  to: string; subject: string; html: string; replyTo?: string;
}) {
  const { data: log, error } = await db.from("email_logs").insert({
    contact_id: input.contactId, submission_id: input.submissionId,
    email_type: input.emailType, recipient_email: input.to,
    provider: emailProvider(), status: "QUEUED",
  }).select("id").single();
  if (error || !log) {
    console.error("Email attempt could not be recorded", { submissionId: input.submissionId, emailType: input.emailType, code: error?.code });
    return { ok: false };
  }
  const mail = await sendTransactionalEmail(input);
  const { error: updateError } = await db.from("email_logs").update({
    provider: mail.provider, provider_message_id: mail.ok ? mail.id : null,
    status: mail.ok ? "SENT" : "FAILED", error_message: mail.ok ? null : mail.error,
    sent_at: mail.ok ? new Date().toISOString() : null,
  }).eq("id", log.id);
  if (updateError) console.error("Email result could not be recorded; check provider before retry", { emailLogId: log.id, code: updateError.code });
  return { ok: mail.ok };
}
