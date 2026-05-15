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

async function send({ email, subject, html }) {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Account Activation',
    html,
  });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
  <h1>Reset Password</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Password Reset',
    html,
  });
}

function sendEmailChangeNotification(email, message) {
  return send({
    email,
    subject: 'Security Alert: Email Change Request',
    html: `<p>${message}</p>`,
  });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangeNotification,
};
