import 'dotenv/config';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
} as SMTPTransport.Options);

export function sendActivationEmail(email: string) {
  return transporter.sendMail({
    to: email,
    subject: 'Activate account',
    text: 'Hello!! Your account has been activated.',
    html: '<b>Hello. Your account has been activated.</b>',
  });
}
