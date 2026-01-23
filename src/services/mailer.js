'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendActivationEmail(to, activationToken) {
  const link = `${process.env.CLIENT_URL}/activate/${activationToken}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Activate your account',
    text: `Activate: ${link}`,
    html: `<p>Activate your account:</p><a href="${link}">${link}</a>`,
  });
}

async function sendResetPasswordEmail(to, resetToken) {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Reset password',
    text: `Reset password: ${link}`,
    html: `<p>Reset password:</p><a href="${link}">${link}</a>`,
  });
}

async function sendEmailChangedNotice(toOldEmail, newEmail) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: toOldEmail,
    subject: 'Email changed',
    text: `Your email was changed to: ${newEmail}`,
    html: `<p>Your email was changed to:</p><b>${newEmail}</b>`,
  });
}

module.exports = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangedNotice,
};
