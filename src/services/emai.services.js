import nodemailer from 'nodemailer';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

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
  const href = `http://localhost:3005/activation/${token}`;
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
  const resetUrl = `http://localhost:3005/resetPassword/${token}`;
  const html = `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return send({
    email,
    html,
    subject: 'Reset password',
  });
}

function sendEmailChangedApprove(email, newEmail) {
  const token = jwt.sign({ email, newEmail }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  const href = `http://localhost:3005/changeEmailConfirm?token=${token}`;
  const html = `
  <h1>Email Changed to ${newEmail}</h1>
  To confirm: <a href="${href}">${href}</a>
  `;

  return send({
    email: newEmail,
    html,
    subject: 'Confirm Your Email Change',
  });
}

function sendEmailChangedInfo(email, newEmail) {
  const html = `
  <h1>Your Email Changed to ${newEmail}</h1>
  `;

  return send({
    email,
    html,
    subject: 'Email has been changed',
  });
}

export const emailService = {
  sendActivationEmail,
  send,
  sendResetPasswordEmail,
  sendEmailChangedApprove,
  sendEmailChangedInfo,
};
