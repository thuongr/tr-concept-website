import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminConsentsPage() {
  const { supabase, setupRequired } = await requireAdmin();
  if (setupRequired || !supabase) return null;

  const { data } = await supabase
    .from("consent_records")
    .select("id,consent_type,status,source,granted_at,withdrawn_at,contact_id,scope_json,contacts(name,email)")
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
              <span>{row.status}<br/>{(row.contacts as unknown as {email?:string})?.email}</span>
              <details><summary>Permission scope</summary><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{JSON.stringify(row.scope_json,null,2)}</pre></details>
              <span>{row.source}</span>
              <span>{row.granted_at ? new Date(row.granted_at).toLocaleString("en-AU", {timeZone:"Australia/Brisbane"}) : "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
