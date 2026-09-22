alter table case_studies
  add column if not exists subject_name text,
  add column if not exists business_name text,
  add column if not exists what_we_built text,
  add column if not exists what_we_did_not_build text;

create index if not exists idx_case_studies_publish
  on case_studies(status, permission_status, created_at desc);
