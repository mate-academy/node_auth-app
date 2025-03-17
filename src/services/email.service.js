import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    from: '"Test Test 👻" <manka2764@gmail.com>',
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `http://localhost:3005/activate/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}" target="_blank">${href}</a>
  `;

  return send({ email, subject: 'Account activation', html });
}

function sendResetPasswordEmail(email, token) {
  const href = `http://localhost:3005/reset/${token}`;
  const html = `
  <h1>Reset password</h1>
  <a href="${href}" target="_blank">${href}</a>
  `;

  return send({ email, subject: 'Reset password', html });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
};
