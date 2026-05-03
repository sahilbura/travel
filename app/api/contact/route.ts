import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ContactEmail } from '@/lib/emails/ContactEmail';

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      // IMPORTANT: Replace with your own domain and email address.
      // The 'from' address must be a verified domain in your Resend account.
      from: 'Contact Form <onboarding@resend.dev>',
      to: ['khandelwalnaman0101@gmail.com'], // The email address where you want to receive messages
      subject: `New Message from ${name}: ${subject}`,
      react: await ContactEmail({ name, email, subject, message }),
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ message: 'Error sending email.', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Thank you! Your message has been sent successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}