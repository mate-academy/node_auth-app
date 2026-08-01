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

  const html = `
    <h1>Activate an account</h1>
    <a href="${href}">${href}</a>
  `;

  return send(email, 'Activate an account', html);
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;

  const html = `
    <h1>Reset password</h1>
    <a href="${href}">${href}</a>
  `;

  return send(email, 'Reset password', html);
}

function sendEmailChangeConfirmation(email, token) {
  const href = `${process.env.CLIENT_HOST}/change-email/${token}`;

  const html = `
    <h1>Confirm your new email</h1>
    <a href="${href}">${href}</a>
  `;

  return send(email, 'Confirm your new email', html);
}

function sendEmailChangeNotification(email, newEmail) {
  const html = `
    <h1>Your email is being changed</h1>
    <p>A request was made to change your email to ${newEmail}.</p>
    <p>If it wasn't you, please contact support.</p>
  `;

  return send(email, 'Email change notification', html);
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangeConfirmation,
  sendEmailChangeNotification,
};
