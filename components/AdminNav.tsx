import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Admin navigation">
      <Link href="/admin">Dashboard</Link>
      <Link href="/admin/content">Content</Link>
      <Link href="/admin/cohorts">Cohorts</Link>
      <Link href="/admin/enrolments">Enrolments</Link>
      <Link href="/admin/community">Community</Link>
      <Link href="/admin/case-studies">Case studies</Link>
      <Link href="/admin/contacts">Contacts</Link>
      <Link href="/admin/email-logs">Email</Link>
      <Link href="/admin/consents">Consents</Link>
    </nav>
  );
}
