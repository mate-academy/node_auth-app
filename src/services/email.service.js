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
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activation account</h1>
  <a href="${href}">${href}</a>`;

  return send({
    email,
    html,
    subject: 'Activation account',
  });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password-confirm/${token}`;
  const html = `
  <h1>Password reset</h1>
  <a href="${href}">${href}</a>`;

  return send({
    email,
    html,
    subject: 'Do you want to reset password?',
  });
}

function sendChangeEmail(email) {
  const href = `${process.env.CLIENT_HOST}/user/updateEmail-confirm/${email}`;
  const html = `
  <h1>Activation new email</h1>
  <a href="${href}">${href}</a>`;

  return send({
    email,
    html,
    subject: 'Change email',
  });
}

function sendNotificationToOldEmail(email, newEmail) {
  const html = `
  <h1>This email is no longer in use</h1>
  <p>New email is ${newEmail}</p>
  `;

  return send({
    email,
    html,
    subject: 'Email was changed',
  });
}

module.exports = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendChangeEmail,
  sendNotificationToOldEmail,
};
