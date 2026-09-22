"use client";

import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [error, setError] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(form.get("email") || ""),
        password: String(form.get("password") || ""),
      }),
    });

    if (!response.ok) {
      setError("Login failed. Check your email and password.");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <section className="page-hero">
      <div className="shell narrow">
        <p className="eyebrow">TRConcept Admin</p>
        <h1>Sign in.</h1>

        <form className="form-card admin-login" onSubmit={login}>
          <label>
            Email
            <input type="email" name="email" required />
          </label>

          <label>
            Password
            <input type="password" name="password" required />
          </label>

          <button className="button button-dark" type="submit">
            Sign in →
          </button>

          {error && <p className="form-message error">{error}</p>}
        </form>
      </div>
    </section>
  );
}
