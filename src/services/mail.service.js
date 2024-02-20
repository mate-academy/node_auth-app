'use strict';

const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email, subject, html,
  });
};

const sendActivationEmail = ({ userId, email, activationToken }) => {
  const href = `${process.env.CLIENT_HOST}/confirmation/activate`
    + `?token=${activationToken}&id=${userId}`;
  const html = `
    <h1>Activate your account</h1>
    <a href=${href}>Follow this link to activate your account</a>
  `;

  return send({
    email, html, subject: 'Account activation',
  });
};

const sendResetEmail = ({ userId, email, resetToken }) => {
  const href = `${process.env.CLIENT_HOST}/confirmation/reset-password`
    + `?token=${resetToken}&id=${userId}`;
  const html = `
    <h1>Reset your password</h1>
    <a href=${href}>Follow this link to reset your password</a>
  `;

  return send({
    email, html, subject: 'Password reset',
  });
};

const sendPasswordChangedEmail = ({ email }) => {
  const href = `${process.env.CLIENT_HOST}/login`;
  const html = `
    <h1>Changed password</h1>
    <h3>Your password has been successfully changed</h3>
    <a href=${href}>Follow this link to login</a>
  `;

  return send({
    email, html, subject: 'Password changed',
  });
};

const sendNewEmailConfirmation = ({ userId, email, newEmailToken }) => {
  const href = `${process.env.CLIENT_HOST}/confirmation/change-email`
    + `?token=${newEmailToken}&id=${userId}&email=${email}`;
  const html = `
    <h1>Confirm your new email</h1>
    <a href=${href}>Follow this link to confirm your new email</a>
  `;

  return send({
    email, html, subject: 'Confirm new email',
  });
};

const sendEmailChangedEmail = ({ oldEmail }) => {
  const html = `
    <h1>Changed email</h1>
    <h3>Your email has been successfully changed</h3>
  `;

  return send({
    email: oldEmail, html, subject: 'Email changed',
  });
};

module.exports = {
  sendActivationEmail,
  sendResetEmail,
  sendPasswordChangedEmail,
  sendNewEmailConfirmation,
  sendEmailChangedEmail,
};
