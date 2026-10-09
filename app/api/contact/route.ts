import { findOrCreateContact } from "@/lib/contact-identity";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendLoggedEmail } from "@/lib/logged-email";
import { escapeHtml, isValidEmail } from "@/lib/validation";
const clean = (value: unknown, max=4000) => typeof value === "string" ? value.trim().slice(0,max) : "";
export async function POST(request: Request) {
  const body = await request.json().catch(()=>null);
  const name=clean(body?.name,120), email=clean(body?.email,254).toLowerCase(), business=clean(body?.business,200), message=clean(body?.message);
  const type=["solve","build","general"].includes(body?.type)?body.type:"general";
  if(!name || !isValidEmail(email) || !message) return NextResponse.json({error:"Please complete the required fields."},{status:400});
  const supabase=createSupabaseAdminClient();
  if(!supabase) return NextResponse.json({error:"Website forms are not configured yet."},{status:503});
  const {data:contact,error:contactError}=await findOrCreateContact(supabase,{name,email,business_name:business||null});
  if(contactError||!contact) return NextResponse.json({error:"Could not save your enquiry."},{status:500});
  const {data:submission,error:submissionError}=await supabase.from("form_submissions").insert({contact_id:contact.id,form_type:type.toUpperCase(),source_page:"/contact",payload_json:{name,message,business}}).select("id").single();
  if(submissionError||!submission) return NextResponse.json({error:"Could not save your message. Please try again."},{status:500});
  const mail=await sendLoggedEmail(supabase,{contactId:contact.id,submissionId:submission.id,emailType:"ENQUIRY_ACKNOWLEDGEMENT",to:email,subject:"We received your TRConcept enquiry",html:`<p>Hi ${escapeHtml(name)},</p><p>Thanks for getting in touch. Your message has been received.</p><p>Thương<br/>TRConcept</p>`});
  // Independent owner notification: failure must not undo the saved enquiry or receipt.
  await sendLoggedEmail(supabase,{
    contactId:contact.id,submissionId:submission.id,emailType:"ENQUIRY_OWNER_NOTIFICATION",
    to:process.env.CONTACT_NOTIFICATION_EMAIL || "hello@trconcept.co",replyTo:email,
    subject:`TRConcept — new ${type} enquiry`,
    html:`<p>A new website enquiry has been saved.</p><p><strong>Name:</strong> ${escapeHtml(name)}<br/><strong>Email:</strong> ${escapeHtml(email)}<br/><strong>Business:</strong> ${escapeHtml(business)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p><p>Reference: ${escapeHtml(submission.id)}</p><p>Reply to this email to respond to the enquirer, or review it in Admin → Form submissions.</p>`,
  });
  return NextResponse.json({ok:true,emailSent:mail.ok});
}
