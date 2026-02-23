import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, formTitle, formLink } = await req.json();

    if (!email || !formTitle || !formLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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
            <a href="${formLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
              Accept Invitation
            </a>
          </div>
          <p style="font-size: 12px; color: #6b7280; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            If you don't have an account, you will need to sign up first using this email address to access the form.
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
