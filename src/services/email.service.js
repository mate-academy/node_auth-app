import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMPT_HOST,
  port: process.env.SMPT_PORT,
  auth: {
    user: process.env.SMPT_USER,
    pass: process.env.SMPT_PASSWORD,
  },
});

export async function send({ email, subject, html }) {
  await transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  const html = `
  <h1>Activate account</h1>
  <a href="${link}">${link}</a>
  `;

  send({
    email,
    html,
    subject: 'Activate',
  });
}

function sendResetPasswordEmail(email, token) {
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const html = `
  <h1>Reset Password</h1>
  <a href="${link}">${link}</a>
  `;

  send({
    email,
    html,
    subject: 'Reset Password',
  });
}

function sendEmailChangeNotification(oldEmail, newEmail) {
  send({
    email: oldEmail,
    subject: 'Email Change Notification',
    html: `
      <p>Your email has been changed to ${newEmail}.
      If this was not you, please contact support immediately.</p>
    `,
  });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangeNotification,
};
