import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminEnrolmentsPage() {
  const { supabase, setupRequired } = await requireAdmin();

  if (setupRequired || !supabase) return null;

  const { data: enrolments } = await supabase
    .from("enrolments")
    .select("id,status,payment_status,amount,created_at,contact_id,course_id")
    .order("created_at", { ascending: false })
    .limit(100);

  const contactIds = [...new Set((enrolments || []).map((row) => row.contact_id))];
  const courseIds = [...new Set((enrolments || []).map((row) => row.course_id))];

  const [{ data: contacts }, { data: courses }] = await Promise.all([
    contactIds.length
      ? supabase.from("contacts").select("id,name,email").in("id", contactIds)
      : Promise.resolve({ data: [] }),
    courseIds.length
      ? supabase.from("courses").select("id,offer_id").in("id", courseIds)
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

        <div className="admin-table">
          {(enrolments || []).map((row) => {
            const contact = contactMap.get(row.contact_id);
            const course = courseMap.get(row.course_id);
            const offer = course ? offerMap.get(course.offer_id) : null;

            return (
              <div className="admin-row" key={row.id}>
                <strong>{contact?.name || contact?.email || "Unknown contact"}</strong>
                <span>{offer?.name || "Course"}</span>
                <span>{row.status}</span>
                <span>{row.payment_status}</span>
              </div>
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
