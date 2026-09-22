import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminConsentsPage() {
  const { supabase, setupRequired } = await requireAdmin();
  if (setupRequired || !supabase) return null;

  const { data } = await supabase
    .from("consent_records")
    .select("id,consent_type,status,source,granted_at,withdrawn_at,contact_id")
    .order("granted_at", { ascending: false })
    .limit(100);

  return (
    <section className="admin-page">
      <div className="shell">
        <p className="eyebrow">Admin · Compliance</p>
        <h1>Consents</h1>
        <div className="admin-table">
          {(data || []).map((row) => (
            <div className="admin-row" key={row.id}>
              <strong>{row.consent_type}</strong>
              <span>{row.status}</span>
              <span>{row.source}</span>
              <span>{row.granted_at ? new Date(row.granted_at).toLocaleString("en-AU") : "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
