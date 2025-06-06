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

function send(email, subject, html) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
}

function sendActivationLink(email, activationToken) {
  const link = `${process.env.CLIENT_URL}/activation/${encodeURIComponent(email)}/${encodeURIComponent(activationToken)}`;
  const html = `
    <h1>Account activation</h1>
    <p>Please activate your accunt via this link: </p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

function sendResetLink(email, resetToken) {
  const link = `${process.env.CLIENT_URL}/reset/${encodeURIComponent(email)}/${encodeURIComponent(resetToken)}`;
  const html = `
    <h1>Reset password</h1>
    <p>Please follow the link and enter a new password: </p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Reset password', html);
}

export const mailer = {
  send,
  sendActivationLink,
  sendResetLink,
};
