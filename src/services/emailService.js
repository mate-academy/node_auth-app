import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function send({ email, subject, html }) {
  return transporter.sendMail({
    from: 'Auth API', // sender address
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

export const emailService = { send, sendActivationLink, sendResetEmail };
