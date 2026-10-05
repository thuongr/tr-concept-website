-- New TRConcept backend only. Apply 001–006 in order; never import the legacy site.
begin;

-- Membership is provisioned by the project owner in SQL, never by a public signup.
create table public.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'OWNER' check (role in ('OWNER','ADMIN')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.admin_members enable row level security;
revoke all on public.admin_members from anon, authenticated;
create function public.is_admin() returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from public.admin_members where user_id = auth.uid() and active);
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

do $$ declare t text; begin
  foreach t in array array['business_settings','pages','page_sections','offers','courses','cohorts',
    'contacts','enrolments','community_sessions','community_registrations','form_submissions',
    'case_studies','testimonials','consent_records','email_logs'] loop
    execute format('drop policy if exists "authenticated manage %s" on public.%I',t,t);
    execute format('create policy "owner manage" on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',t);
  end loop;
end $$;

-- A row policy does not protect individual columns. Keep Zoom access private.
revoke select on public.community_sessions from anon;
grant select(id,title,slug,summary,starts_at,timezone,capacity,status) on public.community_sessions to anon;
-- Authenticated users rely on the owner policy; do not add a permissive full-row public policy.

-- UUIDs remain the canonical integration keys. Human codes are immutable display references.
create sequence public.record_code_seq;
create function public.record_code(prefix text) returns text language sql volatile security definer
set search_path = '' as $$ select prefix || '-' || lpad(n,greatest(8,length(n)),'0') from (select nextval('public.record_code_seq')::text as n) s; $$;
revoke all on function public.record_code(text) from public, anon;
grant execute on function public.record_code(text) to authenticated, service_role;
create function public.immutable_identity() returns trigger language plpgsql set search_path='' as $$
begin
  if new.id is distinct from old.id or new.record_code is distinct from old.record_code then
    raise exception 'Record identity is immutable' using errcode='23514';
  end if;
  return new;
end $$;
do $$ declare pair text[]; begin
  foreach pair slice 1 in array array[
    ['contacts','PER'],['courses','CRS'],['cohorts','COH'],['enrolments','ENR'],
    ['community_sessions','COM'],['community_registrations','REG'],
    ['form_submissions','SUB'],['consent_records','CNS'],['email_logs','EML']
  ] loop
    execute format('alter table public.%I add column record_code text not null unique default public.record_code(%L)',pair[1],pair[2]);
    execute format('create trigger immutable_identity before update on public.%I for each row execute function public.immutable_identity()',pair[1]);
  end loop;
end $$;

create function public.normalize_contact_email() returns trigger language plpgsql set search_path='' as $$
begin new.email=lower(btrim(new.email)); return new; end $$;
update public.contacts set email=lower(btrim(email));
create unique index contacts_normalized_email on public.contacts(lower(btrim(email)));
create trigger normalize_contact_email before insert or update of email on public.contacts
for each row execute function public.normalize_contact_email();

alter table public.contacts
  add column relationship_status text not null default 'NEW' check (relationship_status in ('NEW','ENGAGED','INTERESTED','FOLLOW_UP','NOT_NOW')),
  add column next_action text,
  add column follow_up_on date,
  add column first_source text not null default 'WEBSITE';
alter table public.form_submissions add column attribution jsonb not null default '{}'::jsonb;
alter table public.community_registrations
  add column submission_id uuid references public.form_submissions(id) on delete set null,
  add column updated_at timestamptz not null default now();
alter table public.enrolments
  add column submission_id uuid references public.form_submissions(id) on delete set null,
  add column source_community_registration_id uuid references public.community_registrations(id) on delete set null,
  add column currency text not null default 'AUD' check (currency='AUD');
alter table public.consent_records
  add column recorded_at timestamptz not null default clock_timestamp(),
  add column event_number bigint generated always as identity;
create index consent_latest on public.consent_records(contact_id,consent_type,event_number desc);
create index registrations_person on public.community_registrations(contact_id,registered_at desc);
create index enrolments_person on public.enrolments(contact_id,created_at desc);
create index contacts_follow_up on public.contacts(follow_up_on) where follow_up_on is not null;

