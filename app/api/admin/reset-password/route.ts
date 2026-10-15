import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-api';
import { isRecoveryOrigin } from '@/lib/recovery';
export async function POST(request: Request) {
  if (!isRecoveryOrigin(request)) return NextResponse.json({error:'Request not allowed.'},{status:403});
  const access = await requireAdminApi();
  if (access.response) return access.response;
  const body = await request.json().catch(()=>null);
  const password = typeof body?.password === 'string' ? body.password : '';
  if (password.length < 12 || password.length > 128 || password !== body?.confirmPassword) return NextResponse.json({error:'Use 12–128 characters and make sure both passwords match.'},{status:400});
  const { error } = await access.supabase.auth.updateUser({password});
  if (error) return NextResponse.json({error:'Could not change the password. Try a different strong password, or request a new reset link.'},{status:400});
  // Revoke refresh sessions after recovery; existing access tokens expire per Auth settings.
  const {error:signOutError} = await access.supabase.auth.signOut({scope:'global'});
  if(signOutError) return NextResponse.json({ok:true,signOutPending:true});
  return NextResponse.json({ok:true});
}
