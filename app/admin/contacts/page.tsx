import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminContactsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; followup?: string }> }) {
  const { supabase, setupRequired } = await requireAdmin();
  if (setupRequired || !supabase) return null;
  const params = await searchParams;
  const q = (params.q || "").replace(/[^\p{L}\p{N}@. +\-]/gu, "").slice(0,100);
  const page = Math.max(1, Math.min(10000, Number.parseInt(params.page || "1",10) || 1));
  let query = supabase.from("contact_journey_v1").select("*", { count: "exact" }).order("created_at", { ascending: false }).order("contact_id");
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,contact_code.ilike.%${q}%`);
  if (params.followup === "yes") query = query.not("follow_up_on", "is", null);
  const { data, error, count } = await query.range((page-1)*50,page*50-1);
  const pageLink = (target: number) => `/admin/contacts?${new URLSearchParams({ q, page: String(target), followup: params.followup || "" })}`;
  return <section className="admin-page"><div className="shell">
    <p className="eyebrow">Admin · People</p><h1>People & next steps</h1>
    <p>One person, one ID — across community, courses and follow-up.</p>
    <form className="admin-search" method="get">
      <label>Find a person<input name="q" defaultValue={q} placeholder="Name, email or PER code" /></label>
      <label className="checkbox"><input type="checkbox" name="followup" value="yes" defaultChecked={params.followup === "yes"} />With a follow-up date</label>
      <button className="button button-small">Search</button>
    </form>
    {error ? <p role="alert">Could not load people. Check database setup and permissions.</p> : <>
      <p>{count || 0} people · page {page}</p>
      <div className="admin-table">{(data || []).map(row => <article className="admin-row" key={row.contact_id}>
        <div><Link className="text-link" href={`/admin/contacts/${row.contact_id}`}><strong>{row.name}</strong></Link><p className="record-code">{row.contact_code}</p><span>{row.email}</span></div>
        <div><strong>{row.relationship_status.replaceAll("_"," ")}</strong><p>{row.community_attended} community attended · {row.courses_completed} courses completed</p></div>
        <div><span>{row.next_action || "No next action set"}</span><p>{row.follow_up_on ? `Follow up: ${row.follow_up_on}` : "No follow-up date"}</p></div>
        <span>Marketing: {row.marketing_allowed ? "Consent recorded" : "Not permitted"}</span>
      </article>)}</div>
      {!data?.length && <p>No matching people.</p>}
      <div className="admin-pagination">{page>1 && <Link href={pageLink(page-1)}>← Previous</Link>}{(count || 0)>page*50 && <Link href={pageLink(page+1)}>Next →</Link>}</div>
    </>}
  </div></section>;
}
