import { Resend } from "resend";

type EmailInput = { to: string; subject: string; html: string; replyTo?: string };
export function emailProvider() {
  return (process.env.EMAIL_PROVIDER || "resend").trim().toUpperCase();
}

function mailbox(value: string) {
  const match = value.match(/^\s*([^<>]+)\s*<([^<>]+)>\s*$/);
  return match ? { name: match[1].trim(), email: match[2].trim() } : { email: value.trim() };
}

// Server-side transport only. Sending a receipt does not subscribe a contact to marketing.
// Never auto-fallback/retry a failed send: a timeout can mean the provider accepted it.
export async function sendTransactionalEmail(input: EmailInput) {
  const provider = emailProvider();
  const from = process.env.EMAIL_FROM || "TRConcept <hello@trconcept.co>";
  const replyTo = input.replyTo || process.env.EMAIL_REPLY_TO || "hello@trconcept.co";
  try {
    if (provider === "BREVO") {
      const key = process.env.BREVO_API_KEY;
      if (!key) return { ok: false as const, provider, error: "BREVO_API_KEY is not configured." };
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": key, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ sender: mailbox(from), replyTo: mailbox(replyTo), to: [{ email: input.to }], subject: input.subject, htmlContent: input.html }),
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) return { ok: false as const, provider, error: `Brevo rejected email (HTTP ${response.status}). Check provider logs.` };
      if (typeof data?.messageId !== "string" || !data.messageId) return { ok: false as const, provider, error: "Brevo acceptance could not be confirmed. Check provider logs before retrying." };
      return { ok: true as const, provider, id: data.messageId };
    }
    if (provider !== "RESEND") return { ok: false as const, provider, error: "Unsupported EMAIL_PROVIDER." };
    const key = process.env.RESEND_API_KEY;
    if (!key) return { ok: false as const, provider, error: "RESEND_API_KEY is not configured." };
    const result = await new Resend(key).emails.send({ from, replyTo, to: input.to, subject: input.subject, html: input.html });
    if (result.error) return { ok: false as const, provider, error: "Resend rejected email. Check provider logs." };
    return { ok: true as const, provider, id: result.data?.id || null };
  } catch {
    return { ok: false as const, provider, error: "Email acceptance could not be confirmed. Check provider logs before retrying." };
  }
}
