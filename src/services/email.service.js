require('dotenv/config');

const nodemailer = require('nodemailer');

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

function sendActivationEmail({ email, activationToken }) {
  const href = `${process.env.CLIENT_HOST}/activate/${activationToken}`;
  const html = `
    <h1>Activate account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({ email, subject: 'Auth App / Activate', html });
}

function sendResetPasswordEmail({ email, resetPasswordToken }) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${resetPasswordToken}`;
  const html = `
    <h1>Reset password</h1>
    <p>A request has been made to reset your password. If you made this request, please click on the link below</p>
    <a href="${href}">${href}</a>
  `;

  return send({ email, subject: 'Auth App / Reset password', html });
}

function sendConfirmNewEmail({ email, newEmail, confirmNewEmailToken }) {
  const href = `${process.env.CLIENT_HOST}/change-email/${confirmNewEmailToken}`;
  const html = `
    <h1>Confirm your new email address</h1>
    <p>To change your email in your Auth App account from ${email} to this one, follow the link below</p>
    <a href="${href}">${href}</a>
  `;

  return send({
    email: newEmail,
    subject: 'Auth App / Confirm new email',
    html,
  });
}

function sendNotificationToOldEmail({ email, newEmail }) {
  const html = `
    <h1>Email will be changed</h1>
    <p>The mail to your Auth App account will be changed to ${newEmail}.</p>
    <p>The changes will take place when you click on the confirmation link in the new mail.</p>
  `;

  return send({ email, subject: 'Auth app / Email will be changed', html });
}

const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendNotificationToOldEmail,
  sendConfirmNewEmail,
};

module.exports = { emailService };
