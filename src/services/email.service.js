const nodemailer = require('nodemailer');

require('dotenv/config');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'boytrend@gmail.com',
    pass: 'jihy fjtu qwdy yckv',
  },
  tls: {
    rejectUnauthorized: false, // to avoid an error
  },
});

async function sendEmail({ subject, email, text, html }) {
  await transporter.sendMail({
    to: email,
    subject,
    text,
    html,
  });
}

async function sendActivationLink(email, token) {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  await sendEmail({
    subject: 'Activate an account',
    email,
    text: 'Click link below to activate account',
    html: `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `,
  });
}

async function sendResetPasswordLink(email, token) {
  const link = `${process.env.CLIENT_URL}/change-password/${token}`;

  await sendEmail({
    subject: 'Change password',
    email,
    text: 'Click link below to change password',
    html: `
    <h1>Change password</h1>
    <a href="${link}">${link}</a>
  `,
  });
}

module.exports = {
  sendActivationLink,
  sendEmail,
  sendResetPasswordLink,
};
