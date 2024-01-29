"use strict";
const nodemailer = require("nodemailer");

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
}

function sendActivationEmail (email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
    <h1>Activate account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    email, html,
    subject: 'Activate',
  })
}


function sendNewEmail(email, newEmail) {
  return send({
    email,
    subject: 'Email change',
    html: `
      <h1>You'r email was successfully changed.</h1>
      <p>New email is ${newEmail}</p>
    `,
  });
}

function sendResetPassword(email, token) {
  const link = `${process.env.CLIENT_URL}/reset-confirm/${token}`;

  return send({
    email,
    subject: 'Password reset',
    html: `
      <h1>Password reset</h1>
      <a href="${link}">${link}</a>
    `,
  });
}


module.exports = {
  send,
  sendActivationEmail,
  sendNewEmail,
  sendResetPassword,
}
