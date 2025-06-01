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

export function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
  const html = `
  <h1> Activate account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate',
  });
}

function sendEmailChangeNotification(oldEmail, newEmail) {
  const html = `
  <h1>Your email was changed</h1>
  <p>Your account email was changed to: ${newEmail}</p>
  <p>If you did not perform this action, please contact support immediately.</p> 
  `;

  return send({
    email: oldEmail,
    html,
    subject: 'Your email was changed',
  });
}

function sendEmailChangeConfirmation(email, resetToken) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${resetToken}`;
  const html = `
      <div>
        <h1>Reset your password</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${href}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this reset, please ignore this email.</p>
      </div>
    `;

  return send({
    email,
    html,
    subject: 'Confirm your new email address',
  });
}

export const emailService = {
  sendActivationEmail,
  sendEmailChangeConfirmation,
  sendEmailChangeNotification,
  send,
};
