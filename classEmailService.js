import fs from 'node:fs';
import path from 'node:path';

const signature = 'Thuong Rejeehan & The Fox Circus Team';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

export function firstName(name) {
  return String(name || 'there').trim().split(/\s+/)[0] || 'there';
}

export function buildRegistrationReceivedEmail(registration) {
  const name = escapeHtml(firstName(registration.customer_name));
  return {
    subject: 'Thank you for registering with TR Concept',
    html: `<p>Hi ${name},</p><p>Thank you for registering your interest in ${escapeHtml(registration.selected_program)}.</p><p>We’ve received your registration details. Thuong will contact you within the next 24 hours for a short conversation about your goals and to make sure the program is the right fit for you.</p><p>No payment is required at this stage. Your registration is currently being reviewed.</p><p>If you have any urgent questions, simply reply to this email.</p><p>Warm regards,<br>${signature}</p>`
  };
}

export function buildPaymentConfirmedEmail(registration, classInfo) {
  const name = escapeHtml(firstName(registration.customer_name));
  return {
    subject: `Payment received - ${classInfo.name}`,
    html: `<p>Hi ${name},</p><p>We’ve received and confirmed your payment.</p><p>Your place is now confirmed in <strong>${escapeHtml(classInfo.name)}</strong>.</p><p>Your class schedule, Google Meet link, and preparation details are included below.</p><p>Warm regards,<br>${signature}</p>`
  };
}

export function buildClassScheduleEmail(registration, classInfo, attachmentName) {
  const name = escapeHtml(firstName(registration.customer_name));
  return {
    subject: `${classInfo.name} - class details`,
    html: `<p>Hi ${name},</p><p>Your place in <strong>${escapeHtml(classInfo.name)}</strong> is confirmed.</p><p><strong>Date/time:</strong> ${escapeHtml(classInfo.start_at)}${classInfo.end_at ? ` - ${escapeHtml(classInfo.end_at)}` : ''}<br><strong>Timezone:</strong> ${escapeHtml(classInfo.timezone)}</p><p><strong>Google Meet:</strong> <a href="${escapeHtml(classInfo.meeting_url || '')}">${escapeHtml(classInfo.meeting_url || 'Link will follow')}</a></p><p>Please read the attached preparation file before the first session.</p><p><strong>Preparation file:</strong> ${escapeHtml(attachmentName)}</p><p>Warm regards,<br>${signature}</p>`
  };
}

export async function sendClassEmail({ apiKey, from, to, subject, html, attachmentPath, attachmentName }) {
  const payload = { from, to: [to], subject, html };
  if (attachmentPath && fs.existsSync(attachmentPath)) {
    payload.attachments = [{ filename: attachmentName || path.basename(attachmentPath), content: fs.readFileSync(attachmentPath).toString('base64') }];
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || `Resend returned ${response.status}`);
  return body;
}

export function preparationFileFor(programName, projectRoot) {
  const level = String(programName).toLowerCase().includes('business builder') || String(programName).toLowerCase().includes('level 2') ? 'level-2-preparation.txt' : 'level-1-preparation.txt';
  return { path: path.join(projectRoot, 'assets', level), name: level };
}