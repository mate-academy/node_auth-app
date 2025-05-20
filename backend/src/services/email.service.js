import 'dotenv/config.js';
import { createTransport } from 'nodemailer';

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function send(email, subject, html) {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const subject = 'Account Activation';
  const html = `
    <div>
      <h1>Welcome to our service!</h1>
      <p>To activate your account, please click the link below:</p>
      <a href="${href}">${href}</a>
    </div>
  `;

  return send(email, subject, html);
}

export const emailService = {
  send,
  sendActivationEmail,
};
