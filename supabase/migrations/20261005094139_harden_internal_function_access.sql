begin;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

-- Trigger handlers retain their OIDs/dependencies but are not Data API endpoints.
alter function public.guard_participation() set schema private;
alter function public.track_activity() set schema private;
revoke all on function private.guard_participation() from public,anon,authenticated;
revoke all on function private.track_activity() from public,anon,authenticated;

-- The privileged membership lookup only reveals the calling user's membership.
alter function public.is_admin() set schema private;
revoke all on function private.is_admin() from public,anon;
grant execute on function private.is_admin() to authenticated;
create function public.is_admin() returns boolean language sql stable security invoker
set search_path='' as $$ select private.is_admin(); $$;
revoke all on function public.is_admin() from public,anon;
grant execute on function public.is_admin() to authenticated;

-- Generating a display code needs sequence usage, not elevated privileges.
alter function public.record_code(text) security invoker;
grant usage on sequence public.record_code_seq to authenticated,service_role;
commit;
