import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const send = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    to,
    subject,
    text,
    html,
  });
};

const sendActivationMail = ({ email, activationToken }) => {
  const href = `${process.env.CLIENT_HOST}/activate/${activationToken}`;
  const html = `
    <h1>Activate your account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    to: email,
    subject: 'Activate your account',
    text: 'Activate your account',
    html,
  });
};

const sendResetPasswordMail = ({ email, resetToken }) => {
  const href = `${process.env.CLIENT_HOST}/reset-password/${resetToken}`;
  const html = `
    <h1>Reset your password</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    to: email,
    subject: 'Reset your password',
    text: 'Reset your password',
    html,
  });
};

const sendEmailChangedNotification = ({ oldEmail, newEmail }) => {
  const html = `
    <h1>Your email was changed</h1>
    <p>Your email was changed from <b>${oldEmail}</b> to <b>${newEmail}<b/></p>
  `;

  return send({
    to: oldEmail,
    subject: 'Email changed',
    text: 'Email changed',
    html,
  });
};

export const emailService = {
  send,
  sendActivationMail,
  sendResetPasswordMail,
  sendEmailChangedNotification,
};
