import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send(email: string, subject: string, html: string) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
}

function sendActivationLink(email: string, activationToken: string) {
  const link = `${process.env.CLIENT_URL}/activate/${email}/${activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

function sendResetPasswordLink(email: string, token: string) {
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const html = `
    <h1>Resetting password</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Resetting password', html);
}

function sendChangingEmail(oldEmail: string, newEmail: string) {
  const html = `
    <h1>Changing Email</h1>
    <p>Your email was changed from ${oldEmail} to ${newEmail}.</p>
  `;

  return send(oldEmail, 'Changing Email', html);
}

export const mailer = {
  send,
  sendActivationLink,
  sendResetPasswordLink,
  sendChangingEmail,
};
