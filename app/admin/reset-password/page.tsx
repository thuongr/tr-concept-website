import Link from 'next/link';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import {AdminRecoveryForm} from '@/components/AdminRecoveryForm';
export default async function ResetPassword(){
 const supabase=await createSupabaseServerClient();
 const user=supabase?await supabase.auth.getUser():null;
 const access=user?.data.user?await supabase!.rpc('is_admin'):null;
 const allowed=!!user?.data.user&&!user.error&&!access?.error&&access?.data===true;
 return <section className="admin-page"><div className="shell narrow"><p className="eyebrow">TRConcept Admin</p><h1>Set a new password</h1>{allowed?<AdminRecoveryForm mode="reset"/>:<div className="form-card"><p role="alert">Your reset session is missing or expired, or Admin access could not be verified.</p><Link className="text-link" href="/admin/forgot-password">Request a new reset link →</Link></div>}</div></section>;
}
