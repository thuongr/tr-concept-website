"use client";

import { FormEvent, useState } from "react";

export function AdminCreateSessionForm() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/community/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(form.get("title") || ""),
        slug: String(form.get("slug") || ""),
        summary: String(form.get("summary") || ""),
        startsAt: String(form.get("startsAt") || ""),
        capacity: Number(form.get("capacity") || 0) || null,
        meetingUrl: String(form.get("meetingUrl") || ""),
        status: String(form.get("status") || "DRAFT"),
      }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setState("error");
      setMessage(body.error || "Could not create the session.");
      return;
    }

    setState("success");
    setMessage("Session created.");
    event.currentTarget.reset();
    window.location.reload();
  }

  return (
    <form className="form-card admin-create-form" onSubmit={submit}>
      <h2>Create a Community Session</h2>
      <div className="form-grid">
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Slug
          <input name="slug" placeholder="ai-community-september" required />
        </label>
        <label className="form-full">
          Summary
          <textarea name="summary" rows={3} />
        </label>
        <label>
          Date & time
          <input name="startsAt" type="datetime-local" required />
        </label>
        <label>
          Capacity
          <input name="capacity" type="number" min="1" />
        </label>
        <label className="form-full">
          Zoom link <span>(admin-only)</span>
          <input name="meetingUrl" type="url" />
        </label>
        <label>
          Status
          <select name="status" defaultValue="DRAFT">
            <option value="DRAFT">Draft</option>
            <option value="OPEN">Open</option>
          </select>
        </label>
      </div>

      <button className="button button-dark" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Creating…" : "Create session"} →
      </button>

      {message && (
        <p className={state === "error" ? "form-message error" : "form-message"}>
          {message}
        </p>
      )}
    </form>
  );
}
