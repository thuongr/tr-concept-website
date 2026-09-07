import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { buildClassScheduleEmail, sendClassEmail, preparationFileFor } from './classEmailService.js';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(projectRoot, 'brain.db'));
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || 'Thuong Rejeehan & The Fox Circus Team <hi@trconcept.co>';

async function run() {
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
  const upcoming = db.prepare(`
    SELECT cm.class_id, s.customer_email, r.id AS registration_id,
           r.customer_name, r.selected_program, c.name, c.start_at, c.end_at,
           c.timezone, c.meeting_url
    FROM class_members cm
    JOIN students s ON s.id = cm.student_id
    JOIN registrations r ON r.student_id = s.id AND r.payment_status = 'paid'
    JOIN classes c ON c.id = cm.class_id
    WHERE cm.membership_status = 'active'
      AND c.status = 'scheduled'
      AND datetime(c.start_at) BETWEEN datetime('now', '+47 hours') AND datetime('now', '+49 hours')
  `).all();

  for (const registration of upcoming) {
    const eventType = 'class_preparation_48h';
    const sent = db.prepare('SELECT id FROM email_events WHERE class_id = ? AND student_id = (SELECT id FROM students WHERE customer_email = ?) AND email_type = ? LIMIT 1')
      .get(registration.class_id, registration.customer_email, eventType);
    if (sent) continue;
    const preparation = preparationFileFor(registration.selected_program, projectRoot);
    const email = buildClassScheduleEmail(registration, registration, preparation.name);
    try {
      const response = await sendClassEmail({ apiKey, from, to: registration.customer_email, ...email, attachmentPath: preparation.path, attachmentName: preparation.name });
      db.prepare(`INSERT INTO email_events (registration_id, class_id, email_type, recipient_email, provider_message_id, status, sent_at) VALUES (?, ?, ?, ?, ?, 'sent', datetime('now'))`)
        .run(registration.registration_id, registration.class_id, eventType, registration.customer_email, response.id || null);
    } catch (error) {
      db.prepare(`INSERT INTO email_events (registration_id, class_id, email_type, recipient_email, status) VALUES (?, ?, ?, ?, 'failed')`)
        .run(registration.registration_id, registration.class_id, eventType, registration.customer_email);
      console.error(new Date().toISOString(), 'scheduler.email.error', error);
    }
  }
}

run().finally(() => db.close());