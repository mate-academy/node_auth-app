import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject,
    text: '',
    html,
  });
}

function sendActivationMail(email, confirmEmailToken) {
  const link = `${process.env.CLIENT_URL}/activate/${confirmEmailToken}`;

  return send({
    email,
    subject: 'Account activation',
    html: `
      <h1>Account activation</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

function sendResetMail(email, confirmEmailToken) {
  const link = `${process.env.CLIENT_URL}/confirm/${confirmEmailToken}`;

  return send({
    email,
    subject: 'Reset your password',
    html: `
      <h1>Reset your password</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

function sendChangeMail(email) {
  return send({
    email,
    subject: 'Email removed',
    html: `
      <h1>Your email removed from app</h1>
    `,
  });
}

export const emailService = {
  sendActivationMail,
  sendResetMail,
  sendChangeMail,
};
