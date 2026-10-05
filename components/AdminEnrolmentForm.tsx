"use client";
import { formRequest } from "@/lib/form-request";

import { FormEvent, useState } from "react";

type CohortOption = {
  id: string;
  name: string;
};

export function AdminEnrolmentForm({
  enrolmentId,
  status,
  paymentStatus,
  cohortId,
  cohorts,
}: {
  enrolmentId: string;
  status: string;
  paymentStatus: string;
  cohortId: string | null;
  cohorts: CohortOption[];
}) {
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const response = await formRequest("/api/admin/enrolments/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enrolmentId,
        status: String(form.get("status") || status),
        paymentStatus: String(form.get("paymentStatus") || paymentStatus),
        cohortId: String(form.get("cohortId") || "") || null,
      }),
    });

    setSaving(false);

    if (response.ok) {
      window.location.reload();
    } else {
      const body = await response.json().catch(()=>({}));
      alert(body.error || "Could not update enrolment.");
    }
  }

  return (
    <form className="inline-admin-form" onSubmit={submit}>
      <select name="status" defaultValue={status}>
        <option value="NEW">New</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="WAITLIST">Waitlist</option>
        <option value="ASSIGNED">Assigned</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      <select name="paymentStatus" defaultValue={paymentStatus}>
        <option value="PENDING">Payment pending</option>
        <option value="PAID">Paid</option>
        <option value="PARTIAL">Partial</option>
        <option value="REFUNDED">Refunded</option>
        <option value="NOT_REQUIRED">Not required</option>
      </select>

      <select name="cohortId" defaultValue={cohortId || ""}>
        <option value="">No cohort</option>
        {cohorts.map((cohort) => (
          <option key={cohort.id} value={cohort.id}>
            {cohort.name}
          </option>
        ))}
      </select>

      <button className="button button-small" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
