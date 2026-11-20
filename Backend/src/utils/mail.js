import nodemailer from 'nodemailer';

/** Sends mail through SMTP, or logs it when SMTP is not configured (local development). */
export async function sendMail({ to, subject, text }) {
  if (!process.env.SMTP_HOST) {
    console.log(`[mail not configured] To: ${to}\nSubject: ${subject}\n${text}`);
    return;
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transport.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
}
