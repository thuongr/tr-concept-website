"use client";

import { FormEvent, useState } from "react";

export function AdminCaseStudyStatusForm({
  id,
  permissionStatus,
  status,
}: {
  id: string;
  permissionStatus: string;
  status: string;
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/case-studies/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        permissionStatus: String(form.get("permissionStatus") || permissionStatus),
        status: String(form.get("status") || status),
      }),
    });

    const body = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setMessage(body.error || "Could not update case study.");
      return;
    }

    window.location.reload();
  }

  return (
    <form className="inline-admin-form compact" onSubmit={submit}>
      <select name="permissionStatus" defaultValue={permissionStatus}>
        <option value="NOT_REQUESTED">Permission not requested</option>
        <option value="REQUESTED">Permission requested</option>
        <option value="APPROVED">Permission approved</option>
        <option value="WITHDRAWN">Permission withdrawn</option>
      </select>

      <select name="status" defaultValue={status}>
        <option value="DRAFT">Draft</option>
        <option value="REVIEW">Review</option>
        <option value="PUBLISHED">Published</option>
        <option value="ARCHIVED">Archived</option>
      </select>

      <button className="button button-small" disabled={saving} type="submit">
        {saving ? "Saving…" : "Save"}
      </button>

      {message && <span className="form-message error">{message}</span>}
    </form>
  );
}
