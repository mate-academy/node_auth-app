const nodemailer = require('nodemailer');

require('dotenv/config');

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const sendEmail = ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
};

const sendActivationEmail = (email, token) => {
  const link = `${CLIENT_URL}/activate/${token}`;

  return sendEmail({
    email,
    subject: 'Account activation',
    html: `
      <h1>Activate account</h1>
      <a href="${link}">${link}</a>
    `,
  });
};

const sendResetPasswordEmail = (email, token) => {
  const link = `${CLIENT_URL}/reset-password/${token}`;

  return sendEmail({
    email,
    subject: 'Reset Password',
    html: `
      <h1>Reset your password</h1>
      <a href="${link}">${link}</a>
    `,
  });
};

const sendEmailChangeNotification = (email) => {
  return sendEmail({
    email,
    subject: 'Email Change Notification',
    html: `
      <h1>Your email was just changed</h1>
      <p>If you did not request this, please contact support immediately.</p>
    `,
  });
};

const sendEmailChangeConfirmation = (newEmail, token) => {
  const link = `${CLIENT_URL}/me/email/confirm/${token}`;

  return sendEmail({
    email: newEmail,
    subject: 'Confirm your new email',
    html: `
      <h1>Confirm your new email address</h1>
      <a href="${link}">${link}</a>
    `,
  });
};

module.exports = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangeNotification,
  sendEmailChangeConfirmation,
};
