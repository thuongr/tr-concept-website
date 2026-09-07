import express from 'express';
import Database from 'better-sqlite3';
import { sendOrderConfirmationEmail } from './emailService.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'brain.db'));
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_business TEXT,
    selected_program TEXT NOT NULL,
    customer_challenge TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    follow_up_sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_email TEXT NOT NULL UNIQUE,
    student_status TEXT NOT NULL DEFAULT 'pending_payment',
    telegram_user_id TEXT,
    telegram_username TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    program_level TEXT NOT NULL,
    max_students INTEGER NOT NULL DEFAULT 5 CHECK (max_students BETWEEN 1 AND 5),
    start_at TEXT NOT NULL,
    end_at TEXT,
    timezone TEXT NOT NULL DEFAULT 'Australia/Brisbane',
    meeting_provider TEXT NOT NULL DEFAULT 'google_meet',
    meeting_url TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS class_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    chat_id TEXT NOT NULL,
    chat_name TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    UNIQUE(platform, chat_id)
  );
  CREATE TABLE IF NOT EXISTS class_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    membership_status TEXT NOT NULL DEFAULT 'active',
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(class_id, student_id)
  );
  CREATE TABLE IF NOT EXISTS email_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_id INTEGER REFERENCES registrations(id) ON DELETE SET NULL,
    student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
    class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    email_type TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    provider_message_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_type TEXT NOT NULL,
    actor_id TEXT,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(customer_email);
  CREATE INDEX IF NOT EXISTS idx_classes_start_at ON classes(start_at);
  CREATE INDEX IF NOT EXISTS idx_class_members_student ON class_members(student_id);
  CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(email_type, created_at DESC);
