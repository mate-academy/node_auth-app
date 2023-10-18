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

function sendResetPasswordEmail(email, resetToken) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${resetToken}`;
  const html = `
    <h1>Reset your password</h1>
    <a href="${href}">${href}</a>
  `;
  return send({
    email,
    html,
    subject: 'Reset password',
  });
}

function sendNotification(oldEmail, newEmail) {
  const html = `
    <p>Your email <em>${oldEmail}</em> has been successfully changed to <em>${newEmail}</em>.</p>
  `;
  return send({
    email: oldEmail,
    html,
    subject: 'Email change',
  });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendNotification,
};
