import 'dotenv/config';
import nodemailer from 'nodemailer';

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
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate',
  });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset/${token}`;
  const html = `
  <h1>Reset your password</h1>
  <a href="${href}">${href}</a>`;

  return send({
    email,
    html,
    subject: 'Reset password',
  });
}

function sendPasswordChangeNotification(email) {
  const html = `
    <h1>Password was successfully changed</h1>
    <p>Your password has been changed successfully.</p>
  `;

  return send({
    email,
    html,
    subject: 'Password changed',
  });
}

function sendEmailChangeNotification(oldEmail, email) {
  const html = `
    <h1>Email was successfully changed</h1>
    <p>Your email has been changed successfully.</p>
    <p>New email: ${email}</p>
  `;

  return send({
    email: oldEmail,
    html,
    subject: 'Email changed',
  });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendPasswordChangeNotification,
  sendEmailChangeNotification,
};
