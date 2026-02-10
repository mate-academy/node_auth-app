'use strict';

require('dotenv').config();

const nodemailer = require('nodemailer');

const createTransporter = async () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback para Ethereal (para testes)
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

let transporter;

const initTransporter = async () => {
  if (!transporter) {
    transporter = await createTransporter();
  }

  return transporter;
};

async function sendEmail({ to, subject, html }) {
  try {
    const transport = await initTransporter();
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || '"Auth App" <noreply@authapp.com>',
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    throw error;
  }
}

async function sendActivationEmail(email, token) {
  const link = `${process.env.CLIENT_URL || 'http://localhost:3000'}/activate/${token}`;
  const html = `
    <h1>Activate your account</h1>
    <p>Click <a href="${link}">here</a> to activate your account.</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Activate your account',
    html,
  });
}

async function sendPasswordResetEmail(email, token) {
  const link = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset/${token}`;
  const html = `
    <h1>Reset your password</h1>
    <p>Click <a href="${link}">here</a> to reset your password.</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset your password',
    html,
  });
}

async function sendEmailChangeNotification(oldEmail, newEmail) {
  const html = `<p>Your email has been changed to ${newEmail}.</p>`;

  return sendEmail({
    to: oldEmail,
    subject: 'Email change notification',
    html,
  });
}

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail,
  sendEmailChangeNotification,
};
