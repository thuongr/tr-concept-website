import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminSubmissionsPage() {
  const { supabase, setupRequired } = await requireAdmin();
  if (setupRequired || !supabase) return null;

  const { data } = await supabase
    .from("form_submissions")
    .select("id,form_type,source_page,status,created_at,contact_id")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <section className="admin-page">
      <div className="shell">
        <p className="eyebrow">Admin · People</p>
        <h1>Form submissions</h1>
        <div className="admin-table">
          {(data || []).map((row) => (
            <div className="admin-row" key={row.id}>
              <strong>{row.form_type}</strong>
              <span>{row.source_page || "—"}</span>
              <span>{row.status}</span>
              <span>{new Date(row.created_at).toLocaleString("en-AU")}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
