"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { formRequest } from "@/lib/form-request";

type Contact = { id: string; relationship_status: string; next_action: string | null; follow_up_on: string | null; updated_at: string };
export function AdminContactForm({ contact, marketingAllowed }: { contact: Contact; marketingAllowed: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false), [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await formRequest("/api/admin/contacts/update", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: contact.id, expectedUpdatedAt: contact.updated_at,
        relationshipStatus: form.get("relationshipStatus"), nextAction: form.get("nextAction"), followUpOn: form.get("followUpOn") }),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(false); setMessage(response.ok ? "Follow-up saved." : body.error || "Could not save.");
    if (response.ok) router.refresh();
  }
  async function withdraw(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await formRequest("/api/admin/consents/withdraw", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: contact.id, reason: form.get("reason") }),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(false); setMessage(response.ok ? "Marketing consent withdrawn. History retained." : body.error || "Could not save withdrawal.");
    if (response.ok) router.refresh();
  }
  return <div className="admin-person-actions">
    <form className="form-card" onSubmit={submit}>
      <h2>Next conversation</h2>
      <div className="form-grid">
        <label>Relationship status<select name="relationshipStatus" defaultValue={contact.relationship_status}>
          <option value="NEW">New contact</option><option value="ENGAGED">Engaged</option>
          <option value="INTERESTED">Interested in learning</option><option value="FOLLOW_UP">Follow-up needed</option><option value="NOT_NOW">Not now</option>
        </select></label>
        <label>Follow-up date (Brisbane)<input type="date" name="followUpOn" defaultValue={contact.follow_up_on || ""} /></label>
        <label className="form-full">Next action<textarea name="nextAction" maxLength={1000} defaultValue={contact.next_action || ""} rows={3} /></label>
      </div>
      <p className="form-note">Internal planning only. Saving does not send a message or grant marketing permission.</p>
      <button className="button button-small" disabled={saving}>Save follow-up</button>
    </form>
    {marketingAllowed && <form className="form-card" onSubmit={withdraw}>
      <h2>Marketing permission</h2><p>Record a person's request to stop marketing messages.</p>
      <label>Withdrawal evidence / reason<input name="reason" required maxLength={500} placeholder="e.g. Requested by email on 5 October" /></label>
      <button className="button button-small" disabled={saving}>Record withdrawal</button>
    </form>}
    <p role="status">{saving ? "Saving…" : message}</p>
  </div>;
}
