import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.password,
  },
});

function send(to: string, subject: string, html: string) {
  return transporter.sendMail({
    from: `"Auth App" <${env.smtp.user}>`,
    to,
    subject,
    html,
  });
}

function sendActivationEmail(email: string, token: string) {
  const link = `${env.clientHost}/activate/${token}`;

  return send(
    email,
    'Activate your account',
    `
      <h1>Account activation</h1>
      <p>Click the link to activate your account:</p>
      <a href="${link}">${link}</a>
    `,
  );
}

function sendResetPasswordEmail(email: string, token: string) {
  const link = `${env.clientHost}/reset-password/${token}`;

  return send(
    email,
    'Password reset',
    `
      <h1>Password reset</h1>
      <p>Click the link to set a new password. It is valid for 1 hour.</p>
      <a href="${link}">${link}</a>
      <p>If you didn't request this, just ignore this email.</p>
    `,
  );
}

function sendEmailChangedNotice(oldEmail: string, newEmail: string) {
  return send(
    oldEmail,
    'Your email was changed',
    `
      <h1>Email changed</h1>
      <p>The email for your account was changed to <b>${newEmail}</b>.</p>
      <p>If you didn't do this, reset your password immediately.</p>
    `,
  );
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangedNotice,
};
