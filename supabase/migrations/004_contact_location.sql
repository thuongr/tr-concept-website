-- Course registration contact geography
alter table contacts add column if not exists country text;
alter table contacts add column if not exists state_region text;
create index if not exists idx_contacts_country_state on contacts(country, state_region);
