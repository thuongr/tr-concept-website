import { AdminEnrolmentForm } from "@/components/AdminEnrolmentForm";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminEnrolmentsPage() {
  const { supabase, setupRequired } = await requireAdmin();
  if (setupRequired || !supabase) return null;

  const { data: enrolments } = await supabase
    .from("enrolments")
    .select("id,status,payment_status,amount,created_at,contact_id,course_id,cohort_id")
    .order("created_at", { ascending: false })
    .limit(100);

  const contactIds = [...new Set((enrolments || []).map((row) => row.contact_id))];
  const courseIds = [...new Set((enrolments || []).map((row) => row.course_id))];

  const [{ data: contacts }, { data: courses }, { data: cohorts }] = await Promise.all([
    contactIds.length
      ? supabase.from("contacts").select("id,name,email").in("id", contactIds)
      : Promise.resolve({ data: [] }),
    courseIds.length
      ? supabase.from("courses").select("id,offer_id").in("id", courseIds)
      : Promise.resolve({ data: [] }),
    courseIds.length
      ? supabase
          .from("cohorts")
          .select("id,name,course_id,status")
          .in("course_id", courseIds)
          .in("status", ["FORMING", "ACTIVE"])
      : Promise.resolve({ data: [] }),
  ]);

  const offerIds = [...new Set((courses || []).map((row) => row.offer_id))];
  const { data: offers } = offerIds.length
    ? await supabase.from("offers").select("id,name").in("id", offerIds)
    : { data: [] };

  const contactMap = new Map((contacts || []).map((row) => [row.id, row]));
  const courseMap = new Map((courses || []).map((row) => [row.id, row]));
  const offerMap = new Map((offers || []).map((row) => [row.id, row]));

  return (
    <section className="admin-page">
      <div className="shell">
        <p className="eyebrow">Admin · Education</p>
        <h1>Enrolments</h1>
        <p className="page-lead">
          Assign students to a cohort here. Detailed lesson dates and group discussion stay human-managed.
        </p>

        <div className="admin-enrolment-list">
          {(enrolments || []).map((row) => {
            const contact = contactMap.get(row.contact_id);
            const course = courseMap.get(row.course_id);
            const offer = course ? offerMap.get(course.offer_id) : null;
            const cohortOptions = (cohorts || [])
              .filter((cohort) => cohort.course_id === row.course_id)
              .map((cohort) => ({ id: cohort.id, name: cohort.name }));

            return (
              <article className="admin-enrolment-card" key={row.id}>
                <div>
                  <strong>{contact?.name || contact?.email || "Unknown contact"}</strong>
                  <p>{contact?.email}</p>
                  <p>{offer?.name || "Course"}</p>
                </div>

                <AdminEnrolmentForm
                  enrolmentId={row.id}
                  status={row.status}
                  paymentStatus={row.payment_status}
                  cohortId={row.cohort_id}
                  cohorts={cohortOptions}
                />
              </article>
            );
          })}

          {(enrolments || []).length === 0 && (
            <div className="empty-state">No enrolments yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}
