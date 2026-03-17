'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendActivationEmail(to, token) {
  const link = `${process.env.APP_URL}/activate/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Activate your account',
    html: `<p>Click the link to activate your account:</p>
           <a href="${link}">${link}</a>
           <p>The link expires in 24 hours.</p>`,
  });
}

async function sendPasswordResetEmail(to, token) {
  const link = `${process.env.APP_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password reset',
    html: `<p>Click the link to reset your password:</p>
           <a href="${link}">${link}</a>
           <p>The link expires in 1 hour.</p>`,
  });
}

async function sendEmailChangeNotification(oldEmail, newEmail, token) {
  const link = `${process.env.APP_URL}/profile/confirm-email-change/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: newEmail,
    subject: 'Confirm your new email',
    html: `<p>Click the link to confirm your new email address:</p>
           <a href="${link}">${link}</a>
           <p>The link expires in 1 hour.</p>`,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: oldEmail,
    subject: 'Your email address is being changed',
    html: `<p>A request was made to change your email address to <b>${newEmail}</b>.</p>
           <p>If this was not you, please contact support immediately.</p>`,
  });
}

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail,
  sendEmailChangeNotification,
};
