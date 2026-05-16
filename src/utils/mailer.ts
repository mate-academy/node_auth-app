import 'dotenv/config';
import nodemailer from 'nodemailer';

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const API_URL = process.env.API_URL ?? 'http://localhost:3000';

if (!SMTP_USER || !SMTP_PASSWORD) {
  throw new Error('SMTP_USER or SMTP_PASSWORD is not defined');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
  tls:
    process.env.NODE_ENV === 'development'
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

transporter.verify((error) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

const send = (email: string, subject: string, html: string) => {
  return transporter.sendMail({
    from: `"Auth API" <${SMTP_USER}>`,
    to: email,
    subject,
    html,
  });
};

const sendActivationLink = (email: string, activationToken: string) => {
  const link = `${API_URL}/activate/${activationToken}`;

  const html = `
    <h1>Account activation</h1>
    <p>Please click the link below to activate your account:</p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
};

const sendPasswordResetLink = (email: string, resetToken: string) => {
  const link = `${API_URL}/reset-password/${resetToken}`;

  const html = `
    <h1>Password reset</h1>
    <p>Please click the link below to reset your password:</p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Password reset', html);
};

const sendEmailChangeConfirmation = (
  newEmail: string,
  emailChangeToken: string,
) => {
  const link = `${API_URL}/profile/email/confirm/${emailChangeToken}`;

  const html = `
    <h1>Email change confirmation</h1>
    <p>Please click the link below to confirm your new email:</p>
    <a href="${link}">${link}</a>
  `;

  return send(newEmail, 'Confirm email change', html);
};

const sendEmailChangeNotification = (oldEmail: string, newEmail: string) => {
  const html = `
    <h1>Email change requested</h1>
    <p>Your account email change was requested.</p>
    <p>New email: ${newEmail}</p>
    <p>If this was not you, please secure your account.</p>
  `;

  return send(oldEmail, 'Email change requested', html);
};

export const mailer = {
  send,
  sendActivationLink,
  sendPasswordResetLink,
  sendEmailChangeConfirmation,
  sendEmailChangeNotification,
};
