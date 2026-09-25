import { AdminCreateCohortForm } from "@/components/AdminCreateCohortForm";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminCohortsPage() {
  const { supabase, setupRequired } = await requireAdmin();
  if (setupRequired || !supabase) return null;

  const [{ data: courses }, { data: cohorts }] = await Promise.all([
    supabase.from("courses").select("id,offer_id").order("created_at"),
    supabase
      .from("cohorts")
      .select("id,name,status,capacity,course_id,internal_group_type,internal_group_link")
      .order("created_at", { ascending: false }),
  ]);

  const offerIds = [...new Set((courses || []).map((row) => row.offer_id))];
  const { data: offers } = offerIds.length
    ? await supabase.from("offers").select("id,name").in("id", offerIds)
    : { data: [] };

  const offerMap = new Map((offers || []).map((row) => [row.id, row.name]));
  const courseNameMap = new Map(
    (courses || []).map((course) => [
      course.id,
      offerMap.get(course.offer_id) || "Course",
    ])
  );

  const courseOptions = (courses || []).map((course) => ({
    id: course.id,
    name: courseNameMap.get(course.id) || "Course",
  }));

  return (
    <section className="admin-page">
      <div className="shell admin-two-column">
        <div>
          <p className="eyebrow">Admin · Education</p>
          <h1>Cohorts</h1>

          <div className="admin-table">
            {(cohorts || []).map((cohort) => (
              <div className="admin-row" key={cohort.id}>
                <strong>{cohort.name}</strong>
                <span>{courseNameMap.get(cohort.course_id)}</span>
                <span>{cohort.status}</span>
                <span>
                  {cohort.capacity} seats · {cohort.internal_group_type || "No group yet"}
                </span>
              </div>
            ))}

            {(cohorts || []).length === 0 && (
              <div className="empty-state">No cohorts yet.</div>
            )}
          </div>
        </div>

        <AdminCreateCohortForm courses={courseOptions} />
      </div>
    </section>
  );
}
