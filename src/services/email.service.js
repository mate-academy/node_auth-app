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

export function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_URL}/activate/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href=${href}>${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate your account',
  });
}

function sendResetPassEmail(email) {
  const href = `${process.env.CLIENT_URL}/resetPassword`;
  const html = `
  <h1>Password Reset Email</h1>
  <a href=${href}>${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Reset Your Password',
  });
}

function sendChangeEmail(email) {
  const href = `${process.env.CLIENT_URL}/newEmail/${email}`;
  const html = `
  <h1>Change Email</h1>
  <a href=${href}>${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Change Your Email',
  });
}

function sendOldEmailNotUsed(email) {
  const href = `${process.env.CLIENT_URL}/login`;
  const html = `
  <h1>This email is no longer in use</h1>
  <a href=${href}>${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Email was changed',
  });
}

export const emailService = {
  sendActivationEmail,
  sendResetPassEmail,
  sendChangeEmail,
  sendOldEmailNotUsed,
  send,
};
