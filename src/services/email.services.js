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

function sendEmail(to, subject, html) {
  return transporter.sendMail({ to, subject, html });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;

  return sendEmail(
    email,
    'Account activation',
    `Activate your account: <a href="${href}">${href}</a>`,
  );
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/password-reset/${token}`;

  return sendEmail(email, 'Reset Password', `<a href="${href}">${href}</a>`);
}

function sendEmailChangedNotification(oldEmail, newEmail) {
  return sendEmail(
    oldEmail,
    'Email changed',
    `Your email was changed to ${newEmail}`,
  );
}

export const emailServices = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangedNotification,
};
