import { AdminCaseStudyForm } from "@/components/AdminCaseStudyForm";
import { AdminCaseStudyStatusForm } from "@/components/AdminCaseStudyStatusForm";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminCaseStudiesPage() {
  const { supabase, setupRequired } = await requireAdmin();
  if (setupRequired || !supabase) return null;

  const { data } = await supabase
    .from("case_studies")
    .select("id,type,title,slug,permission_status,status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <section className="admin-page">
      <div className="shell admin-two-column">
        <div>
          <p className="eyebrow">Admin · Proof</p>
          <h1>Case studies</h1>
          <p className="page-lead">
            Draft first. Permission is a separate gate before identifiable material is published.
          </p>

          <div className="admin-enrolment-list">
            {(data || []).map((row) => (
              <article className="admin-enrolment-card" key={row.id}>
                <div>
                  <strong>{row.title}</strong>
                  <p>{row.type} · /work/{row.slug}</p>
                </div>

                <AdminCaseStudyStatusForm
                  id={row.id}
                  permissionStatus={row.permission_status}
                  status={row.status}
                />
              </article>
            ))}

            {(data || []).length === 0 && (
              <div className="empty-state">No case studies yet.</div>
            )}
          </div>
        </div>

        <AdminCaseStudyForm />
      </div>
    </section>
  );
}
