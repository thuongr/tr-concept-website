"use client";
import { formRequest } from "@/lib/form-request";

import { FormEvent, useState } from "react";

export function AdminContentSettingsForm({
  heroHeading,
  heroBody,
  heroCtaLabel,
  heroCtaUrl,
  footerBrandLine,
}: {
  heroHeading: string;
  heroBody: string;
  heroCtaLabel: string;
  heroCtaUrl: string;
  footerBrandLine: string;
}) {
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const response = await formRequest("/api/admin/content/home", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heroHeading: String(form.get("heroHeading") || ""),
        heroBody: String(form.get("heroBody") || ""),
        heroCtaLabel: String(form.get("heroCtaLabel") || ""),
        heroCtaUrl: String(form.get("heroCtaUrl") || ""),
        footerBrandLine: String(form.get("footerBrandLine") || ""),
      }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setState("error");
      setMessage(body.error || "Could not save content.");
      return;
    }

    setState("success");
    setMessage("Saved. The public website will use these values.");
  }

  return (
    <form className="form-card admin-content-form" onSubmit={submit}>
      <div className="form-grid">
        <label className="form-full">
          Homepage hero heading
          <textarea name="heroHeading" defaultValue={heroHeading} maxLength={120} rows={2} required />
          <small>Use a new line for the gold emphasis. Keep the heading concise.</small>
        </label>

        <label className="form-full">
          Homepage hero body
          <textarea name="heroBody" rows={5} defaultValue={heroBody} required />
        </label>

        <label>
          Hero CTA label
          <input name="heroCtaLabel" defaultValue={heroCtaLabel} required />
        </label>

        <label>
          Hero CTA URL
          <input name="heroCtaUrl" defaultValue={heroCtaUrl} required />
        </label>

        <p className="form-full">The approved growth-tree artwork and its motion are managed in the design system.</p>

        <label className="form-full">
          Footer brand line
          <input name="footerBrandLine" defaultValue={footerBrandLine} required />
        </label>
      </div>

      <button className="button button-dark" disabled={state === "saving"} type="submit">
        {state === "saving" ? "Saving…" : "Save content"} →
      </button>

      {message && (
        <p className={state === "error" ? "form-message error" : "form-message"}>
          {message}
        </p>
      )}
    </form>
  );
}
