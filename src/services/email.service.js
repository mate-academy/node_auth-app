import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function send({ email, subject, html }) {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, activationToken) {
  const href = `${process.env.CLIENT_HOST}/activate/${activationToken}`;

  const html = `
    <h1>Activate account</h1>
    <p>Click the link below to activate your account:</p>
    <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Activate account',
    html,
  });
}

function sendResetPasswordEmail(email, resetToken) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${resetToken}`;

  const html = `
    <h1>Reset password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Reset password',
    html,
  });
}

function sendEmailChangedNotification(oldEmail, newEmail) {
  const html = `
    <h1>Email changed</h1>
    <p>Your account email was changed.</p>
    <p>New email: <b>${newEmail}</b></p>
  `;

  return send({
    email: oldEmail,
    subject: 'Your email was changed',
    html,
  });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangedNotification,
};
