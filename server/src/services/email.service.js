import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export function sendEmail(email, subject, html) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${email}/${token}`;
  const html = `
    <h1>Activate account</h1>
    <a href="${href}">Click here to activate</a>
  `;

  return sendEmail(email, 'Activate account', html);
}

function sendEmailConfirmation(email, token) {
  const href = `${process.env.CLIENT_HOST}/confirm-email/${token}`;
  const html = `
    <h1>Email change confirmation</h1>
    <p>You have requested an email address change. Click the link below to confirm:</p>
    <a href="${href}">Confirm new email</a>
    <p><small>If you did not order this, simply ignore this email..</small></p>
  `;

  return sendEmail(email, 'Email change confirmation', html);
}

function sendEmailChangeNotification(email, newEmail) {
  const html = `
    <h1>Request to change email</h1>
    <p>A change of address request has been created on your account.<strong>${newEmail}</strong>.</p>
    <p style="color: red;">If you did NOT do this, change your password immediately and contact support..</p>
  `;

  return sendEmail(email, 'Security notification: Email change', html);
}

function sendPasswordResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;

  const html = `
    <h1>Password reset</h1>
    <p>You have requested a password reset for your account. Click the link below to set a new password:</p>
    <a href="${href}">Set a new password</a>
    <p><small>If you did not request this, simply ignore this email. Your password will remain unchanged..</small></p>
  `;

  return sendEmail(email, 'Password reset', html);
}

export const emailService = {
  sendActivationEmail,
  sendEmail,
  sendEmailConfirmation,
  sendEmailChangeNotification,
  sendPasswordResetEmail,
};
