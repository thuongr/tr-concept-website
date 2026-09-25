"use client";

import { FormEvent, useState } from "react";

export function AdminCommunityRegistrationForm({
  registrationId,
  status,
}: {
  registrationId: string;
  status: string;
}) {
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/community/registrations/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registrationId,
        status: String(form.get("status") || status),
      }),
    });

    setSaving(false);
    if (response.ok) window.location.reload();
    else alert("Could not update registration.");
  }

  return (
    <form className="inline-admin-form compact" onSubmit={submit}>
      <select name="status" defaultValue={status}>
        <option value="REGISTERED">Registered</option>
        <option value="ATTENDED">Attended</option>
        <option value="NO_SHOW">No show</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <button className="button button-small" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
