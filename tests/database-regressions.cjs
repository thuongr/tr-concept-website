// Real PostgreSQL semantics via PGlite; isolated in memory, no network/database credentials.
const {PGlite}=require('@electric-sql/pglite');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const db=new PGlite();
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema public,auth to anon,authenticated,service_role;
 alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
 alter default privileges in schema public grant all on sequences to anon,authenticated,service_role;`);
 for(const file of fs.readdirSync(path.join(__dirname,'../supabase/migrations')).filter(f=>f.endsWith('.sql')).sort()){
  // gen_random_uuid is built into PG; pgcrypto itself is not packaged in PGlite.
  await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/migrations',file),'utf8').replace('create extension if not exists pgcrypto;',''));
 }
 let passed=0;
 const check=async(name,fn)=>{await fn();passed++;console.log('PASS',name)};
 const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0];
 const rejects=async(sql,args=[])=>assert.rejects(db.query(sql,args));
 const owner='10000000-0000-4000-8000-000000000001',outsider='10000000-0000-4000-8000-000000000002';
 await db.query('insert into auth.users values ($1),($2)',[owner,outsider]);
 await db.query('insert into admin_members(user_id) values($1)',[owner]);
 const session=await scalar("insert into community_sessions(title,slug,starts_at,status,capacity,meeting_url) values('Test','test',now()+interval '10 days','OPEN',1,'https://zoom.example/private') returning id");
 const register=(kind,target,email,consent=false)=>scalar('select register_participation_v1($1,$2,$3,$4,$5,$6,$7)',[kind,target,'Test person',email,JSON.stringify({phone:'123',country:'Australia',stateRegion:'QLD'}),consent,JSON.stringify({utm_source:'test'})]);
 await check('anonymous cannot read contacts, meeting links or registration RPC',async()=>{
  await db.exec('set role anon');assert.equal(await scalar('select count(*) from contacts'),0);
  await rejects('select meeting_url from community_sessions');
  assert.equal(await scalar('select count(id) from community_sessions'),1);
  await assert.rejects(register('COMMUNITY',session,'test@example.test'));
  await db.exec('reset role');
 });
 await check('normal authenticated account is not admin and cannot self-promote',async()=>{
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[outsider]);await db.exec('set role authenticated');
  assert.equal(await scalar('select is_admin()'),false);
  await rejects('insert into admin_members(user_id) values($1)',[outsider]);
  await rejects("insert into contacts(name,email) values('X','x@example.test')");
  await db.exec("reset role; select set_config('request.jwt.claim.sub','',false)");
 });
 await check('registration commits contact, participation, consent, submission and queued email together',async()=>{
  await db.exec('set role service_role');const r=await register('COMMUNITY',session,'Person@Example.test',true);assert.equal(r.status,'REGISTERED');await db.exec('reset role');
  for(const table of ['contacts','community_registrations','consent_records','form_submissions','email_logs']) assert.equal(await scalar(`select count(*) from ${table}`),1);
 });
 const person=await scalar("select id from contacts where email='person@example.test'");
 await check('duplicate registration is idempotent and email is normalized',async()=>{
  const r=await register('COMMUNITY',session,'PERSON@example.test',true);assert.equal(r.already_registered,true);
  assert.equal(await scalar('select count(*) from email_logs'),1);assert.equal(await scalar('select count(*) from consent_records'),1);
 });
 await check('full session rolls back all partial writes',async()=>{
  await assert.rejects(register('COMMUNITY',session,'other@example.test'));
  assert.equal(await scalar('select count(*) from contacts'),1);assert.equal(await scalar('select count(*) from form_submissions'),1);
 });
 await check('community and course share one identity without overwriting it',async()=>{
  await register('COURSE','ai-for-real-work','person@example.test');
  assert.equal(await scalar('select count(*) from contacts'),1);
  assert.equal(await scalar('select contact_id from enrolments'),person);
  assert.equal(await scalar('select marketing_allowed from contact_journey_v1'),true);
 });
 await check('owner can read, audit transitions; repeated attended save preserves timestamp',async()=>{
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[owner]);await db.exec('set role authenticated');
  assert.equal(await scalar('select is_admin()'),true);assert.equal(await scalar('select count(*) from contacts'),1);
  await db.exec("update community_registrations set status='ATTENDED'");
  const timestamp=await scalar('select attended_at from community_registrations');
  const events=await scalar('select count(*) from activity_events');
  await db.exec("update community_registrations set status='ATTENDED',attended_at=now()+interval '1 day'");
  assert.deepEqual(await scalar('select attended_at from community_registrations'),timestamp);
  assert.equal(await scalar('select count(*) from activity_events'),events);
  assert.equal(await scalar("select actor_user_id from activity_events where event_type='UPDATED' order by event_number desc limit 1"),owner);
 });
 await check('identity and audit history cannot be rewritten',async()=>{
  await rejects("update contacts set record_code='PER-FAKE'");
  await rejects("update activity_events set event_type='FAKE'");
  await rejects('delete from activity_events');
 });
 await check('withdrawal immediately suppresses marketing without losing grant evidence',async()=>{
  await db.query("insert into consent_records(contact_id,consent_type,status,consent_text_version,consent_text_snapshot,source,withdrawn_at) values($1,'MARKETING_EMAIL','WITHDRAWN','admin-v1','Requested withdrawal','ADMIN',now())",[person]);
  assert.equal(await scalar('select marketing_allowed from contact_journey_v1'),false);
  await rejects("update consent_records set status='GRANTED'");
  assert.equal(await scalar('select count(*) from consent_records'),2);
 });
 await check('source attribution must belong to the same person',async()=>{
  await db.exec('reset role');
  const other=await scalar("insert into contacts(name,email) values('Other','other@example.test') returning id");
  const secondSession=await scalar("insert into community_sessions(title,slug,starts_at) values('Other','other',now()) returning id");
  const otherReg=await scalar('insert into community_registrations(contact_id,community_session_id) values($1,$2) returning id',[other,secondSession]);
  await rejects('update enrolments set source_community_registration_id=$1',[otherReg]);
  await db.exec(`update enrolments set source_community_registration_id=(select id from community_registrations where contact_id='${person}')`);
  assert.equal(await scalar('select count(*) from community_course_journey_v1 where enrolment_id is not null'),1);
 });
 await check('cohort capacity, course consistency and valid status are enforced in database',async()=>{
  const course=await scalar('select course_id from enrolments limit 1');
  const cohort=await scalar("insert into cohorts(course_id,name,capacity) values($1,'Small',1) returning id",[course]);
  await db.query("update enrolments set cohort_id=$1,status='ASSIGNED'",[cohort]);
  await register('COURSE','ai-for-real-work','other@example.test');
  await rejects("update enrolments set cohort_id=$1,status='ASSIGNED' where contact_id<>$2",[cohort,person]);
  await rejects("update enrolments set status='GUESSED'");
 });
 await check('reporting views respect RLS for non-admin',async()=>{
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[outsider]);await db.exec('set role authenticated');
  assert.equal(await scalar('select count(*) from contact_journey_v1'),0);
  assert.equal(await scalar('select count(*) from community_course_journey_v1'),0);
  assert.equal(await scalar('select count(*) from activity_events'),0);
 });
 await db.close();console.log(`${passed} database regression checks passed`);
})().catch(e=>{console.error(e);process.exit(1)});
