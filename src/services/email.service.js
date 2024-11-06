import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function send({ email, subject, html }) {
  const verificationEmail = await transporter.sendMail({
    to: email,
    subject,
    html,
  });

  // eslint-disable-next-line no-console
  console.log('Message sent: %s', verificationEmail.messageId);
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>`;

  send({
    email,
    html,
    subject: 'Activate',
  });
}

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/pwdReset/${token}`;
  const html = `
  <h1>Reset password</h1>
  <p>Password reset requested. Click <a href="${href}">here</a> to reset your password.</p>`;

  send({
    email,
    html,
    subject: 'Reset password',
  });
}

export const emailService = {
  sendActivationEmail,
  sendResetEmail,
  send,
};