`);

const registrationColumns = db.prepare('PRAGMA table_info(registrations)').all().map((column) => column.name);
if (!registrationColumns.includes('payment_status')) {
  db.exec("ALTER TABLE registrations ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending_payment'");
}
if (!registrationColumns.includes('paid_at')) {
  db.exec('ALTER TABLE registrations ADD COLUMN paid_at TEXT');
}
if (!registrationColumns.includes('student_id')) {
  db.exec('ALTER TABLE registrations ADD COLUMN student_id INTEGER REFERENCES students(id)');
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[\d\s().-]{7,20}$/;

function validateRegistration(input) {
  const registration = {
    customerName: typeof input.customerName === 'string' ? input.customerName.trim() : '',
    customerEmail: typeof input.customerEmail === 'string' ? input.customerEmail.trim().toLowerCase() : '',
    customerPhone: typeof input.customerPhone === 'string' ? input.customerPhone.trim() : '',
    customerBusiness: typeof input.customerBusiness === 'string' ? input.customerBusiness.trim() : '',
    selectedProgram: typeof input.selectedProgram === 'string' ? input.selectedProgram.trim() : '',
    customerChallenge: typeof input.customerChallenge === 'string' ? input.customerChallenge.trim() : ''
  };

  if (!registration.customerName || registration.customerName.length > 120) {
    return { error: 'customerName is required and must be at most 120 characters' };
  }
  if (!emailPattern.test(registration.customerEmail) || registration.customerEmail.length > 254) {
    return { error: 'customerEmail must be a valid email address' };
  }
  if (!phonePattern.test(registration.customerPhone) || registration.customerPhone.replace(/\D/g, '').length < 7) {
    return { error: 'customerPhone must be a valid phone number' };
  }
  if (!registration.selectedProgram || registration.selectedProgram.length > 200) {
    return { error: 'selectedProgram is required and must be at most 200 characters' };
  }
  if (registration.customerBusiness.length > 200 || registration.customerChallenge.length > 2000) {
    return { error: 'customerBusiness or customerChallenge exceeds the allowed length' };
  }

  return { value: registration };
}

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Website API is healthy' });
});

app.post('/api/registrations', (req, res) => {
  const { value, error } = validateRegistration(req.body || {});
  if (error) {
    return res.status(400).json({ success: false, error, message: 'Registration validation failed' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO registrations (
        customer_name, customer_email, customer_phone, customer_business,
        selected_program, customer_challenge
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(
      value.customerName,
      value.customerEmail,
      value.customerPhone,
      value.customerBusiness,
      value.selectedProgram,
      value.customerChallenge
    );

    return res.status(201).json({
      success: true,
      message: 'Registration saved successfully',
      registrationId: Number(result.lastInsertRowid)
    });
  } catch (dbError) {
    console.error(new Date().toISOString(), 'registration.create.error', dbError);
    return res.status(500).json({ success: false, error: 'Database write failed', message: 'Registration was not saved' });
  }
});

app.get('/api/registrations', (req, res) => {
  const limit = Number(req.query.limit || 100);
  const sinceDays = Number(req.query.since_days || 3650);
  if (!Number.isInteger(limit) || limit < 1 || limit > 500 || !Number.isInteger(sinceDays) || sinceDays < 1 || sinceDays > 3650) {
    return res.status(400).json({ success: false, error: 'limit must be 1-500 and since_days must be 1-3650' });
  }

  try {
    const registrations = db.prepare(`
      SELECT id, customer_name, customer_email, customer_phone, customer_business,
             selected_program, customer_challenge, status, follow_up_sent_at, created_at
      FROM registrations
      WHERE datetime(created_at) >= datetime('now', ?)
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT ?
    `).all(`-${sinceDays} days`, limit);
    return res.json({ success: true, registrations });
  } catch (dbError) {
    console.error(new Date().toISOString(), 'registration.list.error', dbError);
    return res.status(500).json({ success: false, error: 'Database read failed' });
  }
});

app.get('/api/classes', (_req, res) => {
  try {
    const classes = db.prepare(`
      SELECT c.*, COUNT(cm.id) AS enrolled_count
      FROM classes c
      LEFT JOIN class_members cm ON cm.class_id = c.id AND cm.membership_status = 'active'
      GROUP BY c.id
      ORDER BY datetime(c.start_at) ASC, c.id ASC
    `).all();
    return res.json({ success: true, classes });
  } catch (error) {
    console.error(new Date().toISOString(), 'class.list.error', error);
    return res.status(500).json({ success: false, error: 'Class read failed' });
  }
});

app.post('/api/classes', (req, res) => {
  const input = req.body || {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const programLevel = typeof input.program_level === 'string' ? input.program_level.trim() : '';
  const startAt = typeof input.start_at === 'string' ? input.start_at.trim() : '';
  const timezone = typeof input.timezone === 'string' ? input.timezone.trim() : 'Australia/Brisbane';
  const maxStudents = Number(input.max_students || 5);

  if (!name || !programLevel || !startAt || !Number.isInteger(maxStudents) || maxStudents < 1 || maxStudents > 5) {
    return res.status(400).json({ success: false, error: 'name, program_level, start_at and max_students (1-5) are required' });
  }

  try {
    const created = db.prepare(`
      INSERT INTO classes (name, program_level, max_students, start_at, end_at, timezone, meeting_provider, meeting_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, programLevel, maxStudents, startAt, input.end_at || null, timezone, input.meeting_provider || 'google_meet', input.meeting_url || null);
    const classId = Number(created.lastInsertRowid);
    db.prepare(`INSERT INTO audit_logs (actor_type, actor_id, action, target_type, target_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?)`)
      .run('admin', 'system', 'class.created', 'class', String(classId), JSON.stringify({ name, programLevel, startAt }));
    return res.status(201).json({ success: true, message: 'Class created', class_id: classId });
  } catch (error) {
    console.error(new Date().toISOString(), 'class.create.error', error);
    return res.status(500).json({ success: false, error: 'Class could not be created' });
  }
});

app.put('/api/classes/:id', (req, res) => {
  const classId = Number(req.params.id);
  if (!Number.isInteger(classId) || classId < 1) {
    return res.status(400).json({ success: false, error: 'Valid class id is required' });
  }

  const fields = {
    name: typeof req.body?.name === 'string' ? req.body.name.trim() : undefined,
    program_level: typeof req.body?.program_level === 'string' ? req.body.program_level.trim() : undefined,
    start_at: typeof req.body?.start_at === 'string' ? req.body.start_at.trim() : undefined,
    end_at: typeof req.body?.end_at === 'string' ? req.body.end_at.trim() : undefined,
    timezone: typeof req.body?.timezone === 'string' ? req.body.timezone.trim() : undefined,
    meeting_provider: typeof req.body?.meeting_provider === 'string' ? req.body.meeting_provider.trim() : undefined,
    meeting_url: typeof req.body?.meeting_url === 'string' ? req.body.meeting_url.trim() : undefined,
    status: typeof req.body?.status === 'string' ? req.body.status.trim() : undefined
  };
  const updates = Object.entries(fields).filter(([, value]) => value !== undefined);
  if (!updates.length) return res.status(400).json({ success: false, error: 'No class fields to update' });

  try {
    const setClause = updates.map(([field]) => `${field} = ?`).join(', ');
    db.prepare(`UPDATE classes SET ${setClause}, updated_at = datetime('now') WHERE id = ?`)
      .run(...updates.map(([, value]) => value), classId);
    db.prepare(`INSERT INTO audit_logs (actor_type, actor_id, action, target_type, target_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?)`)
      .run('admin', 'system', 'class.updated', 'class', String(classId), JSON.stringify(Object.fromEntries(updates)));
    return res.json({ success: true, message: 'Class updated' });
  } catch (error) {
    console.error(new Date().toISOString(), 'class.update.error', error);
    return res.status(500).json({ success: false, error: 'Class could not be updated' });
  }
});

