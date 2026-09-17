'use strict';

const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

function send(email, subject, html) {
  return transporter.sendMail({
    from: 'Auth App',
    to: email,
    subject,
    html,
  });
}

function sendActivationLink(email, activationToken) {
  const link = `${process.env.CLIENT_URL}/auth/activation/${activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

function sendResetPasswordLink(email, resetToken) {
  const link = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
  const html = `
    <h1>Reset Password</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Password Reset', html);
}

module.exports = {
  sendActivationLink,
  send,
  sendResetPasswordLink,
};
