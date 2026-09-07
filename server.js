import express from 'express';
import Database from 'better-sqlite3';
import { sendOrderConfirmationEmail } from './emailService.js';
import { buildPaymentConfirmedEmail, buildClassScheduleEmail, preparationFileFor, sendClassEmail } from './classEmailService.js';
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
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    business TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    registration_id INTEGER REFERENCES registrations(id),
    program_name TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'AUD',
    status TEXT NOT NULL DEFAULT 'processing',
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
if (!registrationColumns.includes('customer_id')) {
  db.exec('ALTER TABLE registrations ADD COLUMN customer_id INTEGER REFERENCES customers(id)');
}
if (!registrationColumns.includes('order_id')) {
  db.exec('ALTER TABLE registrations ADD COLUMN order_id INTEGER REFERENCES orders(id)');
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[\d\s().-]{7,20}$/;

function getProgramPrice(programName) {
  const normalized = programName.toLowerCase();
  if (normalized.includes('business builder') || normalized.includes('level 2')) return 450;
  if (normalized.includes('retreat')) return 450;
  return 150;
}

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
  const phoneDigits = registration.customerPhone.replace(/\D/g, '');
  if (!phonePattern.test(registration.customerPhone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
    return { error: 'customerPhone must contain between 7 and 15 digits' };
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
    const result = db.transaction(() => {
      const existingCustomer = db.prepare('SELECT id FROM customers WHERE email = ?').get(value.customerEmail);
      const customerId = existingCustomer?.id || Number(db.prepare(`
        INSERT INTO customers (name, email, phone, business) VALUES (?, ?, ?, ?)
      `).run(value.customerName, value.customerEmail, value.customerPhone, value.customerBusiness).lastInsertRowid);
      if (existingCustomer) {
        db.prepare('UPDATE customers SET name = ?, phone = ?, business = ?, updated_at = datetime(\'now\') WHERE id = ?')
          .run(value.customerName, value.customerPhone, value.customerBusiness, customerId);
      }

      const registrationId = Number(db.prepare(`
        INSERT INTO registrations (
          customer_name, customer_email, customer_phone, customer_business,
          selected_program, customer_challenge, customer_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(value.customerName, value.customerEmail, value.customerPhone, value.customerBusiness, value.selectedProgram, value.customerChallenge, customerId).lastInsertRowid);
      const orderId = Number(db.prepare(`
        INSERT INTO orders (customer_id, registration_id, program_name, amount, status)
        VALUES (?, ?, ?, ?, 'processing')
      `).run(customerId, registrationId, value.selectedProgram, getProgramPrice(value.selectedProgram)).lastInsertRowid);
      db.prepare('UPDATE registrations SET order_id = ? WHERE id = ?').run(orderId, registrationId);
      db.prepare(`INSERT INTO audit_logs (actor_type, actor_id, action, target_type, target_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?)`)
        .run('system', 'registration-api', 'registration.created', 'registration', String(registrationId), JSON.stringify({ customer_id: customerId, order_id: orderId }));
      return { registrationId, customerId, orderId };
    })();

    return res.status(201).json({
      success: true,
      message: 'Registration saved successfully',
      registrationId: result.registrationId,
      customerId: result.customerId,
      orderId: result.orderId,
      orderStatus: 'processing'
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
              selected_program, customer_challenge, status, payment_status, order_id,
              follow_up_sent_at, created_at
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

app.get('/api/customers', (_req, res) => {
  try {
    const customers = db.prepare(`
      SELECT c.id, c.name, c.email, c.phone, c.business, c.created_at,
             s.id AS student_id, s.student_status
      FROM customers c
      LEFT JOIN students s ON s.customer_email = c.email
      ORDER BY datetime(c.created_at) DESC, c.id DESC
    `).all();
    return res.json({ success: true, customers });
  } catch (error) {
    console.error(new Date().toISOString(), 'customer.list.error', error);
    return res.status(500).json({ success: false, error: 'Customer read failed' });
  }
});

app.get('/api/orders', (_req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.id, o.customer_id, o.registration_id, c.name AS customer_name,
             c.email AS customer_email, o.program_name, o.amount, o.currency,
             o.status, o.created_at, o.updated_at
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      ORDER BY datetime(o.created_at) DESC, o.id DESC
    `).all();
    return res.json({ success: true, orders });
  } catch (error) {
    console.error(new Date().toISOString(), 'order.list.error', error);
    return res.status(500).json({ success: false, error: 'Order read failed' });
  }
});

app.get('/api/students', (_req, res) => {
  try {
    const students = db.prepare(`
      SELECT s.id, s.customer_email, s.student_status, s.telegram_user_id,
             s.telegram_username, c.name, c.phone,
             COUNT(cm.id) AS class_count
      FROM students s
      LEFT JOIN customers c ON c.email = s.customer_email
      LEFT JOIN class_members cm ON cm.student_id = s.id AND cm.membership_status = 'active'
      GROUP BY s.id
      ORDER BY s.id DESC
    `).all();
    return res.json({ success: true, students });
  } catch (error) {
    console.error(new Date().toISOString(), 'student.list.error', error);
    return res.status(500).json({ success: false, error: 'Student read failed' });
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

app.post('/api/registrations/:id/mark-paid', async (req, res) => {
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
      if (registration.order_id) {
        db.prepare("UPDATE orders SET status = 'completed', updated_at = datetime('now') WHERE id = ?").run(registration.order_id);
      }

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

    let emailStatus = 'not_sent';
    if (result.class_id && process.env.RESEND_API_KEY) {
      try {
        const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(registrationId);
        const classInfo = db.prepare('SELECT * FROM classes WHERE id = ?').get(result.class_id);
        const paymentEmail = buildPaymentConfirmedEmail(registration, classInfo);
        const preparation = preparationFileFor(registration.selected_program, __dirname);
        const scheduleEmail = buildClassScheduleEmail(registration, classInfo, preparation.name);
        const paymentResponse = await sendClassEmail({
          apiKey: process.env.RESEND_API_KEY,
          from: process.env.EMAIL_FROM || 'Thuong Rejeehan & The Fox Circus Team <hi@trconcept.co>',
          to: registration.customer_email,
          ...paymentEmail
        });
        const scheduleResponse = await sendClassEmail({
          apiKey: process.env.RESEND_API_KEY,
          from: process.env.EMAIL_FROM || 'Thuong Rejeehan & The Fox Circus Team <hi@trconcept.co>',
          to: registration.customer_email,
          ...scheduleEmail,
          attachmentPath: preparation.path,
          attachmentName: preparation.name
        });
        db.prepare(`INSERT INTO email_events (registration_id, student_id, class_id, email_type, recipient_email, provider_message_id, status, sent_at) VALUES (?, ?, ?, ?, ?, ?, 'sent', datetime('now'))`)
          .run(registrationId, result.student_id, result.class_id, 'payment_confirmed', registration.customer_email, paymentResponse.id || null);
        db.prepare(`INSERT INTO email_events (registration_id, student_id, class_id, email_type, recipient_email, provider_message_id, status, sent_at) VALUES (?, ?, ?, ?, ?, ?, 'sent', datetime('now'))`)
          .run(registrationId, result.student_id, result.class_id, 'class_schedule', registration.customer_email, scheduleResponse.id || null);
        emailStatus = 'sent';
      } catch (emailError) {
        console.error(new Date().toISOString(), 'registration.mark_paid.email.error', emailError);
        emailStatus = 'failed';
      }
    }
    return res.json({ success: true, message: 'Registration marked paid', email_status: emailStatus, ...result });
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