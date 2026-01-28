import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

function buildLink(path, token) {
  const base = env.APP_URL.replace(/\/+$/, '');

  return `${base}${path}?token=${encodeURIComponent(token)}`;
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const mailService = {
  async sendActivationEmail(to, token) {
    const link = buildLink('/auth/activate', token);

    await transporter.sendMail({
      from: env.SMTP_USER,
      to,
      subject: 'Activate your account',
      text: `Activate your account: ${link}`,
    });
  },

  async sendResetPasswordEmail(to, token) {
    const link = buildLink('/auth/password/reset-confirm', token);

    await transporter.sendMail({
      from: env.SMTP_USER,
      to,
      subject: 'Reset your password',
      text: `Reset your password: ${link}`,
    });
  },

  async sendChangeEmailConfirm(to, token) {
    const link = buildLink('/me/email/confirm', token);

    await transporter.sendMail({
      from: env.SMTP_USER,
      to,
      subject: 'Confirm your new email',
      text: `Confirm your new email: ${link}`,
    });
  },

  async sendChangeEmailNotifyOld(to, newEmail) {
    await transporter.sendMail({
      from: env.SMTP_USER,
      to,
      subject: 'Your email was changed',
      text: `Your email is being changed to: ${newEmail}. If this wasn’t you, contact support.`,
    });
  },
};
