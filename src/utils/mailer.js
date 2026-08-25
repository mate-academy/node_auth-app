'use strict';

const nodemailer = require('nodemailer');

let transporterPromise = null;

async function createTransporter() {
  if (!process.env.SMTP_USER) {
    const account = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass },
    });
  }

  const port = Number(process.env.SMTP_PORT);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }

  return transporterPromise;
}

async function send(email, subject, html) {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);

  if (previewUrl) {
    // eslint-disable-next-line no-console
    console.log(`Letter "${subject}" for ${email}: ${previewUrl}`);
  }

  return info;
}

function sendActivationLink(email, token) {
  const link = `${process.env.API_URL}/auth/activation/${email}/${token}`;

  return send(
    email,
    'Account activation',
    `
      <h1>Welcome!</h1>
      <p>Follow the link below to activate your account:</p>
      <a href="${link}">${link}</a>
    `,
  );
}

function sendResetPasswordLink(email, token) {
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

  return send(
    email,
    'Password reset',
    `
      <h1>Password reset</h1>
      <p>Follow the link below to set a new password:</p>
      <a href="${link}">${link}</a>
      <p>If you did not ask for it, just ignore this letter.</p>
    `,
  );
}

function sendEmailChangeConfirmation(newEmail, token) {
  const link = `${process.env.API_URL}/auth/email-change/${token}`;

  return send(
    newEmail,
    'Email confirmation',
    `
      <h1>Confirm your new email</h1>
      <p>Follow the link below to start using this address:</p>
      <a href="${link}">${link}</a>
    `,
  );
}

function sendEmailChangeNotification(oldEmail, newEmail) {
  return send(
    oldEmail,
    'Email change requested',
    `
      <h1>Email change requested</h1>
      <p>Somebody asked to change the email of your account to ${newEmail}.</p>
      <p>If it was not you, please change your password as soon as possible.</p>
    `,
  );
}

module.exports = {
  mailer: {
    send,
    sendActivationLink,
    sendResetPasswordLink,
    sendEmailChangeConfirmation,
    sendEmailChangeNotification,
  },
};
