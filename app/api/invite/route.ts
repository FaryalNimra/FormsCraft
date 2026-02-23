import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('ERROR: RESEND_API_KEY is missing from environment variables');
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  try {
    const { email, formTitle, formLink } = await req.json();

    if (!email || !formTitle || !formLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`Attempting to send invitation to ${email} for form "${formTitle}"`);

    const { data, error } = await resend.emails.send({
      from: 'Formcraft <onboarding@resend.dev>',
      to: [email],
      subject: `Invitation to collaborate on "${formTitle}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 16px;">Collaboration Invitation</h1>
          <p style="font-size: 16px; color: #374151; line-height: 1.5;">
            You have been invited to collaborate on the form <strong>"${formTitle}"</strong> on Formcraft.
          </p>
          <div style="margin: 32px 0;">
            <a href="${formLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="font-size: 12px; color: #6b7280; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            If you don't have an account, you will need to sign up first using this email address to access the form.
          </p>
          <p style="font-size: 10px; color: #9ca3af; margin-top: 8px;">
            Sent via Formcraft Email Service.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({
        error: error.message,
        code: (error as any).code,
        hint: 'If you are using a free Resend account, you may need to verify your domain or send only to your own email.'
      }, { status: 400 });
    }

    console.log('Invitation email sent successfully:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Internal server error in invite API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
