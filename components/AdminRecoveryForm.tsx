'use client';
import Link from 'next/link';
import {FormEvent,useState} from 'react';
import {formRequest} from '@/lib/form-request';
export function AdminRecoveryForm({mode}:{mode:'request'|'reset'}) {
  const [busy,setBusy]=useState(false),[done,setDone]=useState(false),[message,setMessage]=useState('');
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setMessage('');setBusy(true);
    const element=event.currentTarget,form=new FormData(element);
    const payload=mode==='request'?{email:form.get('email')}:{password:form.get('password'),confirmPassword:form.get('confirmPassword')};
    if(mode==='reset' && payload.password!==payload.confirmPassword){setMessage('Both passwords must match.');setBusy(false);return;}
    const response=await formRequest(`/api/admin/${mode==='request'?'forgot':'reset'}-password`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const body=await response.json().catch(()=>({}));setBusy(false);
    if(!response.ok){setMessage(response.status===401?'Your session has expired. Request a new reset link.':body.error||'Could not complete this request. Please try again.');return;}
    element.reset();setDone(true);
    if(body.signOutPending)setMessage('Password changed, but sign-out could not be confirmed. Use Sign out on Dashboard before signing in again.');
  }
  if(done)return <div className="form-card" role="status">
    <h2>{mode==='request'?'Check your email':'Password updated'}</h2>
    <p>{mode==='request'?'If this email belongs to an account, a reset link will be sent. Check Inbox and Spam. Open the newest link in this same browser and device.':'Sign in again with your new password.'}</p>
    {mode==='request'&&<p>If nothing arrives after a few minutes, contact the site owner. Email delivery and request limits may prevent a new link.</p>}
    {message&&<p>{message}</p>}
    <Link className="text-link" href="/admin/login">Back to sign in →</Link>
  </div>;
  return <form className="form-card admin-login" onSubmit={submit}>
    {mode==='request'?<label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required/></label>:<>
      <label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label>
      <label>Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label>
      <p>Use 12–128 characters. Choose a unique password or passphrase.</p>
    </>}
    <button className="button button-dark" disabled={busy}>{busy?'Please wait…':mode==='request'?'Send reset link':'Save new password'}</button>
    {message&&<p className="form-message error" role="alert">{message}</p>}
    <Link className="text-link" href={mode==='request'?'/admin/login':'/admin/forgot-password'}>{mode==='request'?'Back to sign in':'Request a new reset link'}</Link>
  </form>;
}
