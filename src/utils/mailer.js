'use strict';

const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send(email, subject, html) {
  return transporter.sendMail({
    from: `"Auth API" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });
}

function sendActivationLink(email, activationToken) {
  const link = `${process.env.CLIENT_URL}/#/auth/activation/${email}/${activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <p>Please click the link below to activate your account:</p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

const mailer = {
  send,
  sendActivationLink,
};

module.exports = {
  mailer,
};
