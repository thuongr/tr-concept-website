import fetch, { Headers } from 'node-fetch';
if (!global.Headers) {
  global.Headers = Headers;
}

import { Resend } from 'resend';

const resend = new Resend('re_123456789_re_KysvCdu3_NwKfUhPdWKpVFLWFor1kdznk');
export async function sendOrderConfirmationEmail({ customerEmail, customerName, productName, totalAmount, orderId, fulfillmentInstructions }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'TR Concept <donhang@trconcept.co>',
      to: [customerEmail],
      subject: `[TR Concept] Xác nhận đơn hàng #${orderId} thành công!`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2C2C2C; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E5E5; border-radius: 8px;">
          <h2 style="color: #1A1A1A; font-weight: 500; margin-bottom: 16px;">Xin chào ${customerName},</h2>
          <p style="font-size: 15px; line-height: 1.6;">Cảm ơn bạn đã lựa chọn sản phẩm thủ công từ TR Concept. Đơn hàng của bạn đã được ghi nhận và đang chuẩn bị được xử lý.</p>
          <div style="background-color: #F9F9F7; padding: 16px 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 6px 0; font-size: 14px;"><strong>Mã đơn hàng:</strong> #${orderId}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Sản phẩm:</strong> ${productName}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Tổng thanh toán:</strong> ${Number(totalAmount).toLocaleString('vi-VN')} đ</p>
          </div>
          <h3 style="font-size: 16px; color: #1A1A1A; margin-top: 24px;">Hướng dẫn nhận hàng:</h3>
          <p style="font-size: 15px; line-height: 1.6; background-color: #FFF; border-left: 3px solid #6B705C; padding-left: 12px; margin-top: 8px;">
            ${fulfillmentInstructions}
          </p>
          <p style="font-size: 15px; line-height: 1.6; margin-top: 24px;">Nếu bạn có bất kỳ thắc mắc nào về đơn hàng, đừng ngần ngại phản hồi lại email này để chúng mình hỗ trợ ngay nhé.</p>
          <p style="margin-top: 32px; font-size: 15px;">Thân mến,<br><strong>Đội ngũ TR Concept</strong></p>
        </div>
      `,
    });

    if (error) {
      console.error('Lỗi khi gửi email qua Resend:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Lỗi hệ thống khi gửi email:', err);
    return { success: false, error: err };
  }
}