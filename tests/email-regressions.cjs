const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('lib/email.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const moduleFake={exports:{}};let resendCalls=0,fetchCalls=0,request;
new Function('require','module','exports',code)(()=>({Resend:class{emails={send:async()=>{resendCalls++;return{data:{id:'resend-test'}}}}}}),moduleFake,moduleFake.exports);
const {sendTransactionalEmail:send}=moduleFake.exports;
const input={to:'test@example.invalid',subject:'Test',html:'<p>Test</p>'};
(async()=>{
 for(const key of ['EMAIL_PROVIDER','BREVO_API_KEY','RESEND_API_KEY','EMAIL_FROM','EMAIL_REPLY_TO'])delete process.env[key];
 global.fetch=async(url,opts)=>{fetchCalls++;request={url,...opts};return{ok:true,json:async()=>({messageId:'brevo-test'})}};
 process.env.EMAIL_PROVIDER='brevo';assert.equal((await send(input)).ok,false);assert.equal(fetchCalls,0);
 process.env.BREVO_API_KEY='fake-test-only';let result=await send(input);assert.equal(result.provider,'BREVO');assert.equal(result.id,'brevo-test');
 assert.equal(request.url,'https://api.brevo.com/v3/smtp/email');assert.deepEqual(JSON.parse(request.body).sender,{name:'TRConcept',email:'hello@trconcept.co'});assert.equal(JSON.parse(request.body).replyTo.email,'hello@trconcept.co');
 global.fetch=async()=>({ok:false,status:401,json:async()=>({message:'never echo raw provider response'})});result=await send(input);assert.equal(result.ok,false);assert(!result.error.includes('never echo'));
 global.fetch=async()=>{throw new Error('secret must not leak')};result=await send(input);assert.equal(result.ok,false);assert(!result.error.includes('secret'));assert.equal(resendCalls,0);
 global.fetch=async()=>({ok:true,json:async()=>({})});assert.equal((await send(input)).ok,false);
 process.env.EMAIL_PROVIDER='typo';assert.equal((await send(input)).ok,false);assert.equal(resendCalls,0);
 delete process.env.EMAIL_PROVIDER;process.env.RESEND_API_KEY='fake-test-only';result=await send(input);assert.equal(result.provider,'RESEND');assert.equal(result.ok,true);assert.equal(resendCalls,1);
 console.log('PASS email transport: missing key, Brevo payload/acceptance, rejection, timeout/no fallback, malformed response, invalid provider, Resend compatibility. No external email sent.');
})().catch(e=>{console.error(e);process.exit(1)});
