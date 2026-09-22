import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminPage() {
  const { supabase, setupRequired } = await requireAdmin();

  if (setupRequired || !supabase) {
    return (
      <section className="page-hero">
        <div className="shell narrow">
          <p className="eyebrow">Admin setup</p>
          <h1>Connect Supabase first.</h1>
          <p className="page-lead">
            Add the Supabase environment variables, run the migrations and create your admin user.
          </p>
        </div>
      </section>
    );
  }

  const [contacts, enrolments, registrations, failedEmails] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase
      .from("enrolments")
      .select("*", { count: "exact", head: true })
      .in("status", ["NEW", "WAITLIST"]),
    supabase
      .from("community_registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "REGISTERED"),
    supabase
      .from("email_logs")
      .select("*", { count: "exact", head: true })
      .eq("status", "FAILED"),
  ]);

  return (
    <section className="admin-page">
      <div className="shell">
        <div className="admin-head">
          <div>
            <p className="eyebrow">TRConcept Control Centre</p>
            <h1>Dashboard</h1>
          </div>

          <form action="/api/admin/logout" method="post">
            <button className="button button-dark" type="submit">
              Sign out
            </button>
          </form>
        </div>

        <div className="admin-stats">
          <article><strong>{contacts.count || 0}</strong><span>Contacts</span></article>
          <article><strong>{enrolments.count || 0}</strong><span>Course registrations</span></article>
          <article><strong>{registrations.count || 0}</strong><span>Community registrations</span></article>
          <article><strong>{failedEmails.count || 0}</strong><span>Failed emails</span></article>
        </div>

        <div className="admin-links">
          <Link href="/admin/content">Website content →</Link>
          <Link href="/admin/community">Community sessions →</Link>
          <Link href="/admin/enrolments">Enrolments →</Link>\n          <Link href="/admin/cohorts">Cohorts →</Link>
          <Link href="/admin/contacts">Contacts →</Link>
          <Link href="/admin/submissions">Form submissions →</Link>
          <Link href="/admin/email-logs">Email logs →</Link>
          <Link href="/admin/consents">Consents →</Link>
        </div>
      </div>
    </section>
  );
}
