/* eslint-disable no-console */
import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function send({ email, subject, html }) {
  console.log('📤 Sending email to:', email);

  console.log('SMTP config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
  });

  try {
    const info = await transporter.sendMail({
      from: `"No Reply" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    });

    console.log('✅ Email sent:', info.response);

    return info;
  } catch (err) {
    console.error('❌ Email send error:', err);
    throw err;
  }
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activate account</h2>
  <a href=${href}>${href}</a>
  `;

  return send({ email, html, subject: 'Activate' });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
  <h1>Reset a password</h2>
  <a href=${href}>${href}</a>
  `;

  return send({ email, html, subject: 'Reset your account password' });
}

export const emailService = {
  sendActivationEmail,
  send,
  sendResetPasswordEmail,
};
