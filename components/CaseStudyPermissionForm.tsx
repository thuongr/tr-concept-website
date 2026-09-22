"use client";

import { FormEvent, useState } from "react";

export function CaseStudyPermissionForm() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/case-study-permission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        business: String(form.get("business") || ""),
        nameDisplay: String(form.get("nameDisplay") || "ANONYMOUS"),
        permissions: {
          testimonial: form.get("testimonial") === "on",
          photo: form.get("photo") === "on",
          businessName: form.get("businessName") === "on",
          businessLogo: form.get("businessLogo") === "on",
          website: form.get("website") === "on",
          social: form.get("social") === "on",
          teaching: form.get("teaching") === "on",
          advertising: form.get("advertising") === "on",
          videoAudio: form.get("videoAudio") === "on",
        },
        confirmation: form.get("confirmation") === "on",
      }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setState("error");
      setMessage(body.error || "Could not save your permission.");
      return;
    }

    setState("success");
    setMessage("Thank you — your permission choices have been recorded.");
    event.currentTarget.reset();
  }

  return (
    <form className="form-card permission-form" onSubmit={submit}>
      <div className="form-grid">
        <label>Name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label className="form-full">
          Business / organisation <span>(optional)</span>
          <input name="business" />
        </label>
        <label className="form-full">
          How may your name be shown?
          <select name="nameDisplay" defaultValue="FIRST_NAME">
            <option value="FULL_NAME">Full name</option>
            <option value="FIRST_NAME">First name only</option>
            <option value="ANONYMOUS">Anonymous</option>
          </select>
        </label>
      </div>

      <fieldset className="permission-grid">
        <legend>What may TRConcept use?</legend>
        <label><input type="checkbox" name="testimonial" /> Written testimonial / quote</label>
        <label><input type="checkbox" name="photo" /> My photo</label>
        <label><input type="checkbox" name="businessName" /> My business/organisation name</label>
        <label><input type="checkbox" name="businessLogo" /> Business logo</label>
        <label><input type="checkbox" name="videoAudio" /> Video or audio clips</label>
      </fieldset>

      <fieldset className="permission-grid">
        <legend>Where may approved material appear?</legend>
        <label><input type="checkbox" name="website" /> TRConcept website</label>
        <label><input type="checkbox" name="social" /> TRConcept social media</label>
        <label><input type="checkbox" name="teaching" /> Course / teaching materials</label>
        <label><input type="checkbox" name="advertising" /> Paid advertising</label>
      </fieldset>

      <label className="checkbox permission-confirm">
        <input type="checkbox" name="confirmation" required />
        <span>
          I confirm these choices are mine and I understand I can contact TRConcept to ask
          about changing or withdrawing permission for future use.
        </span>
      </label>

      <button className="button button-dark" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Saving…" : "Save permission choices"} →
      </button>

      {message && (
        <p className={state === "error" ? "form-message error" : "form-message"}>
          {message}
        </p>
      )}
    </form>
  );
}