alter table public.enrolments
  add constraint enrolment_status check(status in ('NEW','CONFIRMED','WAITLIST','ASSIGNED','COMPLETED','CANCELLED')),
  add constraint enrolment_payment_status check(payment_status in ('NOT_REQUIRED','PENDING','PAID','REFUNDED','PARTIAL')),
  add constraint enrolment_assigned_cohort check(status <> 'ASSIGNED' or cohort_id is not null),
  add constraint enrolment_nonnegative_amount check(amount is null or amount>=0);
alter table public.community_registrations add constraint registration_status check(status in ('REGISTERED','ATTENDED','NO_SHOW','CANCELLED'));
alter table public.community_sessions add constraint session_positive_capacity check(capacity is null or capacity>0);
alter table public.cohorts add constraint cohort_positive_capacity check(capacity>0);

-- Lock the parent before counting seats. Applies to every writer, including future agents.
create function public.guard_participation() returns trigger language plpgsql security definer set search_path='' as $$
declare parent record; used integer; begin
  if tg_op='UPDATE' and (new.contact_id<>old.contact_id) then
    raise exception 'A participation cannot be moved to another person' using errcode='23514';
  end if;
  if new.submission_id is not null and not exists(select 1 from public.form_submissions s where s.id=new.submission_id and s.contact_id=new.contact_id) then
    raise exception 'Submission must belong to this person' using errcode='23514';
  end if;
  if tg_table_name='enrolments' then
    if tg_op='UPDATE' and new.course_id<>old.course_id then raise exception 'Course identity is immutable' using errcode='23514'; end if;
    if new.source_community_registration_id is not null and not exists(
      select 1 from public.community_registrations r where r.id=new.source_community_registration_id and r.contact_id=new.contact_id
    ) then raise exception 'Community source must belong to this person' using errcode='23514'; end if;
    if new.cohort_id is not null then
      select * into parent from public.cohorts where id=new.cohort_id for update;
      if parent.course_id is distinct from new.course_id then raise exception 'Cohort course mismatch' using errcode='23514'; end if;
      if new.status not in ('CANCELLED','WAITLIST') then
        if (tg_op='INSERT' or new.cohort_id is distinct from old.cohort_id or old.status in ('CANCELLED','WAITLIST')) and parent.status not in ('FORMING','ACTIVE') then
          raise exception 'Cohort is not accepting students' using errcode='23514';
        end if;
        select count(*) into used from public.enrolments where cohort_id=new.cohort_id and id<>new.id and status not in ('CANCELLED','WAITLIST');
        if used>=parent.capacity then raise exception 'Cohort is full' using errcode='23514'; end if;
      end if;
    end if;
  else
    if tg_op='UPDATE' and new.community_session_id<>old.community_session_id then raise exception 'Session identity is immutable' using errcode='23514'; end if;
    select * into parent from public.community_sessions where id=new.community_session_id for update;
    if new.status<>'CANCELLED' and parent.capacity is not null then
      select count(*) into used from public.community_registrations where community_session_id=new.community_session_id and id<>new.id and status<>'CANCELLED';
      if used>=parent.capacity then raise exception 'Community session is full' using errcode='23514'; end if;
    end if;
    if new.status='ATTENDED' then
      if tg_op='INSERT' then new.attended_at=coalesce(new.attended_at,now());
      elsif old.status='ATTENDED' then new.attended_at=old.attended_at;
      else new.attended_at=coalesce(new.attended_at,now()); end if;
    else new.attended_at=null; end if;
  end if;
  new.updated_at=now();
  return new;
end $$;
create trigger guard_participation before insert or update on public.enrolments for each row execute function public.guard_participation();
create trigger guard_participation before insert or update on public.community_registrations for each row execute function public.guard_participation();

