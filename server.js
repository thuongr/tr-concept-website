import express from 'express';
import Database from 'better-sqlite3';
import { sendOrderConfirmationEmail } from './emailService.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'brain.db'));

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
  CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(customer_email);
`);

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