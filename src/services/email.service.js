import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function send(email, subject, html) {
  await transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

async function sendActivationEmail(email, token) {
  const href = `http://localhost:${process.env.PORT}/activate/${token}`;
  const html = `
    <h1>Activate account</h1>
    <a href=${href}>${href}</a>
  `;

  await send(email, 'Activate', html);
}

export const emailService = {
  sendActivationEmail,
};
