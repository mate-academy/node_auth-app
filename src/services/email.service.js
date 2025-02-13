import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send(email, subject, html) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
}

function sendActivationLink(email, token) {
  const link = `${process.env.CLIENT_HOST}/activate/${email}/${token}`;
  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

function sendResetLink(email, token) {
  const link = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
  <div style="font-family: Arial, sans-serif; text-align: center;">
    <h1>Password Reset</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  </div>
`;

  return send(email, 'Password reset', html);
}

function sendNewEmailNotification(oldEmail, newEmail) {
  const html = `
  <div style="font-family: Arial, sans-serif; text-align: center;">
    <h1>Email Change Notification</h1>
    <p>Your email has been changed to <strong>${newEmail}</strong>.</p>
    <p>If this was you, no action is needed.</p>
    <p>If you did not request this change, please contact our support team immediately.</p>
  </div>
  `;

  return send(oldEmail, 'Your email has been changed', html);
}

export const emailService = {
  send,
  sendActivationLink,
  sendResetLink,
  sendNewEmailNotification,
};
