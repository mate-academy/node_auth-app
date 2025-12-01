import nodemailer from 'nodemailer';
import 'dotenv/config';

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({ to: email, subject, html });
}

async function sendActivationMail(email, token) {
  const activationLink = `${process.env.CLIENT_HOST}/activation/${token}`;
  const html = `
  <h1>Activation link</h1>
  <a href=${activationLink}>${activationLink}</a>
  `;

  return send({
    email,
    subject: 'Activate',
    html,
  });
}

async function sendResetPasswordMail(email, token) {
  const resetLink = `${process.env.CLIENT_HOST}/password/reset/${token}`;
  const html = `
  <h1>Reset you password, click below</h1>
  <a href=${resetLink}>Reset Password</a>`;

  return send({
    email,
    subject: 'Reset Password',
    html,
  });
}

export const emailService = {
  sendActivationMail,
  send,
  sendResetPasswordMail,
};
