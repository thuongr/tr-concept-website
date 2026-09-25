import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminEmailLogsPage() {
  const { supabase, setupRequired } = await requireAdmin();
  if (setupRequired || !supabase) return null;

  const { data } = await supabase
    .from("email_logs")
    .select("id,email_type,recipient_email,status,error_message,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <section className="admin-page">
      <div className="shell">
        <p className="eyebrow">Admin · Communication</p>
        <h1>Email logs</h1>
        <div className="admin-table">
          {(data || []).map((row) => (
            <div className="admin-row" key={row.id}>
              <strong>{row.email_type}</strong>
              <span>{row.recipient_email}</span>
              <span>{row.status}</span>
              <span>{row.error_message || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
