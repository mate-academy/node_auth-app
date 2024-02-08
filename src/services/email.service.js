'use strict';

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

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
};

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;

  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email, html, subject: 'Activate',
  });
};

function sendConfirmationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/confirm-new-email/${token}`;

  const html = `
  <h1>Confirm new email</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email, html, subject: 'Confirmation new email',
  });
};

function sendNotifyingChangingEmail(email, newEmail) {
  const html = `
  <h3>This email will not use for studying service anymore</h3>
  <p>You can use new one ${newEmail}</p>
  `;

  return send({
    email, html, subject: 'Notifying about new email',
  });
};

function sendResettingPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;

  const html = `
  <h3>To reset your password for studying service click link below</h3>
  <a href="${href}">${href}</a>
  <p>If you didn't request resetting password please ignore it.</p>
  `;

  return send({
    email, html, subject: 'Resetting password',
  });
};

const emailService = {
  sendActivationEmail,
  send,
  sendConfirmationEmail,
  sendNotifyingChangingEmail,
  sendResettingPasswordEmail,
};

module.exports = { emailService };
