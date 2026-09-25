"use client";

import { FormEvent, useState } from "react";

type CourseOption = {
  id: string;
  name: string;
};

export function AdminCreateCohortForm({ courses }: { courses: CourseOption[] }) {
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/cohorts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: String(form.get("courseId") || ""),
        name: String(form.get("name") || ""),
        capacity: Number(form.get("capacity") || 5),
        groupType: String(form.get("groupType") || ""),
        groupLink: String(form.get("groupLink") || ""),
        notes: String(form.get("notes") || ""),
      }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setState("error");
      setMessage(body.error || "Could not create cohort.");
      return;
    }

    event.currentTarget.reset();
    window.location.reload();
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h2>Create cohort</h2>

      <div className="form-grid">
        <label>
          Course
          <select name="courseId" required>
            <option value="">Select course</option>
            {courses.map((course) => (
              <option value={course.id} key={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Cohort name
          <input name="name" placeholder="L1-OCT-A" required />
        </label>

        <label>
          Capacity
          <input name="capacity" type="number" min="1" defaultValue="5" required />
        </label>

        <label>
          Group type
          <select name="groupType" defaultValue="">
            <option value="">Not set</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="ZALO">Zalo</option>
            <option value="OTHER">Other</option>
          </select>
        </label>

        <label className="form-full">
          Group link <span>(optional)</span>
          <input name="groupLink" type="url" />
        </label>

        <label className="form-full">
          Internal notes
          <textarea name="notes" rows={3} />
        </label>
      </div>

      <button className="button button-dark" type="submit" disabled={state === "saving"}>
        {state === "saving" ? "Creating…" : "Create cohort"} →
      </button>

      {message && <p className="form-message error">{message}</p>}
    </form>
  );
}
