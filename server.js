import express from 'express';
import Database from 'better-sqlite3';
import { sendOrderConfirmationEmail } from './emailService.js';

const app = express();
app.use(express.json());

const db = new Database('brain.db');

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

app.listen(3000, () => {
  console.log('Server admin đang chạy tại http://localhost:3000');
});