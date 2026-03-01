import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export function send(email, subject, html) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
}

export function sendActivationLink(email, activationToken) {
  const link = `${process.env.CLIENT_URL}/auth/activate/${email}/${activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

export function sendResetPasswordLink(email, resetPasswordToken) {
  const link = `${process.env.CLIENT_URL}/auth/password-reset?token=${resetPasswordToken}`;
  const html = `
    <h1>Reset password for user: ${email}</h1>
    <h3>Click this <a href="${link}">link</a> and follow the instructions</h3>
  `;

  return send(email, 'Reset password', html);
}

export const mailer = {
  send,
  sendActivationLink,
  sendResetPasswordLink,
};
