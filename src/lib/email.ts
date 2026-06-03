import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@yourdomain.com';

/**
 * Send an email using Resend
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML content of the email
 * @returns Promise with the result of the send operation
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Email sending is disabled.');
    return { error: 'Email service not configured' };
  }

  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    return { data, error: null };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}