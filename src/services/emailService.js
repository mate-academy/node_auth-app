'use strict';
require('dotenv').config();

const nodemailer = require('nodemailer');
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  CLIENT_URL,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

const send = async({ email, subject, html }) => {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    text: 'Something wrong with html',
    html,
  });
};

const sendActivationLink = (email, token) => {
  const link = `${CLIENT_URL}/activate/${token}`;

  return send({
    email,
    subject: 'Account activation',
    html: `
      <h1>Activation Link:</h1>
      <a href="${link}" target="_blank">${link}</a>
    `,
  });
};

module.exports = {
  send, sendActivationLink,
};
