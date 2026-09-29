"use client";

import { FormEvent, useState } from "react";

export function CourseRegistrationForm({ courseSlug }: { courseSlug: string }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      courseSlug,
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      country: String(form.get("country") || ""),
      stateRegion: String(form.get("stateRegion") || ""),
      business: String(form.get("business") || ""),
      marketingConsent: form.get("marketingConsent") === "on",
    };

    const response = await fetch("/api/course/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setState("error");
      setMessage(body.error || "Something went wrong. Please try again.");
      return;
    }

    setState("success");
    setMessage(body.status === "WAITLIST"
      ? "You’re on the waitlist. Check your email for confirmation."
      : "Your registration has been received. Check your email for confirmation.");
    event.currentTarget.reset();
  }

  return (
    <form className="form-card course-registration-form" onSubmit={submit}>
      <div className="form-intro">
        <span className="micro-label">Your details</span>
        <strong>Tell us where you’re joining from.</strong>
        <p>We use this to organise small cohorts and contact you about your class.</p>
      </div>

      <div className="form-grid">
        <label>
          Name
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" autoComplete="tel" placeholder="+61 / +84" required />
        </label>
        <label>
          Country
          <select name="country" autoComplete="country-name" required defaultValue="">
            <option value="" disabled>Select country</option>
            <option value="Australia">Australia</option>
            <option value="Vietnam">Vietnam</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label className="form-full">
          State / province / city
          <input name="stateRegion" autoComplete="address-level1" placeholder="e.g. Queensland, HCMC, Hanoi" required />
        </label>
        <label className="form-full">
          Business / role <span>(optional)</span>
          <input name="business" autoComplete="organization" />
        </label>
      </div>

      <label className="checkbox">
        <input type="checkbox" name="marketingConsent" />
        <span>I’d also like practical AI updates, community sessions and course information.</span>
      </label>
      <p className="form-note">Marketing consent is optional and separate from your course registration.</p>

      <button className="button button-dark" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Register your interest"} →
      </button>

      {message && <p className={state === "error" ? "form-message error" : "form-message"}>{message}</p>}
    </form>
  );
}
