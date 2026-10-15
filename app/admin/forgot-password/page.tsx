import {AdminRecoveryForm} from '@/components/AdminRecoveryForm';
export default async function ForgotPassword({searchParams}:{searchParams:Promise<{error?:string}>}){
 const {error}=await searchParams;
 const messages:Record<string,string>={link:'This reset link is invalid, expired or already used. Request a new link and open it in the same browser and device.',unavailable:'Password recovery is unavailable. Please contact the site owner.',access:'Admin access could not be verified. Please contact the site owner.'};
 return <section className="admin-page"><div className="shell narrow"><p className="eyebrow">TRConcept Admin</p><h1>Forgot password?</h1><p>Enter the email you use to sign in to Admin.</p>{error&&<p role="alert" className="form-message error">{messages[error]||messages.link}</p>}<AdminRecoveryForm mode="request"/></div></section>;
}
