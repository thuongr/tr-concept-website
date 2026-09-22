import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminContactsPage() {
  const { supabase, setupRequired } = await requireAdmin();
  if (setupRequired || !supabase) return null;

  const { data } = await supabase
    .from("contacts")
    .select("id,name,email,business_name,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <section className="admin-page">
      <div className="shell">
        <p className="eyebrow">Admin · People</p>
        <h1>Contacts</h1>
        <div className="admin-table">
          {(data || []).map((row) => (
            <div className="admin-row" key={row.id}>
              <strong>{row.name}</strong>
              <span>{row.email}</span>
              <span>{row.business_name || "—"}</span>
              <span>{new Date(row.created_at).toLocaleDateString("en-AU")}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
