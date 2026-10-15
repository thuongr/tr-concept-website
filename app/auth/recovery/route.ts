import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { recoveryOrigin } from '@/lib/recovery';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const go = (path:string) => {
    const response = NextResponse.redirect(new URL(path,recoveryOrigin()));
    response.headers.set('Cache-Control','no-store');
    response.headers.set('Referrer-Policy','no-referrer');
    return response;
  };
  if (!code || url.searchParams.has('error')) return go('/admin/forgot-password?error=link');
  const supabase = await createSupabaseServerClient();
  if (!supabase) return go('/admin/forgot-password?error=unavailable');
  const flowId = url.searchParams.get('sb_flow_id');
  const { error } = await supabase.auth.exchangeCodeForSession(code,flowId?{flowId}:undefined);
  if (error) return go('/admin/forgot-password?error=link');
  const {data:allowed,error:accessError} = await supabase.rpc('is_admin');
  if (accessError || allowed !== true) {
    await supabase.auth.signOut({scope:'local'});
    return go('/admin/forgot-password?error=access');
  }
  return go('/admin/reset-password');
}
