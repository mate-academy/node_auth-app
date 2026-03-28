import nodemailer from 'nodemailer';

interface EmailService {
  email: string;
  subject: string;
  html: string;
}

const options = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};
const transporter = nodemailer.createTransport(options);

function send({ email, subject, html }: EmailService) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email: string, activationToken: string) {
  const link = `${process.env.CLIENT_URL}/auth/activation/${email}/${activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send({ email, subject: 'Account activation', html });
}

function sendMessageToChangeEmail(email: string) {
  const html = `
    <h1>Email has been changed</h1>
  `;

  return send({ email, subject: 'Email has been changed', html });
}

function sendResetPasswordEmail(email: string, resetPasswordToken: string) {
  const link = `${process.env.CLIENT_URL}/auth/reset-password/${email}/${resetPasswordToken}`;
  const html = `
    <h1>Reset password</h1>
    <a href="${link}">${link}</a>
  `;

  return send({ email, subject: 'Reset password', html });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendMessageToChangeEmail,
};
