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

function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationMail(email, token) {
  const link = process.env.CLIENT_HOST + '/auth/activate/' + token;

  const html = `
    <h1>Activate account</h1>
    <p>Click for activation account <a target="_blank" href="${link}">${link}</a></p>
  `;

  return send({ email, html, subject: 'Activation email' });
}

function sendResetPasswordMail(email, token) {
  const link = process.env.CLIENT_HOST + '/auth/reset-password/' + token;

  const html = `
    <h1>Reset password</h1>
    <p>Click for reset password <a target="_blank" href="${link}">${link}</a></p>
  `;

  return send({ email, html, subject: 'Reset password email' });
}

function sendChangeEmailMessage(email, token) {
  const link = `${process.env.CLIENT_HOST}/profile/change-email/${token}`;

  const html = `
    <h1>Confirm email</h1>
    <p>Click for confirm email <a target="_blank" href="${link}">${link}</a></p>
  `;

  return send({ email, html, subject: 'Confirm new email' });
}

function sendEmailIsChanged(oldEmail, newEmail) {
  const html = `
    <h1>The email has been changed</h1>
    <p>Your email has been changed to ${newEmail}. If this wasn't you, please contact our support team — which doesn't actually exist. So please, just keep your passwords safe!</a></p>
  `;

  return send({ email: oldEmail, html, subject: 'Email has been changed' });
}

module.exports = {
  send,
  sendActivationMail,
  sendResetPasswordMail,
  sendChangeEmailMessage,
  sendEmailIsChanged,
};
