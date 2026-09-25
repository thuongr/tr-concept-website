"use client";

import { FormEvent, useState } from "react";

export function AdminCaseStudyForm() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/case-studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: String(form.get("type") || "STUDENT"),
        title: String(form.get("title") || ""),
        slug: String(form.get("slug") || ""),
        subjectName: String(form.get("subjectName") || ""),
        businessName: String(form.get("businessName") || ""),
        challenge: String(form.get("challenge") || ""),
        diagnosis: String(form.get("diagnosis") || ""),
        approach: String(form.get("approach") || ""),
        outcome: String(form.get("outcome") || ""),
        quote: String(form.get("quote") || ""),
      }),
    });

    const body = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setMessage(body.error || "Could not create case study.");
      return;
    }

    event.currentTarget.reset();
    window.location.reload();
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h2>Create case-study draft</h2>

      <div className="form-grid">
        <label>
          Type
          <select name="type" defaultValue="STUDENT">
            <option value="STUDENT">Student</option>
            <option value="COMMUNITY">Community</option>
            <option value="CLIENT">Client</option>
          </select>
        </label>

        <label>
          Slug
          <input name="slug" placeholder="clearer-ai-work" required />
        </label>

        <label className="form-full">
          Title
          <input name="title" required />
        </label>

        <label>
          Person / subject <span>(optional)</span>
          <input name="subjectName" />
        </label>

        <label>
          Business / organisation <span>(optional)</span>
          <input name="businessName" />
        </label>

        <label className="form-full">
          Situation / challenge
          <textarea name="challenge" rows={4} />
        </label>

        <label className="form-full">
          Diagnosis
          <textarea name="diagnosis" rows={4} />
        </label>

        <label className="form-full">
          Approach
          <textarea name="approach" rows={4} />
        </label>

        <label className="form-full">
          Outcome
          <textarea name="outcome" rows={4} />
        </label>

        <label className="form-full">
          Quote <span>(only if permission exists)</span>
          <textarea name="quote" rows={3} />
        </label>
      </div>

      <button className="button button-dark" disabled={saving} type="submit">
        {saving ? "Creating…" : "Create draft"} →
      </button>

      {message && <p className="form-message error">{message}</p>}
    </form>
  );
}
