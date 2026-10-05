import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { isUuid } from "@/lib/validation";
import { AdminContactForm } from "@/components/AdminContactForm";
const date = (value: string) => new Date(value).toLocaleString("en-AU", { timeZone: "Australia/Brisbane" });
const value = (input: unknown) => input === null || input === undefined ? "—" : typeof input === "object" ? JSON.stringify(input) : String(input);
export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, setupRequired } = await requireAdmin();
  if (setupRequired || !supabase) return null;
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [contactResult, journey, registrations, enrolments, history, submissions] = await Promise.all([
    supabase.from("contacts").select("*").eq("id",id).maybeSingle(),
    supabase.from("contact_journey_v1").select("*").eq("contact_id",id).maybeSingle(),
    supabase.from("community_registrations").select("id,record_code,status,registered_at,attended_at,community_sessions(title,record_code)").eq("contact_id",id).order("registered_at",{ascending:false}).limit(100),
    supabase.from("enrolments").select("id,record_code,status,payment_status,currency,amount,created_at,source_community_registration_id,courses(record_code,offers(name)),cohorts(name,record_code)").eq("contact_id",id).order("created_at",{ascending:false}).limit(100),
    supabase.from("activity_events").select("id,entity_type,entity_id,event_type,changes,actor_kind,actor_user_id,occurred_at,event_number").eq("contact_id",id).order("event_number",{ascending:false}).limit(100),
    supabase.from("form_submissions").select("id,record_code,source_page,attribution,created_at").eq("contact_id",id).order("created_at",{ascending:false}).limit(30),
  ]);
  if ([contactResult,journey,registrations,enrolments,history,submissions].some(r=>r.error)) return <section className="admin-page"><div className="shell"><p role="alert">Could not load the complete person record. Please retry.</p></div></section>;
  const contact = contactResult.data;
  if (!contact) notFound();
  // Supabase's ungenerated schema type permits to-one joins as arrays; normalize defensively.
  const one = <T,>(v: T | T[] | null): T | null => Array.isArray(v) ? v[0] || null : v;
  return <section className="admin-page"><div className="shell">
    <Link href="/admin/contacts">← People</Link>
    <div className="admin-head"><div><p className="eyebrow">{contact.record_code}</p><h1>{contact.name}</h1><p>{contact.email} · {contact.phone || "No phone"}</p>
      <p>{[contact.business_name,contact.state_region,contact.country].filter(Boolean).join(" · ")}</p></div>
      <div><p>Marketing: {journey.data?.marketing_allowed ? "Consent recorded" : "Not permitted"}</p><p>First source: {contact.first_source}</p></div>
    </div>
    <details><summary>Integration identifier</summary><code className="record-code">contact_id: {contact.id}</code></details>
    <div className="admin-two-column admin-person-layout"><div>
      <h2>Community participation</h2><p>Latest 100 registrations. Attendance is recorded by an admin.</p>
      {(registrations.data || []).map(row=><article className="admin-history-item" key={row.id}>
        <strong>{one(row.community_sessions)?.title}</strong><p className="record-code">{row.record_code} · {one(row.community_sessions)?.record_code}</p>
        <p>{row.status} · registered {date(row.registered_at)}</p>{row.attended_at && <p>Attendance recorded {date(row.attended_at)}</p>}
      </article>)}
      {!registrations.data?.length && <p>No community registrations.</p>}
      <Link className="text-link" href="/admin/community/registrations">Manage attendance →</Link>
      <h2>Learning</h2>
      {(enrolments.data || []).map(row=><article className="admin-history-item" key={row.id}>
        <strong>{one(one(row.courses)?.offers || null)?.name || "Course"}</strong><p className="record-code">{row.record_code} · {one(row.courses)?.record_code}</p>
        <p>{row.status} · payment {row.payment_status} · {row.currency} {row.amount ?? "—"}</p>
        <p>{one(row.cohorts)?.name || "Cohort not assigned"}</p>
        <p>Community source: {registrations.data?.find(r=>r.id===row.source_community_registration_id)?.record_code || (row.source_community_registration_id ? "Linked registration" : "Not attributed")}</p>
      </article>)}
      {!enrolments.data?.length && <p>No course registrations.</p>}
      <Link className="text-link" href="/admin/enrolments">Manage enrolments →</Link>
      <h2>Registration sources</h2>
      {(submissions.data || []).map(row=><div className="admin-history-item" key={row.id}><p>{row.record_code} · {row.source_page} · {date(row.created_at)}</p><p>{Object.entries(row.attribution || {}).map(([k,v])=>`${k}: ${v}`).join(" · ") || "No campaign labels supplied"}</p></div>)}
    </div><AdminContactForm contact={{id:contact.id,relationship_status:contact.relationship_status,next_action:contact.next_action,follow_up_on:contact.follow_up_on,updated_at:contact.updated_at}} marketingAllowed={journey.data?.marketing_allowed === true} /></div>
    <h2>Activity history</h2><p>Latest 100 events · timestamps shown in Brisbane time. Previous states are retained.</p>
    <ol className="admin-timeline">{(history.data || []).map(event=><li key={event.id}>
      <strong>{event.entity_type.replaceAll("_"," ")} · {event.event_type.toLowerCase()}</strong>
      <p>{date(event.occurred_at)} · {event.actor_kind}{event.actor_user_id ? ` · ${event.actor_user_id}` : ""}</p>
      <ul>{Object.entries(event.changes as Record<string,{from:unknown;to:unknown}>).map(([field,change])=><li key={field}>{field.replaceAll("_"," ")}: {value(change.from)} → {value(change.to)}</li>)}</ul>
      <details><summary>Record ID</summary><code className="record-code">{event.entity_id}</code></details>
    </li>)}</ol>
  </div></section>;
}
