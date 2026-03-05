import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, reason: 'Email service not configured' }, { status: 200 });
  }

  try {
    const { recipientEmail, formTitle, responsePageUrl } = await req.json();

    if (!recipientEmail || !formTitle || !responsePageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const resend = new Resend(apiKey);

    // Resend test-mode (onboarding@resend.dev) only allows sending to the
    // account holder's email. Use NOTIFICATION_EMAIL env var to override the
    // recipient during development. In production with a verified domain,
    // remove this env var and emails go to the actual form owner.
    const notificationOverride = process.env.NOTIFICATION_EMAIL;
    const toEmail = notificationOverride || recipientEmail;

    const { data: sendData, error } = await resend.emails.send({
      from: 'Formcraft <onboarding@resend.dev>',
      to: [toEmail],
      subject: `New response received: ${formTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
          <h2 style="margin: 0 0 12px; color: #111827;">New form response</h2>
          <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
            You received a new response for <strong>${formTitle}</strong>.
          </p>
          <a href="${responsePageUrl}" style="display: block; background: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 700; text-align: center; max-width: 200px;">
            View responses
          </a>
        </div>
      `,
    });

    if (error) {
      console.error('[response-notification] Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[response-notification] Email sent successfully to', toEmail, '| id:', sendData?.id);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
