import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminSubmissionsPage() {
  const { supabase, setupRequired } = await requireAdmin();
  if (setupRequired || !supabase) return null;

  const { data } = await supabase
    .from("form_submissions")
    .select("id,form_type,source_page,status,created_at,contact_id,payload_json,contacts(name,email)")
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
              <span>{(row.contacts as unknown as {name?:string;email?:string})?.name}<br/>{(row.contacts as unknown as {email?:string})?.email}</span>
              <details><summary>View submitted details</summary><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{JSON.stringify(row.payload_json,null,2)}</pre></details>
              <span>{row.source_page || "—"}</span>
              <span>{row.status}</span>
              <span>{new Date(row.created_at).toLocaleString("en-AU", {timeZone:"Australia/Brisbane"})}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
