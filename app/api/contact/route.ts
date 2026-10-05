import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email";
import { escapeHtml, isValidEmail } from "@/lib/validation";
const clean = (value: unknown, max=4000) => typeof value === "string" ? value.trim().slice(0,max) : "";
export async function POST(request: Request) {
  const body = await request.json().catch(()=>null);
  const name=clean(body?.name,120), email=clean(body?.email,254).toLowerCase(), business=clean(body?.business,200), message=clean(body?.message);
  const type=["solve","build","general"].includes(body?.type)?body.type:"general";
  if(!name || !isValidEmail(email) || !message) return NextResponse.json({error:"Please complete the required fields."},{status:400});
  const supabase=createSupabaseAdminClient();
  if(!supabase) return NextResponse.json({error:"Website forms are not configured yet."},{status:503});
  const {data:contact,error:contactError}=await supabase.from("contacts").upsert({name,email,business_name:business||null},{onConflict:"email"}).select("id").single();
  if(contactError||!contact) return NextResponse.json({error:"Could not save your enquiry."},{status:500});
  const {data:submission,error:submissionError}=await supabase.from("form_submissions").insert({contact_id:contact.id,form_type:type.toUpperCase(),source_page:"/contact",payload_json:{message,business}}).select("id").single();
  if(submissionError||!submission) return NextResponse.json({error:"Could not save your message. Please try again."},{status:500});
  const mail=await sendTransactionalEmail({to:email,subject:"We received your TRConcept enquiry",html:`<p>Hi ${escapeHtml(name)},</p><p>Thanks for getting in touch. Your message has been received.</p><p>Thương<br/>TRConcept</p>`});
  await supabase.from("email_logs").insert({contact_id:contact.id,submission_id:submission.id,email_type:"ENQUIRY_ACKNOWLEDGEMENT",recipient_email:email,provider:"RESEND",provider_message_id:mail.ok?mail.id:null,status:mail.ok?"SENT":"FAILED",error_message:mail.ok?null:mail.error,sent_at:mail.ok?new Date().toISOString():null});
  return NextResponse.json({ok:true,emailSent:mail.ok});
}