app.post('/api/registrations/:id/mark-paid', (req, res) => {
  const registrationId = Number(req.params.id);
  const requestedClassId = req.body?.class_id ? Number(req.body.class_id) : null;
  if (!Number.isInteger(registrationId) || registrationId < 1 || (requestedClassId !== null && (!Number.isInteger(requestedClassId) || requestedClassId < 1))) {
    return res.status(400).json({ success: false, error: 'Valid registration id and optional class_id are required' });
  }

  try {
    const result = db.transaction(() => {
      const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(registrationId);
      if (!registration) throw new Error('Registration not found');

      let student = db.prepare('SELECT * FROM students WHERE customer_email = ?').get(registration.customer_email);
      if (!student) {
        const createdStudent = db.prepare(`INSERT INTO students (customer_email, student_status) VALUES (?, 'active')`).run(registration.customer_email);
        student = db.prepare('SELECT * FROM students WHERE id = ?').get(createdStudent.lastInsertRowid);
      } else {
        db.prepare("UPDATE students SET student_status = 'active', updated_at = datetime('now') WHERE id = ?").run(student.id);
      }

      db.prepare("UPDATE registrations SET payment_status = 'paid', paid_at = COALESCE(paid_at, datetime('now')), student_id = ?, updated_at = datetime('now') WHERE id = ?")
        .run(student.id, registrationId);

      let classId = requestedClassId;
      if (!classId) {
        const availableClass = db.prepare(`
          SELECT c.id FROM classes c
          LEFT JOIN class_members cm ON cm.class_id = c.id AND cm.membership_status = 'active'
          WHERE (c.program_level = ? OR ? LIKE c.program_level || '%') AND c.status = 'scheduled'
          GROUP BY c.id
          HAVING COUNT(cm.id) < c.max_students
          ORDER BY datetime(c.start_at) ASC, c.id ASC
          LIMIT 1
        `).get(registration.selected_program, registration.selected_program);
        classId = availableClass?.id || null;
      }

      if (classId) {
        const targetClass = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId);
        if (!targetClass) throw new Error('Class not found');
        const enrolled = db.prepare("SELECT COUNT(*) AS count FROM class_members WHERE class_id = ? AND membership_status = 'active'").get(classId).count;
        if (enrolled >= targetClass.max_students) throw new Error('Class is full');
        db.prepare("INSERT OR IGNORE INTO class_members (class_id, student_id, membership_status) VALUES (?, ?, 'active')").run(classId, student.id);
      }

      db.prepare(`INSERT INTO audit_logs (actor_type, actor_id, action, target_type, target_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?)`)
        .run('admin', 'system', 'registration.marked_paid', 'registration', String(registrationId), JSON.stringify({ student_id: student.id, class_id: classId }));
      return { student_id: student.id, class_id: classId };
    })();

    return res.json({ success: true, message: 'Registration marked paid', ...result });
  } catch (error) {
    console.error(new Date().toISOString(), 'registration.mark_paid.error', error);
    return res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/admin/orders', async (req, res) => {
  const { customerName, customerEmail, productId, quantity, totalAmount } = req.body;

  try {
    let productName = "AI for Real Work Course";
    
    const insert = db.prepare(`
      INSERT INTO orders (customer_name, customer_email, product_id, quantity, total_amount, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    const result = insert.run(customerName, customerEmail, productId || 1, quantity || 1, totalAmount);
    const orderId = result.lastInsertRowid;

    await sendOrderConfirmationEmail({
      customerEmail: customerEmail,
      customerName: customerName,
      productName: productName,
      totalAmount: totalAmount,
      orderId: orderId,
      fulfillmentInstructions: 'Payment received for the course. Thương will be in touch within the next 24 hours.'
    });

    return res.status(201).json({
      success: true,
      message: 'Đã thêm đơn hàng và gửi email xác nhận thành công!',
      orderId: orderId
    });

  } catch (error) {
    console.error('Lỗi xử lý đơn hàng:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';

app.listen(port, host, () => {
  console.log(`Website API đang chạy tại http://${host}:${port}`);
});