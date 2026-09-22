import { AdminCommunityRegistrationForm } from "@/components/AdminCommunityRegistrationForm";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminCommunityRegistrationsPage() {
  const { supabase, setupRequired } = await requireAdmin();
  if (setupRequired || !supabase) return null;

  const { data: registrations } = await supabase
    .from("community_registrations")
    .select("id,community_session_id,contact_id,status,marketing_consent,registered_at")
    .order("registered_at", { ascending: false })
    .limit(150);

  const sessionIds = [...new Set((registrations || []).map((row) => row.community_session_id))];
  const contactIds = [...new Set((registrations || []).map((row) => row.contact_id))];

  const [{ data: sessions }, { data: contacts }] = await Promise.all([
    sessionIds.length
      ? supabase.from("community_sessions").select("id,title").in("id", sessionIds)
      : Promise.resolve({ data: [] }),
    contactIds.length
      ? supabase.from("contacts").select("id,name,email").in("id", contactIds)
      : Promise.resolve({ data: [] }),
  ]);

  const sessionMap = new Map((sessions || []).map((row) => [row.id, row.title]));
  const contactMap = new Map((contacts || []).map((row) => [row.id, row]));

  return (
    <section className="admin-page">
      <div className="shell">
        <p className="eyebrow">Admin · Community</p>
        <h1>Registrations</h1>
        <p className="page-lead">
          Attendance stays human-managed. Tick what actually happened after the session.
        </p>

        <div className="admin-enrolment-list">
          {(registrations || []).map((row) => {
            const contact = contactMap.get(row.contact_id);
            return (
              <article className="admin-enrolment-card" key={row.id}>
                <div>
                  <strong>{contact?.name || contact?.email || "Unknown contact"}</strong>
                  <p>{contact?.email}</p>
                  <p>{sessionMap.get(row.community_session_id) || "Community session"}</p>
                  <p>Marketing consent: {row.marketing_consent ? "Yes" : "No"}</p>
                </div>

                <AdminCommunityRegistrationForm
                  registrationId={row.id}
                  status={row.status}
                />
              </article>
            );
          })}

          {(registrations || []).length === 0 && (
            <div className="empty-state">No community registrations yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}
