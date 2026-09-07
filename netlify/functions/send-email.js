export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const dataBody = JSON.parse(event.body || '{}');
    const {
      customerEmail,
      customerName,
      customerPhone,
      customerBusiness,
      selectedProgram,
      customerChallenge
    } = dataBody;

    const normalizedEmail = typeof customerEmail === 'string' ? customerEmail.trim() : '';
    const normalizedPhone = typeof customerPhone === 'string' ? customerPhone.trim() : '';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\+?[\d\s().-]{7,20}$/;

    if (!emailPattern.test(normalizedEmail)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Please provide a valid email address' })
      };
    }

    const phoneDigits = normalizedPhone.replace(/\D/g, '');
    if (!phonePattern.test(normalizedPhone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Phone number must contain between 7 and 15 digits' })
      };
    }

    const websiteApiUrl = (process.env.WEBSITE_API_URL || 'https://api.trconcept.co').replace(/\/$/, '');
    const registrationResponse = await fetch(`${websiteApiUrl}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        customerEmail: normalizedEmail,
        customerPhone: normalizedPhone,
        customerBusiness,
        selectedProgram,
        customerChallenge
      })
    });
    const registrationResult = await registrationResponse.json();
    if (!registrationResponse.ok || !registrationResult.success) {
      console.error('Không thể lưu registration vào website API:', registrationResult);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Registration could not be saved',
          message: registrationResult.message || registrationResult.error || 'Website API rejected the registration'
        })
      };
    }

    const firstName = customerName ? customerName.trim().split(' ')[0] : 'bạn';
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Helper gửi mail qua Resend HTTP API trực tiếp (nhanh, chuẩn xác, không kén module)
    const sendResendEmail = async (payload) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    };

    // 1. Gửi Email 1 (Welcome & Cảm ơn) cho khách hàng
    const customerPayload = {
      from: 'Thương từ TR Concept <hi@trconcept.co>',
      to: [normalizedEmail],
      subject: 'Thank you for registering with TR Concept',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C2C2C; max-width: 600px; margin: 0 auto; padding: 24px; line-height: 1.6;">
          <p>Hi ${firstName},</p>

          <p>Thank you for registering your interest in ${selectedProgram || 'our program'}.</p>
          <p>We’ve received your registration details. Thuong will contact you within the next 24 hours for a short conversation about your goals and to make sure the program is the right fit for you.</p>
          <p>No payment is required at this stage. Your registration is currently being reviewed.</p>
          <p>If you have any urgent questions, simply reply to this email.</p>
          
          <p style="margin-top: 24px;">
            Warm regards,<br>
            <strong>Thuong Rejeehan &amp; The Fox Circus Team</strong>
          </p>
        </div>
      `
    };

    // 2. Gửi Email Thông Báo có khách mới cho Thương (thuongrejeehan@gmail.com)
    const adminPayload = {
      from: 'TR Concept <hi@trconcept.co>',
      to: ['thuongrejeehan@gmail.com'],
      reply_to: normalizedEmail,
      subject: `[TR Concept] Hoc vien moi dang ky: ${customerName || 'Khach hang'} - ${selectedProgram || 'AI Course'}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C2C2C; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; line-height: 1.6;">
          <h2 style="color: #0F172A; margin-top: 0; padding-bottom: 12px; border-bottom: 2px solid #38BDF8;">🎉 Có Học Viên Mới Đăng Ký!</h2>
          <p style="font-size: 14px; color: #64748B;">Thông tin chi tiết được gửi tự động từ landing page trconcept.co:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
            <tr style="background: #F8FAFC;">
              <td style="padding: 10px; font-weight: 600; width: 40%; border: 1px solid #E2E8F0;">Họ và tên:</td>
              <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #0284C7;">${customerName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; border: 1px solid #E2E8F0;">Email:</td>
              <td style="padding: 10px; border: 1px solid #E2E8F0;"><a href="mailto:${customerEmail}">${customerEmail}</a></td>
            </tr>
            <tr style="background: #F8FAFC;">
              <td style="padding: 10px; font-weight: 600; border: 1px solid #E2E8F0;">Số điện thoại / WhatsApp:</td>
              <td style="padding: 10px; border: 1px solid #E2E8F0;"><strong>${customerPhone || 'N/A'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; border: 1px solid #E2E8F0;">Doanh nghiệp / Lĩnh vực:</td>
              <td style="padding: 10px; border: 1px solid #E2E8F0;">${customerBusiness || 'N/A'}</td>
            </tr>
            <tr style="background: #F8FAFC;">
              <td style="padding: 10px; font-weight: 600; border: 1px solid #E2E8F0;">Khóa học quan tâm:</td>
              <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #4F46E5;">${selectedProgram || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; border: 1px solid #E2E8F0;">Mục tiêu / Ghi chú:</td>
              <td style="padding: 10px; border: 1px solid #E2E8F0;">${customerChallenge || 'Không có'}</td>
            </tr>
          </table>

            <p style="font-size: 12px; color: #94A3B8; margin-top: 20px;">Thời gian đăng ký: ${new Date().toLocaleString('vi-VN', { timeZone: 'Australia/Sydney' })} (AEST - Giờ Úc)</p>
        </div>
      `
    };

    const [customerRes, adminRes] = await Promise.allSettled([
      sendResendEmail(customerPayload),
      sendResendEmail(adminPayload)
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        registrationId: registrationResult.registrationId,
        customerResult: customerRes,
        adminResult: adminRes
      })
    };
  } catch (err) {
    console.error('Lỗi send-email function:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};