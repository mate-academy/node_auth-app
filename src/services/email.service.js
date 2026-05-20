import nodemailer from 'nodemailer';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Activate your account',
    html,
  });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
  <h1>Reset your password</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Reset your password',
    html,
  });
}

function sendNewEmailConfirmation(newEmail, token, oldEmail) {
  const href = `${process.env.CLIENT_HOST}/confirm-new-email/${token}`;
  const html = `
  <h1>Confirm your new email</h1>
  <p>You requested to change your email to ${newEmail}</p>
  <a href="${href}">${href}</a>
  `;

  return send({
    email: newEmail,
    subject: 'Confirm your new email',
    html,
  });
}

function sendEmailChangeNotification(email) {
  const html = `
  <h1>Email changed</h1>
  <p>Your email has been changed. If this was not you, please contact support.</p>
  `;

  return send({
    email,
    subject: 'Your email has been changed',
    html,
  });
}

function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

export const emailService = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendNewEmailConfirmation,
  sendEmailChangeNotification,
  send,
};
