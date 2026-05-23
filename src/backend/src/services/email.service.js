import 'dotenv/config';
import nodemailer from 'nodemailer';

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

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
  const html = `
  <h2>Activate account</h2>
  <a href="${href}">${href}</a>
  `;

  send({
    email,
    html,
    subject: 'Activate your account!',
  });
}

function sendResetPasswordEmail(email, resetToken) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${resetToken}`;
  const html = `
  <h2>Reset password</h2>
  <a href="${href}">${href}</a>
  `;

  send({
    email,
    html,
    subject: 'Reset your password!',
  });
}

function sendActivationNewEmail(email, emailChangeToken) {
  const href = `${process.env.CLIENT_HOST}/confirm-email-change/${emailChangeToken}`;
  const html = `
  <h2>Change email</h2>
  <a href="${href}">${href}</a>
  `;

  send({
    email,
    html,
    subject: 'Confirm email change!',
  });
}

function sendNotificationAboutEmailChange(oldEmail, newEmail) {
  const html = `
  <h2>Email changed</h2>

  <p>
    Your account email was changed from:<br />
    <strong>${oldEmail}</strong><br /><br />
    to:<br />
    <strong>${newEmail}</strong>
  </p>
`;

  send({
    email: oldEmail,
    html,
    subject: 'Your email address was changed',
  });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendActivationNewEmail,
  sendNotificationAboutEmailChange,
};
