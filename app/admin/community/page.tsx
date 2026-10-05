import { AdminCreateSessionForm } from "@/components/AdminCreateSessionForm";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminCommunityPage() {
  const { supabase, setupRequired } = await requireAdmin();

  if (setupRequired || !supabase) return null;

  const { data: sessions } = await supabase
    .from("community_sessions")
    .select("id,record_code,title,starts_at,status,capacity")
    .order("starts_at", { ascending: false })
    .limit(30);

  return (
    <section className="admin-page">
      <div className="shell admin-two-column">
        <div>
          <p className="eyebrow">Admin · Community</p>
          <h1>Sessions</h1>
          <p><a className="text-link" href="/admin/community/registrations">Manage registrations & attendance →</a></p>

          <div className="admin-table">
            {(sessions || []).map((session) => (
              <div className="admin-row" key={session.id}>
                <div><strong>{session.title}</strong><p className="record-code">{session.record_code}</p></div>
                <span>{session.status}</span>
                <span>{new Date(session.starts_at).toLocaleString("en-AU", {timeZone:"Australia/Brisbane"})}</span>
                <span>Cap {session.capacity || "—"}</span>
              </div>
            ))}

            {(sessions || []).length === 0 && (
              <div className="empty-state">No community sessions yet.</div>
            )}
          </div>
        </div>

        <AdminCreateSessionForm />
      </div>
    </section>
  );
}
