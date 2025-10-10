import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function send({ email, subject, html }) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    text: '',
    html,
  });
}

export function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activation account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Activate' });
}

export function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
  <h1>Reset password</h1>
  <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Reset password' });
}

export function sendEmailChangeToken(email, token) {
  const href = `${process.env.CLIENT_HOST}/change-email/${token}`;
  const html = `
    <h1>Зміна email</h1>
    <p>Хтось намагається змінити вашу електронну пошту. Якщо це не ви — нічого не робіть.
    Якщо це ви — підтвердьте зміну, перейшовши за посиланням:</p>
    <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Підтвердження зміни email' });
}
