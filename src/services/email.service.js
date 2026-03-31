'use strict';

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const FROM = process.env.EMAIL_FROM || '"Auth App" <no-reply@auth-app.com>';

export const sendActivation = async (email, token) => {
  const link = `${CLIENT_URL}/auth/activate/${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Activate your account',
    html: `
      <h1>Welcome!</h1>
      <p>Please activate your account by clicking the link below:</p>
      <a href="${link}">${link}</a>
      <p>This link will expire in 24 hours.</p>
    `,
  });
};

export const sendPasswordReset = async (email, token) => {
  const link = `${CLIENT_URL}/auth/reset-password/${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Reset your password',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${link}">${link}</a>
      <p>This link will expire in 1 hour. If you did not request a password reset, you can ignore this email.</p>
    `,
  });
};

export const sendEmailChangeNotice = async (oldEmail) => {
  await transporter.sendMail({
    from: FROM,
    to: oldEmail,
    subject: 'Your email address has been changed',
    html: `
      <h1>Email Change Notice</h1>
      <p>Your account email address has been changed. If you did not make this change, please contact support immediately.</p>
    `,
  });
};
