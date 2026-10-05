begin;
-- Called only by the website server. One transaction stores the entire registration.
create function public.register_participation_v1(
  p_kind text, p_target text, p_name text, p_email text, p_details jsonb,
  p_marketing boolean default false, p_attribution jsonb default '{}'::jsonb
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare person public.contacts; offer public.offers; course public.courses; session public.community_sessions;
  participation_id uuid; submission_id uuid; mail_id uuid; target_status text; source_page text;
  form_type text; mail_type text; existing_id uuid;
begin
  if p_kind not in ('COURSE','COMMUNITY') or p_kind is null or nullif(btrim(p_name),'') is null
    or p_email is null or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or length(p_name)>120 or length(p_email)>254 or jsonb_typeof(p_details)<>'object'
    or jsonb_typeof(p_attribution)<>'object' or octet_length(p_attribution::text)>2048 then
    raise exception 'Invalid registration' using errcode='22023';
  end if;
  p_email=lower(btrim(p_email));
  -- Serialize requests for this identity, including course/community requests in parallel.
  perform pg_advisory_xact_lock(hashtextextended(p_email,0));
  select * into person from public.contacts where email=p_email;
  if p_kind='COURSE' then
    select * into offer from public.offers where slug=p_target and status='ACTIVE' and type='COURSE';
    select * into course from public.courses where offer_id=offer.id;
    if course.id is null or course.registration_status not in ('OPEN','WAITLIST') then
      raise exception 'Course unavailable' using errcode='23514';
    end if;
    select id into existing_id from public.enrolments where contact_id=person.id and course_id=course.id;
    target_status=case when course.registration_status='WAITLIST' then 'WAITLIST' else 'NEW' end;
    source_page=case when p_target='ai-for-real-work' then '/learn/level-1' else '/learn/level-2' end;
    form_type=case when p_target='ai-for-real-work' then 'LEVEL_1_REGISTRATION' else 'LEVEL_2_REGISTRATION' end;
    mail_type='COURSE_REGISTRATION_ACKNOWLEDGEMENT';
  else
    select * into session from public.community_sessions where id=p_target::uuid for update;
    select id into existing_id from public.community_registrations where contact_id=person.id and community_session_id=session.id;
    if existing_id is null and (session.id is null or session.status<>'OPEN' or session.starts_at<=now()) then
      raise exception 'Community session unavailable' using errcode='23514';
    end if;
    target_status='REGISTERED'; source_page='/community';
    form_type='COMMUNITY_SESSION_REGISTRATION'; mail_type='COMMUNITY_SESSION_CONFIRMATION';
  end if;
  if existing_id is not null then return jsonb_build_object('already_registered',true); end if;

  if person.id is null then
    insert into public.contacts(name,email,phone,country,state_region,business_name,first_source)
    values(btrim(p_name),p_email,p_details->>'phone',p_details->>'country',p_details->>'stateRegion',p_details->>'business',p_kind)
    returning * into person;
  end if;
  -- Public submissions cannot overwrite an existing person's identity or internal notes.
  insert into public.form_submissions(contact_id,form_type,source_page,payload_json,attribution)
  values(person.id,form_type,source_page,p_details||jsonb_build_object('name',p_name,'target',p_target,'marketingConsent',p_marketing),p_attribution)
  returning id into submission_id;
  if p_kind='COURSE' then
    insert into public.enrolments(contact_id,course_id,status,payment_status,amount,submission_id)
    values(person.id,course.id,target_status,'PENDING',offer.price_amount,submission_id) returning id into participation_id;
  else
    insert into public.community_registrations(contact_id,community_session_id,status,marketing_consent,submission_id)
    values(person.id,session.id,'REGISTERED',p_marketing,submission_id) returning id into participation_id;
  end if;
  if p_marketing then
    insert into public.consent_records(contact_id,consent_type,status,scope_json,consent_text_version,consent_text_snapshot,source,granted_at)
    values(person.id,'MARKETING_EMAIL','GRANTED',jsonb_build_object('submission_id',submission_id,'participation_id',participation_id),
      case when p_kind='COURSE' then 'course-v1' else 'community-v1' end,
      case when p_kind='COURSE' then 'I’d also like practical AI updates, community sessions and course information.'
        else 'Yes, I’d also like practical AI updates, future sessions and course information.' end,'WEBSITE',now());
  end if;
  insert into public.email_logs(contact_id,submission_id,email_type,recipient_email,status)
  values(person.id,submission_id,mail_type,p_email,'QUEUED') returning id into mail_id;
  return jsonb_build_object('already_registered',false,'status',target_status,'email_log_id',mail_id,
    'title',case when p_kind='COURSE' then offer.name else session.title end,'starts_at',session.starts_at);
end $$;
revoke all on function public.register_participation_v1(text,text,text,text,jsonb,boolean,jsonb) from public,anon,authenticated;
grant execute on function public.register_participation_v1(text,text,text,text,jsonb,boolean,jsonb) to service_role;
commit;
