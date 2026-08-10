import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function send({ email, subject, html }) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    text: '',
    html,
  });
}

export function sendActivationLink(email, token) {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  return send({
    email,
    subject: 'Account activation',
    html: `
      <h1>Account activation</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

export function sendResetLink(email, token) {
  const link = `${process.env.CLIENT_URL}/reset/${token}`;

  return send({
    email,
    subject: 'Reset password',
    html: `
      <h1>Password reset</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

export function sendEmailConfirmation(email) {
  return send({
    email,
    subject: 'Email change confirmed',
    html: `<h1>Your email has been changed!<h1>`,
  });
}

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

export const emailService = {
  send,
  sendActivationLink,
  sendResetLink,
  validateEmail,
  sendEmailConfirmation,
};
