import "./admin.css";
import { AdminNav } from "@/components/AdminNav";
import { hasSupabaseConfig } from "@/lib/supabase/server";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <AdminNav />
      {hasSupabaseConfig() ? children : (
        <section className="admin-page">
          <div className="shell narrow">
            <p className="eyebrow">Admin setup</p>
            <h1>Connect Supabase first.</h1>
            <p>The new TRConcept database needs to be connected before people, courses and community records can be managed.</p>
            <p>Database setup and verified owner access are still required. No records from the old website will be imported.</p>
          </div>
        </section>
      )}
    </div>
  );
}
