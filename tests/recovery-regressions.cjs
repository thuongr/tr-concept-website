const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');
function load(file,mocks={}){const code=ts.transpileModule(fs.readFileSync(path.resolve(file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const m={exports:{}};const req=id=>id in mocks?mocks[id]:id.startsWith('@/')?load(id.slice(2)+'.ts',mocks):require(id);new Function('require','module','exports',code)(req,m,m.exports);return m.exports;}
const origin='https://tr-concept-website.vercel.app';process.env.NEXT_PUBLIC_SITE_URL=origin;
const request=(body,site=origin)=>new Request(origin+'/api/admin/reset-password',{method:'POST',headers:{origin:site,'Content-Type':'application/json'},body:JSON.stringify(body)});
(async()=>{
let calls=0;const client={auth:{resetPasswordForEmail:async(email,opts)=>{calls++;assert.equal(opts.redirectTo,origin+'/auth/recovery');return {error:null}}}};
const forgot=load('app/api/admin/forgot-password/route.ts',{'@/lib/supabase/server':{createSupabaseServerClient:async()=>client}}).POST;
assert.equal((await forgot(request({email:'test@example.com'},'https://evil.example'))).status,403);
assert.equal((await forgot(request({email:'bad'}))).status,400);assert.equal(calls,0);
assert.deepEqual(await (await forgot(request({email:'test@example.com'}))).json(),{ok:true});
client.auth.resetPasswordForEmail=async()=>({error:{status:429,code:'over_email_send_rate_limit'}});
assert.deepEqual(await (await forgot(request({email:'test@example.com'}))).json(),{ok:true});
let state={response:Response.json({error:'Unauthorized'},{status:401})},updated=0,signedOut=0;
const reset=load('app/api/admin/reset-password/route.ts',{'@/lib/admin-api':{requireAdminApi:async()=>state}}).POST;
const password='test-only-passphrase';assert.equal((await reset(request({password,confirmPassword:password}))).status,401);
state={supabase:{auth:{updateUser:async()=>{updated++;return {error:null}},signOut:async({scope})=>{assert.equal(scope,'global');signedOut++;return {error:null}}}}};
assert.equal((await reset(request({password,confirmPassword:'different'}))).status,400);assert.equal(updated,0);
assert.equal((await reset(request({password,confirmPassword:password},'https://evil.example'))).status,403);
assert.deepEqual(await (await reset(request({password,confirmPassword:password}))).json(),{ok:true});assert.equal(signedOut,1);
state.supabase.auth.updateUser=async()=>({error:{message:'rejected'}});assert.equal((await reset(request({password,confirmPassword:password}))).status,400);assert.equal(signedOut,1);
let exchangeError=true,allowed=true;
const callback=load('app/auth/recovery/route.ts',{'@/lib/supabase/server':{createSupabaseServerClient:async()=>({auth:{exchangeCodeForSession:async()=>({error:exchangeError?{}:null}),signOut:async()=>({error:null})},rpc:async()=>({data:allowed,error:null})})}}).GET;
for(const query of ['', '?error=expired','?code=expired'])assert.equal((await callback(new Request(origin+'/auth/recovery'+query))).headers.get('location'),origin+'/admin/forgot-password?error=link');
exchangeError=false;allowed=false;assert.equal((await callback(new Request(origin+'/auth/recovery?code=valid'))).headers.get('location'),origin+'/admin/forgot-password?error=access');
allowed=true;assert.equal((await callback(new Request(origin+'/auth/recovery?code=valid&next=https://evil.example'))).headers.get('location'),origin+'/admin/reset-password');
console.log('Recovery regression checks passed (mock Auth; no email sent).');
})().catch(e=>{console.error(e);process.exitCode=1});