-- Append-only operational history. Only selected operational fields, never full PII snapshots.
create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  event_number bigint generated always as identity unique,
  contact_id uuid references public.contacts(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  event_type text not null,
  changes jsonb not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_kind text not null,
  occurred_at timestamptz not null default clock_timestamp()
);
create index activity_person on public.activity_events(contact_id,event_number desc);
alter table public.activity_events enable row level security;
create policy "owner read activity" on public.activity_events for select to authenticated using ((select public.is_admin()));
revoke all on public.activity_events from anon,authenticated;
grant select on public.activity_events to authenticated;
create function public.track_activity() returns trigger language plpgsql security definer set search_path='' as $$
declare before_row jsonb='{}'; after_row jsonb=to_jsonb(new); diff jsonb='{}'; field text; person uuid;
begin
  if tg_op='UPDATE' then before_row=to_jsonb(old); end if;
  foreach field in array array['status','payment_status','cohort_id','source_community_registration_id',
    'relationship_status','next_action','follow_up_on','attended_at','amount','consent_type','scope_json','withdrawn_at'] loop
    if after_row ? field and (tg_op='INSERT' or after_row->field is distinct from before_row->field) then
      diff=diff||jsonb_build_object(field,jsonb_build_object('from',before_row->field,'to',after_row->field));
    end if;
  end loop;
  if tg_op='INSERT' or diff<>'{}'::jsonb then
    person=case when tg_table_name='contacts' then new.id else (after_row->>'contact_id')::uuid end;
    insert into public.activity_events(contact_id,entity_type,entity_id,event_type,changes,actor_user_id,actor_kind)
    values(person,tg_table_name,new.id,case when tg_op='INSERT' then 'CREATED' else 'UPDATED' end,diff,auth.uid(),
      case when auth.uid() is not null then 'ADMIN' else 'SYSTEM' end);
  end if;
  return new;
end $$;
do $$ declare t text; begin
  foreach t in array array['contacts','enrolments','community_registrations','consent_records'] loop
    execute format('create trigger track_activity after insert or update on public.%I for each row execute function public.track_activity()',t);
  end loop;
end $$;
-- Consent is evidence: withdrawal is another event, never erase or overwrite a grant.
drop policy "owner manage" on public.consent_records;
create policy "owner read consent" on public.consent_records for select to authenticated using ((select public.is_admin()));
create policy "owner record withdrawal" on public.consent_records for insert to authenticated
with check ((select public.is_admin()) and status='WITHDRAWN' and consent_type='MARKETING_EMAIL' and source='ADMIN');
revoke update,delete on public.consent_records from authenticated;

create view public.contact_journey_v1 with (security_invoker=true) as
select c.id as contact_id,c.record_code as contact_code,c.name,c.email,c.relationship_status,c.next_action,c.follow_up_on,c.first_source,c.created_at,
  (select count(*) from public.community_registrations r where r.contact_id=c.id) as community_registrations,
  (select count(*) from public.community_registrations r where r.contact_id=c.id and r.status='ATTENDED') as community_attended,
  (select count(*) from public.enrolments e where e.contact_id=c.id and e.status not in ('CANCELLED','WAITLIST')) as course_registrations,
  (select count(*) from public.enrolments e where e.contact_id=c.id and e.status='COMPLETED') as courses_completed,
  coalesce((select cr.status='GRANTED' from public.consent_records cr where cr.contact_id=c.id and cr.consent_type='MARKETING_EMAIL' order by cr.event_number desc limit 1),false) as marketing_allowed
from public.contacts c;
create view public.community_course_journey_v1 with (security_invoker=true) as
select r.id as registration_id,r.record_code as registration_code,r.contact_id,r.community_session_id,
  r.status as attendance_status,r.registered_at,r.attended_at,
  e.id as enrolment_id,e.record_code as enrolment_code,e.course_id,e.cohort_id,
  e.status as enrolment_status,e.payment_status,e.created_at as course_registered_at
from public.community_registrations r
left join public.enrolments e on e.source_community_registration_id=r.id;
revoke all on public.contact_journey_v1,public.community_course_journey_v1 from anon;
grant select on public.contact_journey_v1,public.community_course_journey_v1 to authenticated;
comment on view public.community_course_journey_v1 is 'Explicitly attributed community → course links only. Registration is not payment or causation. Exclude cancelled/waitlisted records as appropriate.';
commit;
