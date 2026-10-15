import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isRecoveryOrigin, recoveryOrigin } from '@/lib/recovery';
export async function POST(request: Request) {
  if (!isRecoveryOrigin(request)) return NextResponse.json({error:'Request not allowed.'},{status:403});
  const body = await request.json().catch(()=>null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({error:'Enter a valid email address.'},{status:400});
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({error:'Password recovery is unavailable. Please contact the site owner.'},{status:503});
  const { error } = await supabase.auth.resetPasswordForEmail(email, {redirectTo:`${recoveryOrigin()}/auth/recovery`});
  // Avoid account enumeration, including provider/rate-limit errors. No email/token in logs.
  if (error) console.error('Password recovery request failed', {status:error.status,code:error.code});
  return NextResponse.json({ok:true}, {headers:{'Cache-Control':'no-store'}});
}
