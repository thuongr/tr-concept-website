import { Resend } from 'resend';

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const dataBody = JSON.parse(event.body);
    const { customerEmail, customerName } = dataBody;
    const firstName = customerName ? customerName.split(' ')[0] : 'bạn';

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'Thương từ TR Concept <hi@trconcept.co>',
      to: [customerEmail],
      subject: 'Welcome to AI for Real Work',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C2C2C; max-width: 600px; margin: 0 auto; padding: 24px; line-height: 1.6;">
          <p>Hi ${firstName},</p>
          
          <p>Welcome to AI for Real Work — I’m glad to have you with us.</p>
          
          <p>I’m Thương, and I help business owners use AI in practical ways to work smarter, save time, and improve how their business operates.</p>
          
          <p>I’ve received your registration and will personally contact you within the next 24 hours with the next steps.</p>
          
          <p>In the meantime, think of one real task you’d love AI to help you with. We’ll start there.</p>
          
          <p>Looking forward to working with you.</p>
          
          <p style="margin-top: 24px;">
            Warmly,<br>
            <strong>Thương Rejeehan</strong>
          </p>
        </div>
      `,
    });

    if (error) {
      return { statusCode: 400, body: JSON.stringify({ success: false, error }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
  }
};