"use client";

import { FormEvent, useState } from "react";

export function AdminContentSettingsForm({
  heroHeading,
  heroBody,
  heroCtaLabel,
  heroCtaUrl,
  footerBrandLine,
  heroImageUrl,
}: {
  heroHeading: string;
  heroBody: string;
  heroCtaLabel: string;
  heroCtaUrl: string;
  footerBrandLine: string;
  heroImageUrl: string;
}) {
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/content/home", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heroHeading: String(form.get("heroHeading") || ""),
        heroBody: String(form.get("heroBody") || ""),
        heroCtaLabel: String(form.get("heroCtaLabel") || ""),
        heroCtaUrl: String(form.get("heroCtaUrl") || ""),
        footerBrandLine: String(form.get("footerBrandLine") || ""),
        heroImageUrl: String(form.get("heroImageUrl") || ""),
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
          <input name="heroHeading" defaultValue={heroHeading} required />
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

        <label className="form-full">
          Founder hero image URL
          <input
            name="heroImageUrl"
            type="url"
            defaultValue={heroImageUrl}
            placeholder="https://..."
          />
        </label>

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
