"use client";

import { FormEvent, useState } from "react";

export function CommunityRegistrationForm({
  sessionId,
  sessionTitle,
}: {
  sessionId: string;
  sessionTitle: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/community/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        business: String(form.get("business") || ""),
        marketingConsent: form.get("marketingConsent") === "on",
      }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setState("error");
      setMessage(body.error || "Something went wrong. Please try again.");
      return;
    }

    setState("success");
    setMessage(`Seat reserved for “${sessionTitle}”. Check your email for confirmation.`);
    event.currentTarget.reset();
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="form-grid">
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label className="form-full">
          Business / role <span>(optional)</span>
          <input name="business" />
        </label>
      </div>

      <label className="checkbox">
        <input type="checkbox" name="marketingConsent" />
        <span>
          Yes, I’d also like practical AI updates, future sessions and course information.
        </span>
      </label>

      <p className="form-note">
        Registration messages are separate from optional marketing updates.
      </p>

      <button
        className="button button-yellow"
        type="submit"
        disabled={state === "sending"}
      >
        {state === "sending" ? "Reserving…" : "Reserve a seat"} →
      </button>

      {message && (
        <p className={state === "error" ? "form-message error" : "form-message"}>
          {message}
        </p>
      )}
    </form>
  );
}
