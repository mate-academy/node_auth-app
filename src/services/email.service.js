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
// const info = await transporter.sendMail({
//   from: 'Auth API',
//   to: 'serado8127@inkight.com',
// });

export function send(email, subject, html) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
}

export function sendActivationLink(email, token) {
  const link = `${process.env.CLIENT_HOST}/activate/${email}/${token}`;
  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/pwdReset/${token}`;
  const html = `
  <h1>Reset password</h1>
  <p>Password reset requested. Click <a href="${href}">here</a> to reset your password.</p>`;

  send(email, 'Reset password', html);
}

export const emailService = {
  send,
  sendActivationLink,
  sendResetEmail,
};
