'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

function send(email, subject, html) {
  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject,
    html,
  });
}

function sendActivationLink(email, token) {
  const link = `${process.env.CLIENT_URL}/activate/${email}/${token}`;

  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

function sendResetLink(email, token) {
  const link = `${process.env.CLIENT_URL}/reset-password/${email}/${token}`;

  const html = `
    <h1>Account reset password</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Reset password', html);
}

function sendEmailChangeLink(email, token) {
  const link = `${process.env.CLIENT_URL}/reset-email/${email}/${token}`;

  const html = `
    <h1>Confirm  new email</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Confirm-email', html);
}

function sendEmailChangedNotice(oldEmail, newEmail) {
  const html = `
  <h1>Your email was changed</h1>
  <p>If it wasn't you, contact with support</p>
  <p>Your new email: ${newEmail}</p>`;

  return send(oldEmail, 'New-email', html);
}

module.exports = {
  send,
  sendActivationLink,
  sendResetLink,
  sendEmailChangeLink,
  sendEmailChangedNotice,
};
