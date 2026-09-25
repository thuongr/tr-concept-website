-- V2 hardening + editable content foundation

create table if not exists business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'TRConcept',
  legal_name text not null default 'Thương Rejeehan',
  abn text not null default '99 372 263 957',
  business_structure text not null default 'SOLE_TRADER',
  gst_registered boolean not null default false,
  public_email text not null default 'hello@trconcept.co',
  location_label text not null default 'Brisbane, Queensland, Australia',
  footer_brand_line text not null default 'Evolve your business through practical AI & digital transformation.',
  hero_image_url text,
  updated_at timestamptz not null default now()
);

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  seo_title text,
  seo_description text,
  status text not null default 'DRAFT' check (status in ('DRAFT','PUBLISHED','ARCHIVED')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  section_key text not null,
  heading text,
  subheading text,
  body text,
  cta_label text,
  cta_url text,
  content_json jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(page_id, section_key)
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete set null,
  case_study_id uuid references case_studies(id) on delete set null,
  quote text not null,
  display_name text not null,
  business_name text,
  photo_url text,
  permission_status text not null default 'NOT_REQUESTED',
  status text not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contacts_email on contacts(email);
create index if not exists idx_enrolments_status on enrolments(status);
create index if not exists idx_community_sessions_status_starts on community_sessions(status, starts_at);
create index if not exists idx_form_submissions_created on form_submissions(created_at desc);
create index if not exists idx_email_logs_status_created on email_logs(status, created_at desc);
create index if not exists idx_consent_contact_type on consent_records(contact_id, consent_type);

-- Enable RLS on business/customer tables.
alter table business_settings enable row level security;
alter table pages enable row level security;
alter table page_sections enable row level security;
alter table offers enable row level security;
alter table courses enable row level security;
alter table cohorts enable row level security;
alter table contacts enable row level security;
alter table enrolments enable row level security;
alter table community_sessions enable row level security;
alter table community_registrations enable row level security;
alter table form_submissions enable row level security;
alter table case_studies enable row level security;
alter table testimonials enable row level security;
alter table consent_records enable row level security;
alter table email_logs enable row level security;

-- Public read policies.
drop policy if exists "public read business settings" on business_settings;
create policy "public read business settings" on business_settings
for select to anon using (true);

drop policy if exists "public read published pages" on pages;
create policy "public read published pages" on pages
for select to anon using (status = 'PUBLISHED');

drop policy if exists "public read published sections" on page_sections;
create policy "public read published sections" on page_sections
for select to anon using (
  is_visible = true
  and exists (
    select 1 from pages p
    where p.id = page_sections.page_id
    and p.status = 'PUBLISHED'
  )
);

drop policy if exists "public read active offers" on offers;
create policy "public read active offers" on offers
for select to anon using (status = 'ACTIVE');

drop policy if exists "public read courses" on courses;
create policy "public read courses" on courses
for select to anon using (true);

drop policy if exists "public read open community sessions" on community_sessions;
create policy "public read open community sessions" on community_sessions
for select to anon using (status = 'OPEN');

drop policy if exists "public read approved case studies" on case_studies;
create policy "public read approved case studies" on case_studies
for select to anon using (status = 'PUBLISHED' and permission_status = 'APPROVED');

drop policy if exists "public read approved testimonials" on testimonials;
create policy "public read approved testimonials" on testimonials
for select to anon using (status = 'PUBLISHED' and permission_status = 'APPROVED');

-- Authenticated admin policies. The MVP has one owner/admin account.
do $$
declare
  t text;
begin
  foreach t in array array[
    'business_settings','pages','page_sections','offers','courses','cohorts','contacts',
    'enrolments','community_sessions','community_registrations','form_submissions',
    'case_studies','testimonials','consent_records','email_logs'
  ]
  loop
    execute format('drop policy if exists "authenticated manage %s" on %I', t, t);
    execute format(
      'create policy "authenticated manage %s" on %I for all to authenticated using (true) with check (true)',
      t, t
    );
  end loop;
end $$;

insert into business_settings (
  business_name, legal_name, abn, business_structure, gst_registered,
  public_email, location_label, footer_brand_line
)
select
  'TRConcept','Thương Rejeehan','99 372 263 957','SOLE_TRADER',false,
  'hello@trconcept.co','Brisbane, Queensland, Australia',
  'Evolve your business through practical AI & digital transformation.'
where not exists (select 1 from business_settings);

insert into pages (slug,title,status,published_at)
values
('home','Home','PUBLISHED',now()),
('level-1','Level 1 — AI for Real Work','PUBLISHED',now()),
('level-2','Level 2 — AI for Business Builder','PUBLISHED',now()),
('community','AI Community Sessions','PUBLISHED',now()),
('solve','Solve','PUBLISHED',now()),
('build','Build','PUBLISHED',now()),
('about','About','PUBLISHED',now())
on conflict (slug) do nothing;

insert into page_sections (page_id,section_key,heading,body,cta_label,cta_url,sort_order)
select id,'hero','AI works better with structure.',
'TRConcept helps business owners and professionals understand how to structure, design and apply AI in real work — so you can work smarter, build faster and focus on what matters.',
'Explore courses','/learn/level-1',1
from pages where slug='home'
on conflict (page_id,section_key) do nothing;
